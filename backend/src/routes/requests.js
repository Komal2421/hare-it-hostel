import express from "express";
import { query } from "../db.js";
import { authMiddleware, optionalAuth } from "../auth.js";
import { HttpError } from "../errors.js";
import { asyncHandler } from "../utils.js";
import { seller, relativeTime } from "../serialize.js";
import { notify } from "../notify.js";

const router = express.Router();

const SELECT = `
  SELECT r.*,
         u.id AS u_id, u.name AS u_name, u.rating AS u_rating, u.reviews AS u_reviews,
         u.verified AS u_verified, u.avatar AS u_avatar,
         COALESCE(o.cnt, 0) AS replies,
         ($UID = ANY(COALESCE(o.users, '{}'))) AS offered
  FROM requests r
  JOIN users u ON u.id = r.user_id
  LEFT JOIN (SELECT request_id, COUNT(*) AS cnt, array_agg(user_id) AS users
             FROM request_offers GROUP BY request_id) o ON o.request_id = r.id
`;

function serialize(row) {
  const s = seller(row);
  return {
    id: row.id,
    item: row.item,
    note: row.note,
    loc: row.loc,
    mode: row.mode,
    modeLabel: row.mode,
    budget: row.budget,
    urgent: row.urgent,
    replies: Number(row.replies),
    offered: row.offered || false,
    who: s.name,
    init: s.init,
    av: s.av,
    verified: s.verified,
    user_id: row.user_id,
    time: relativeTime(row.created_at),
    created_at: row.created_at,
  };
}

router.get(
  "/",
  optionalAuth,
  asyncHandler(async (req, res) => {
    const uid = req.user ? req.user.id : 0;
    const { rows } = await query(
      SELECT.replaceAll("$UID", "$1") + " ORDER BY r.created_at DESC",
      [uid]
    );
    res.json(rows.map(serialize));
  })
);

router.post(
  "/",
  authMiddleware,
  asyncHandler(async (req, res) => {
    const b = req.body || {};
    const item = String(b.item || "").trim();
    if (!item) throw new HttpError(422, "What are you looking for?");
    const mode = b.mode === "Buy" ? "Buy" : "Borrow";

    const { rows } = await query(
      `INSERT INTO requests (user_id, item, note, loc, mode, budget, urgent)
       VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING id`,
      [
        req.user.id,
        item,
        String(b.note || "").trim(),
        String(b.loc || req.user.campus).trim(),
        mode,
        String(b.budget || "").trim(),
        b.urgent === true || b.urgent === "true",
      ]
    );
    await query(`INSERT INTO activity (actor_id, verb, item, tail) VALUES ($1,$2,$3,$4)`, [
      req.user.id,
      "posted a request for",
      item,
      "",
    ]);

    const { rows: full } = await query(SELECT.replaceAll("$UID", "$1") + " WHERE r.id = $2", [
      req.user.id,
      rows[0].id,
    ]);
    res.status(201).json(serialize(full[0]));
  })
);

router.post(
  "/:id/offer",
  authMiddleware,
  asyncHandler(async (req, res) => {
    const id = Number(req.params.id);
    const exists = await query("SELECT user_id, item FROM requests WHERE id = $1", [id]);
    if (!exists.rows.length) throw new HttpError(404, "Request not found");
    await query(
      `INSERT INTO request_offers (request_id, user_id) VALUES ($1,$2)
       ON CONFLICT DO NOTHING`,
      [id, req.user.id]
    );
    await notify({
      userId: exists.rows[0].user_id,
      actorId: req.user.id,
      kind: "offer",
      text: `can help with your request “${exists.rows[0].item}”`,
    });
    const { rows } = await query(
      "SELECT COUNT(*)::int AS cnt FROM request_offers WHERE request_id = $1",
      [id]
    );
    res.json({ replies: rows[0].cnt, offered: true });
  })
);

export default router;
