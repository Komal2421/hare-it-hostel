import express from "express";
import { query } from "../db.js";
import { asyncHandler } from "../utils.js";
import { seller, relativeTime } from "../serialize.js";

const router = express.Router();

router.get(
  "/",
  asyncHandler(async (req, res) => {
    const { rows } = await query(
      `SELECT a.*,
              u.id AS u_id, u.name AS u_name, u.rating AS u_rating, u.reviews AS u_reviews,
              u.verified AS u_verified, u.avatar AS u_avatar
       FROM activity a
       JOIN users u ON u.id = a.actor_id
       ORDER BY a.created_at DESC
       LIMIT 8`
    );
    res.json(
      rows.map((row) => {
        const s = seller(row);
        return {
          id: row.id,
          who: s.name,
          init: s.init,
          av: s.av,
          verified: s.verified,
          verb: row.verb,
          item: row.item,
          tail: row.tail,
          listingId: row.link_id || null,
          time: relativeTime(row.created_at),
        };
      })
    );
  })
);

export default router;
