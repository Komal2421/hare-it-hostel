import express from "express";
import multer from "multer";
import crypto from "node:crypto";
import path from "node:path";
import fs from "node:fs";
import { query } from "../db.js";
import { config } from "../config.js";
import { authMiddleware } from "../auth.js";
import { HttpError } from "../errors.js";
import { asyncHandler } from "../utils.js";

const router = express.Router();

const UPLOAD_DIR = path.join(import.meta.dirname, "..", "..", "uploads");
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const ALLOWED_IMAGE_TYPES = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/gif": ".gif",
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => {
    const ext = ALLOWED_IMAGE_TYPES[file.mimetype] || "";
    cb(null, crypto.randomBytes(16).toString("hex") + ext);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter: (req, file, cb) => {
    if (!ALLOWED_IMAGE_TYPES[file.mimetype]) {
      return cb(new HttpError(400, "Unsupported image type. Use JPEG, PNG, WEBP, or GIF."));
    }
    cb(null, true);
  },
});

function serialize(row) {
  return {
    id: row.id,
    item: row.item,
    price: Number(row.price),
    image: row.image_url,
    seller: row.name,
    hostel: row.hostel,
    contact: row.contact,
    owner_id: row.owner_id,
    created_at: row.created_at,
  };
}

function removeImageFile(imageUrl) {
  try {
    const filename = path.basename(new URL(imageUrl).pathname);
    fs.rmSync(path.join(UPLOAD_DIR, filename), { force: true });
  } catch {
    // ignore — best effort cleanup
  }
}

router.get(
  "/",
  asyncHandler(async (req, res) => {
    const { rows } = await query(
      `SELECT s.id, s.item, s.price, s.image_url, s.owner_id, s.created_at, u.name, u.hostel, u.contact
       FROM sell_items s
       JOIN users u ON u.id = s.owner_id
       ORDER BY s.created_at DESC`
    );
    res.json(rows.map(serialize));
  })
);

router.post(
  "/",
  authMiddleware,
  upload.single("image"),
  asyncHandler(async (req, res) => {
    const item = String(req.body?.item || "").trim();
    const price = Number(req.body?.price);

    const fail = (status, detail) => {
      if (req.file) fs.rmSync(path.join(UPLOAD_DIR, req.file.filename), { force: true });
      throw new HttpError(status, detail);
    };

    if (!item) fail(422, "Item name is required");
    if (!Number.isFinite(price) || price <= 0) fail(422, "Price must be a positive number");
    if (!req.file) throw new HttpError(400, "Image file is required");

    const imageUrl = `${config.publicBaseUrl}/uploads/${req.file.filename}`;
    const { rows } = await query(
      `INSERT INTO sell_items (item, price, image_url, owner_id)
       VALUES ($1, $2, $3, $4)
       RETURNING id, item, price, image_url, owner_id, created_at`,
      [item, price, imageUrl, req.user.id]
    );

    res.status(201).json(
      serialize({
        ...rows[0],
        name: req.user.name,
        hostel: req.user.hostel,
        contact: req.user.contact,
      })
    );
  })
);

router.delete(
  "/:id",
  authMiddleware,
  asyncHandler(async (req, res) => {
    const { rows } = await query(
      `DELETE FROM sell_items WHERE id = $1 AND owner_id = $2 RETURNING image_url`,
      [Number(req.params.id), req.user.id]
    );
    if (rows.length === 0) {
      throw new HttpError(404, "Item not found or not yours to delete");
    }
    removeImageFile(rows[0].image_url);
    res.status(204).end();
  })
);

export default router;
