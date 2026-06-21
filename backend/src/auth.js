import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { config } from "./config.js";
import { query } from "./db.js";
import { HttpError } from "./errors.js";

const USER_COLS =
  "id, name, campus, contact, avatar, rating, reviews, deals, verified, created_at";

export function hashPassword(password) {
  return bcrypt.hash(password, 10);
}

export function verifyPassword(password, passwordHash) {
  return bcrypt.compare(password, passwordHash);
}

export function createAccessToken(userId) {
  return jwt.sign({ sub: String(userId) }, config.jwtSecret, {
    expiresIn: config.jwtExpiresIn,
  });
}

async function userFromToken(token) {
  let payload;
  try {
    payload = jwt.verify(token, config.jwtSecret);
  } catch {
    return null;
  }
  const { rows } = await query(`SELECT ${USER_COLS} FROM users WHERE id = $1`, [
    Number(payload.sub),
  ]);
  return rows[0] || null;
}

function bearer(req) {
  const header = req.headers.authorization || "";
  const [scheme, token] = header.split(" ");
  return scheme === "Bearer" && token ? token : null;
}

// Requires a valid token; attaches req.user or 401s.
export async function authMiddleware(req, res, next) {
  try {
    const token = bearer(req);
    if (!token) throw new HttpError(401, "Not authenticated");
    const user = await userFromToken(token);
    if (!user) throw new HttpError(401, "Invalid or expired token");
    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
}

// Attaches req.user if a valid token is present; otherwise continues anonymously.
export async function optionalAuth(req, res, next) {
  try {
    const token = bearer(req);
    req.user = token ? await userFromToken(token) : null;
    next();
  } catch {
    req.user = null;
    next();
  }
}

export function publicUser(u) {
  return {
    id: u.id,
    name: u.name,
    campus: u.campus,
    contact: u.contact,
    avatar: u.avatar,
    rating: u.rating != null ? Number(u.rating) : null,
    reviews: u.reviews,
    deals: u.deals,
    verified: u.verified,
  };
}
