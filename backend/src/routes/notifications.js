import express from "express";
import { query } from "../db.js";
import { authMiddleware } from "../auth.js";
import { asyncHandler } from "../utils.js";
import { seller, relativeTime } from "../serialize.js";

const router = express.Router();

router.get(
  "/",
  authMiddleware,
  asyncHandler(async (req, res) => {
    const { rows } = await query(
      `SELECT n.*,
              u.id AS u_id, u.name AS u_name, u.rating AS u_rating, u.reviews AS u_reviews,
              u.verified AS u_verified, u.avatar AS u_avatar
       FROM notifications n
       LEFT JOIN users u ON u.id = n.actor_id
       WHERE n.user_id = $1
       ORDER BY n.created_at DESC
       LIMIT 30`,
      [req.user.id]
    );
    res.json(
      rows.map((row) => {
        const s = seller(row);
        return {
          id: row.id,
          who: s.name,
          av: s.av,
          verified: s.verified,
          kind: row.kind,
          text: row.text,
          read: row.read,
          time: relativeTime(row.created_at),
        };
      })
    );
  })
);

router.post(
  "/read",
  authMiddleware,
  asyncHandler(async (req, res) => {
    await query("UPDATE notifications SET read = true WHERE user_id = $1 AND read = false", [
      req.user.id,
    ]);
    res.json({ ok: true });
  })
);

export default router;
