import express from "express";
import { query } from "../db.js";
import { authMiddleware } from "../auth.js";
import { HttpError } from "../errors.js";
import { asyncHandler } from "../utils.js";
import { seller, relativeTime } from "../serialize.js";

const router = express.Router();

async function participantOr403(convId, userId) {
  const { rows } = await query("SELECT * FROM conversations WHERE id = $1", [convId]);
  const c = rows[0];
  if (!c || (c.user_a !== userId && c.user_b !== userId)) {
    throw new HttpError(404, "Conversation not found");
  }
  return c;
}

// list my conversations
router.get(
  "/",
  authMiddleware,
  asyncHandler(async (req, res) => {
    const me = req.user.id;
    const { rows } = await query(
      `SELECT c.id, c.last_at,
              u.id AS u_id, u.name AS u_name, u.rating AS u_rating, u.reviews AS u_reviews,
              u.verified AS u_verified, u.avatar AS u_avatar,
              (SELECT body FROM messages m WHERE m.conversation_id = c.id ORDER BY m.created_at DESC LIMIT 1) AS last_body,
              (SELECT COUNT(*) FROM messages m WHERE m.conversation_id = c.id AND m.sender_id <> $1 AND m.read = false) AS unread
       FROM conversations c
       JOIN users u ON u.id = (CASE WHEN c.user_a = $1 THEN c.user_b ELSE c.user_a END)
       WHERE c.user_a = $1 OR c.user_b = $1
       ORDER BY c.last_at DESC`,
      [me]
    );
    res.json(
      rows.map((row) => ({
        id: row.id,
        other: seller(row),
        last: row.last_body || "",
        unread: Number(row.unread),
        time: relativeTime(row.last_at),
      }))
    );
  })
);

// get-or-create a conversation with another user
router.post(
  "/",
  authMiddleware,
  asyncHandler(async (req, res) => {
    const me = req.user.id;
    const other = Number(req.body?.userId);
    if (!other || other === me) throw new HttpError(422, "Invalid user");
    const a = Math.min(me, other);
    const b = Math.max(me, other);
    const { rows } = await query(
      `INSERT INTO conversations (user_a, user_b) VALUES ($1,$2)
       ON CONFLICT (user_a, user_b) DO UPDATE SET user_a = EXCLUDED.user_a
       RETURNING id`,
      [a, b]
    );
    res.status(201).json({ id: rows[0].id });
  })
);

// messages in a conversation (marks incoming as read)
router.get(
  "/:id",
  authMiddleware,
  asyncHandler(async (req, res) => {
    const me = req.user.id;
    const id = Number(req.params.id);
    const c = await participantOr403(id, me);
    await query(
      "UPDATE messages SET read = true WHERE conversation_id = $1 AND sender_id <> $2",
      [id, me]
    );
    const otherId = c.user_a === me ? c.user_b : c.user_a;
    const { rows: ur } = await query(
      `SELECT id AS u_id, name AS u_name, rating AS u_rating, reviews AS u_reviews,
              verified AS u_verified, avatar AS u_avatar FROM users WHERE id = $1`,
      [otherId]
    );
    const { rows } = await query(
      "SELECT id, sender_id, body, created_at FROM messages WHERE conversation_id = $1 ORDER BY created_at ASC",
      [id]
    );
    res.json({
      other: seller(ur[0]),
      messages: rows.map((m) => ({
        id: m.id,
        mine: m.sender_id === me,
        body: m.body,
        time: relativeTime(m.created_at),
      })),
    });
  })
);

// send a message
router.post(
  "/:id/messages",
  authMiddleware,
  asyncHandler(async (req, res) => {
    const me = req.user.id;
    const id = Number(req.params.id);
    await participantOr403(id, me);
    const body = String(req.body?.body || "").trim();
    if (!body) throw new HttpError(422, "Message is empty");
    const { rows } = await query(
      "INSERT INTO messages (conversation_id, sender_id, body) VALUES ($1,$2,$3) RETURNING id, created_at",
      [id, me, body]
    );
    await query("UPDATE conversations SET last_at = NOW() WHERE id = $1", [id]);
    res.status(201).json({ id: rows[0].id, mine: true, body, time: relativeTime(rows[0].created_at) });
  })
);

export default router;
