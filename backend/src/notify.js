import { query } from "./db.js";

// Insert a notification for `userId` about an action by `actorId`.
// `text` is the predicate shown after the bold actor name, e.g. 'saved your "Cycle"'.
export async function notify({ userId, actorId, kind, text }) {
  if (!userId || userId === actorId) return; // never notify yourself
  await query(
    `INSERT INTO notifications (user_id, actor_id, kind, text) VALUES ($1,$2,$3,$4)`,
    [userId, actorId, kind, text]
  );
}
