import express from "express";
import { query } from "../db.js";
import { authMiddleware } from "../auth.js";
import { asyncHandler } from "../utils.js";
import { notify } from "../notify.js";

const router = express.Router();

router.post(
  "/:listingId/toggle",
  authMiddleware,
  asyncHandler(async (req, res) => {
    const listingId = Number(req.params.listingId);
    const exists = await query(
      "SELECT 1 FROM wishlist WHERE listing_id = $1 AND user_id = $2",
      [listingId, req.user.id]
    );
    if (exists.rows.length) {
      await query("DELETE FROM wishlist WHERE listing_id = $1 AND user_id = $2", [
        listingId,
        req.user.id,
      ]);
      res.json({ wished: false });
    } else {
      await query("INSERT INTO wishlist (listing_id, user_id) VALUES ($1, $2)", [
        listingId,
        req.user.id,
      ]);
      const { rows } = await query("SELECT owner_id, title FROM listings WHERE id = $1", [listingId]);
      if (rows[0]) {
        await notify({
          userId: rows[0].owner_id,
          actorId: req.user.id,
          kind: "wishlist",
          text: `saved your “${rows[0].title}”`,
        });
      }
      res.json({ wished: true });
    }
  })
);

export default router;
