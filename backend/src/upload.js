import multer from "multer";
import crypto from "node:crypto";
import path from "node:path";
import fs from "node:fs";
import { config } from "./config.js";
import { HttpError } from "./errors.js";

export const UPLOAD_DIR = path.join(import.meta.dirname, "..", "uploads");
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const ALLOWED_IMAGE_TYPES = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/gif": ".gif",
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) =>
    cb(null, crypto.randomBytes(16).toString("hex") + (ALLOWED_IMAGE_TYPES[file.mimetype] || "")),
});

export const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter: (req, file, cb) => {
    if (!ALLOWED_IMAGE_TYPES[file.mimetype]) {
      return cb(new HttpError(400, "Unsupported image type. Use JPEG, PNG, WEBP, or GIF."));
    }
    cb(null, true);
  },
});

export function fileUrl(filename) {
  return `${config.publicBaseUrl}/uploads/${filename}`;
}

export function removeImageFile(imageUrl) {
  if (!imageUrl) return;
  try {
    const filename = path.basename(new URL(imageUrl).pathname);
    fs.rmSync(path.join(UPLOAD_DIR, filename), { force: true });
  } catch {
    // best-effort
  }
}
