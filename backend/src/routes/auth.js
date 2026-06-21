import express from "express";
import { query } from "../db.js";
import {
  authMiddleware,
  createAccessToken,
  hashPassword,
  publicUser,
  verifyPassword,
} from "../auth.js";
import { HttpError } from "../errors.js";
import { asyncHandler } from "../utils.js";
import { AVATARS, pick } from "../serialize.js";

const router = express.Router();

router.post(
  "/register",
  asyncHandler(async (req, res) => {
    const { name, campus, contact, password } = req.body || {};
    if (!name || !contact || !password) {
      throw new HttpError(422, "Name, contact and password are required");
    }
    const cleanContact = String(contact).trim();
    if (!/^[0-9]{10}$/.test(cleanContact)) {
      throw new HttpError(422, "Enter a valid 10-digit contact number");
    }
    if (String(password).length < 4) {
      throw new HttpError(422, "Password must be at least 4 characters");
    }

    const existing = await query("SELECT id FROM users WHERE contact = $1", [cleanContact]);
    if (existing.rows.length > 0) {
      throw new HttpError(409, "An account with this contact number already exists");
    }

    const cleanName = String(name).trim();
    const { rows } = await query(
      `INSERT INTO users (name, campus, contact, password_hash, avatar)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, name, campus, contact, avatar, rating, reviews, deals, verified, created_at`,
      [
        cleanName,
        String(campus || "IIT Bombay · Hostel 12").trim(),
        cleanContact,
        await hashPassword(String(password)),
        pick(AVATARS, cleanName),
      ]
    );

    const user = rows[0];
    res.status(201).json({
      access_token: createAccessToken(user.id),
      token_type: "bearer",
      user: publicUser(user),
    });
  })
);

router.post(
  "/login",
  asyncHandler(async (req, res) => {
    const { contact, password } = req.body || {};
    if (!contact || !password) {
      throw new HttpError(422, "Contact number and password are required");
    }
    const { rows } = await query("SELECT * FROM users WHERE contact = $1", [
      String(contact).trim(),
    ]);
    const user = rows[0];
    if (!user || !(await verifyPassword(String(password), user.password_hash))) {
      throw new HttpError(401, "Invalid contact number or password");
    }
    res.json({
      access_token: createAccessToken(user.id),
      token_type: "bearer",
      user: publicUser(user),
    });
  })
);

router.get(
  "/me",
  authMiddleware,
  asyncHandler(async (req, res) => {
    res.json(publicUser(req.user));
  })
);

router.patch(
  "/me",
  authMiddleware,
  asyncHandler(async (req, res) => {
    const b = req.body || {};
    const name = b.name !== undefined ? String(b.name).trim() : req.user.name;
    const campus = b.campus !== undefined ? String(b.campus).trim() : req.user.campus;
    const avatar = b.avatar !== undefined ? String(b.avatar).trim() : req.user.avatar;
    if (!name) throw new HttpError(422, "Name is required");
    if (!campus) throw new HttpError(422, "Campus is required");
    const { rows } = await query(
      `UPDATE users SET name = $1, campus = $2, avatar = $3 WHERE id = $4
       RETURNING id, name, campus, contact, avatar, rating, reviews, deals, verified, created_at`,
      [name, campus, avatar, req.user.id]
    );
    res.json(publicUser(rows[0]));
  })
);

export default router;
