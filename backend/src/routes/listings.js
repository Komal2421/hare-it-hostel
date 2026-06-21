import express from "express";
import fs from "node:fs";
import path from "node:path";
import { query } from "../db.js";
import { authMiddleware, optionalAuth } from "../auth.js";
import { HttpError } from "../errors.js";
import { asyncHandler } from "../utils.js";
import { seller, pick, TINTS } from "../serialize.js";
import { upload, UPLOAD_DIR, fileUrl, removeImageFile } from "../upload.js";
import { notify } from "../notify.js";

const router = express.Router();

const SELECT = `
  SELECT l.*,
         u.id AS u_id, u.name AS u_name, u.rating AS u_rating, u.reviews AS u_reviews,
         u.verified AS u_verified, u.avatar AS u_avatar,
         ($UID = ANY(COALESCE(w.users, '{}'))) AS wished,
         ($UID = ANY(COALESCE(pr.users, '{}'))) AS requested
  FROM listings l
  JOIN users u ON u.id = l.owner_id
  LEFT JOIN (SELECT listing_id, array_agg(user_id) AS users FROM wishlist GROUP BY listing_id) w
    ON w.listing_id = l.id
  LEFT JOIN (SELECT listing_id, array_agg(user_id) AS users FROM purchase_requests GROUP BY listing_id) pr
    ON pr.listing_id = l.id
`;

function serialize(row) {
  return {
    id: row.id,
    title: row.title,
    cat: row.cat,
    price: Number(row.price),
    unit: row.unit,
    sub: row.sub,
    cond: row.condition,
    loc: row.location,
    dist: row.distance,
    desc: row.description,
    image: row.image_url,
    tint: row.tint,
    label: row.label || row.title.toUpperCase(),
    nearby: row.nearby,
    owner_id: row.owner_id,
    wished: row.wished || false,
    requested: row.requested || false,
    seller: seller(row),
    created_at: row.created_at,
  };
}

router.get(
  "/",
  optionalAuth,
  asyncHandler(async (req, res) => {
    const uid = req.user ? req.user.id : 0;
    const { rows } = await query(
      SELECT.replaceAll("$UID", "$1") + " ORDER BY l.created_at DESC",
      [uid]
    );
    res.json(rows.map(serialize));
  })
);

router.get(
  "/:id",
  optionalAuth,
  asyncHandler(async (req, res) => {
    const uid = req.user ? req.user.id : 0;
    const { rows } = await query(
      SELECT.replaceAll("$UID", "$1") + " WHERE l.id = $2",
      [uid, Number(req.params.id)]
    );
    if (rows.length === 0) throw new HttpError(404, "Listing not found");
    res.json(serialize(rows[0]));
  })
);

router.post(
  "/",
  authMiddleware,
  upload.single("image"),
  asyncHandler(async (req, res) => {
    const b = req.body || {};
    const fail = (msg) => {
      if (req.file) fs.rmSync(path.join(UPLOAD_DIR, req.file.filename), { force: true });
      throw new HttpError(422, msg);
    };
    const title = String(b.title || "").trim();
    const cat = String(b.cat || "").trim();
    if (!title) fail("Item name is required");
    if (!["borrow", "lend", "buy", "sell"].includes(cat)) fail("Pick a valid category");

    const isFree = cat === "lend";
    const price = isFree ? 0 : Number(b.price || 0);
    if (!isFree && (!Number.isFinite(price) || price <= 0)) fail("Enter a valid price");

    const unit = cat === "borrow" ? "/day" : "";
    const imageUrl = req.file ? fileUrl(req.file.filename) : null;

    const { rows } = await query(
      `INSERT INTO listings
        (owner_id, title, cat, price, unit, sub, condition, location, distance,
         description, image_url, tint, label, nearby)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,true)
       RETURNING id`,
      [
        req.user.id,
        title,
        cat,
        price,
        unit,
        String(b.sub || "").trim(),
        String(b.condition || "Good").trim(),
        String(b.location || req.user.campus).trim(),
        String(b.distance || "Nearby").trim(),
        String(b.description || "").trim(),
        imageUrl,
        pick(TINTS, title),
        title.toUpperCase().slice(0, 20),
      ]
    );

    await query(`UPDATE users SET deals = deals + 1 WHERE id = $1`, [req.user.id]);
    const verb = cat === "lend" || cat === "borrow" ? "is lending" : "listed";
    const tail = cat === "lend" || cat === "borrow" ? "" : " for sale";
    await query(
      `INSERT INTO activity (actor_id, verb, item, tail, link_id) VALUES ($1,$2,$3,$4,$5)`,
      [req.user.id, verb, title, tail, rows[0].id]
    );

    const { rows: full } = await query(SELECT.replaceAll("$UID", "$1") + " WHERE l.id = $2", [
      req.user.id,
      rows[0].id,
    ]);
    res.status(201).json(serialize(full[0]));
  })
);

