import express from "express";
import { query } from "../db.js";
import { authMiddleware } from "../auth.js";
import { HttpError } from "../errors.js";
import { asyncHandler } from "../utils.js";

const router = express.Router();

function serialize(row) {
  return {
    id: row.id,
    item: row.item,
    name: row.name,
    hostel: row.hostel,
    contact: row.contact,
    owner_id: row.owner_id,
    created_at: row.created_at,
  };
}

router.get(
  "/",
  asyncHandler(async (req, res) => {
    const { rows } = await query(
      `SELECT l.id, l.item, l.owner_id, l.created_at, u.name, u.hostel, u.contact
       FROM lend_items l
       JOIN users u ON u.id = l.owner_id
       ORDER BY l.created_at DESC`
    );
    res.json(rows.map(serialize));
  })
);

router.post(
  "/",
  authMiddleware,
  asyncHandler(async (req, res) => {
    const item = String(req.body?.item || "").trim();
    if (!item) throw new HttpError(422, "Item name is required");

    const { rows } = await query(
      `INSERT INTO lend_items (item, owner_id)
       VALUES ($1, $2)
       RETURNING id, item, owner_id, created_at`,
      [item, req.user.id]
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
      `DELETE FROM lend_items WHERE id = $1 AND owner_id = $2 RETURNING id`,
      [Number(req.params.id), req.user.id]
    );
    if (rows.length === 0) {
      throw new HttpError(404, "Item not found or not yours to delete");
    }
    res.status(204).end();
  })
);

export default router;
