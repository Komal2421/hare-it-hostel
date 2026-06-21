import express from "express";
import { query } from "../db.js";
import { authMiddleware } from "../auth.js";
import { HttpError } from "../errors.js";
import { asyncHandler } from "../utils.js";
import { relativeTime, pick, TINTS } from "../serialize.js";
import { upload, fileUrl } from "../upload.js";
import { notify } from "../notify.js";

const router = express.Router();

function serialize(row) {
  return {
    id: row.id,
    type: row.type,
    title: row.title,
    where: row.place,
    label: row.label || row.title.toUpperCase(),
    tint: row.tint,
    image: row.image_url,
    user_id: row.user_id,
    time: relativeTime(row.created_at),
    created_at: row.created_at,
  };
}

router.get(
  "/",
  asyncHandler(async (req, res) => {
    const { rows } = await query("SELECT * FROM lostfound ORDER BY created_at DESC");
    res.json(rows.map(serialize));
  })
);

router.post(
  "/",
  authMiddleware,
  upload.single("image"),
  asyncHandler(async (req, res) => {
    const b = req.body || {};
    const type = b.type === "found" ? "found" : "lost";
    const title = String(b.title || "").trim();
    if (!title) throw new HttpError(422, "Describe the item");

    const { rows } = await query(
      `INSERT INTO lostfound (user_id, type, title, place, label, tint, image_url)
       VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
      [
        req.user.id,
        type,
        title,
        String(b.place || "").trim(),
        title.toUpperCase().slice(0, 20),
        pick(TINTS, title),
        req.file ? fileUrl(req.file.filename) : null,
      ]
    );
    res.status(201).json(serialize(rows[0]));
  })
);

router.post(
  "/:id/respond",
  authMiddleware,
  asyncHandler(async (req, res) => {
    const id = Number(req.params.id);
    const exists = await query("SELECT user_id, type, title FROM lostfound WHERE id = $1", [id]);
    if (!exists.rows.length) throw new HttpError(404, "Item not found");
    await query(
      `INSERT INTO lostfound_responses (lostfound_id, user_id) VALUES ($1,$2)
       ON CONFLICT DO NOTHING`,
      [id, req.user.id]
    );
    await notify({
      userId: exists.rows[0].user_id,
      actorId: req.user.id,
      kind: "lostfound",
      text: `responded to your ${exists.rows[0].type} item “${exists.rows[0].title}”`,
    });
    res.json({ ok: true });
  })
);

export default router;