// owner edits their listing (optional new image)
router.patch(
  "/:id",
  authMiddleware,
  upload.single("image"),
  asyncHandler(async (req, res) => {
    const id = Number(req.params.id);
    const b = req.body || {};
    const fail = (status, msg) => {
      if (req.file) fs.rmSync(path.join(UPLOAD_DIR, req.file.filename), { force: true });
      throw new HttpError(status, msg);
    };

    const owned = await query("SELECT * FROM listings WHERE id = $1 AND owner_id = $2", [
      id,
      req.user.id,
    ]);
    if (owned.rows.length === 0) fail(404, "Listing not found or not yours");
    const cur = owned.rows[0];

    const title = b.title !== undefined ? String(b.title).trim() : cur.title;
    const cat = b.cat !== undefined ? String(b.cat).trim() : cur.cat;
    if (!title) fail(422, "Item name is required");
    if (!["borrow", "lend", "buy", "sell"].includes(cat)) fail(422, "Pick a valid category");
    const isFree = cat === "lend";
    const price = isFree ? 0 : Number(b.price !== undefined ? b.price : cur.price);
    if (!isFree && (!Number.isFinite(price) || price <= 0)) fail(422, "Enter a valid price");
    const unit = cat === "borrow" ? "/day" : "";

    let imageUrl = cur.image_url;
    if (req.file) {
      imageUrl = fileUrl(req.file.filename);
      removeImageFile(cur.image_url);
    }

    await query(
      `UPDATE listings SET title=$1, cat=$2, price=$3, unit=$4, sub=$5, condition=$6,
         location=$7, description=$8, image_url=$9, label=$10 WHERE id=$11`,
      [
        title,
        cat,
        price,
        unit,
        b.sub !== undefined ? String(b.sub).trim() : cur.sub,
        b.condition !== undefined ? String(b.condition).trim() : cur.condition,
        b.location !== undefined ? String(b.location).trim() : cur.location,
        b.description !== undefined ? String(b.description).trim() : cur.description,
        imageUrl,
        title.toUpperCase().slice(0, 20),
        id,
      ]
    );

    const { rows } = await query(SELECT.replaceAll("$UID", "$1") + " WHERE l.id = $2", [
      req.user.id,
      id,
    ]);
    res.json(serialize(rows[0]));
  })
);

// detail "Buy now / Borrow now" -> toggle a request to the owner
router.post(
  "/:id/request",
  authMiddleware,
  asyncHandler(async (req, res) => {
    const id = Number(req.params.id);
    const exists = await query(
      "SELECT 1 FROM purchase_requests WHERE listing_id = $1 AND user_id = $2",
      [id, req.user.id]
    );
    if (exists.rows.length) {
      await query("DELETE FROM purchase_requests WHERE listing_id = $1 AND user_id = $2", [
        id,
        req.user.id,
      ]);
      res.json({ requested: false });
    } else {
      await query("INSERT INTO purchase_requests (listing_id, user_id) VALUES ($1, $2)", [
        id,
        req.user.id,
      ]);
      const { rows } = await query("SELECT owner_id, title, cat FROM listings WHERE id = $1", [id]);
      if (rows[0]) {
        const verb = rows[0].cat === "buy" || rows[0].cat === "sell" ? "buy" : "borrow";
        await notify({
          userId: rows[0].owner_id,
          actorId: req.user.id,
          kind: "request",
          text: `wants to ${verb} your “${rows[0].title}”`,
        });
      }
      res.json({ requested: true });
    }
  })
);

router.delete(
  "/:id",
  authMiddleware,
  asyncHandler(async (req, res) => {
    const { rows } = await query(
      "DELETE FROM listings WHERE id = $1 AND owner_id = $2 RETURNING image_url",
      [Number(req.params.id), req.user.id]
    );
    if (rows.length === 0) throw new HttpError(404, "Listing not found or not yours");
    removeImageFile(rows[0].image_url);
    res.status(204).end();
  })
);

export default router;
