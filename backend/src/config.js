import dotenv from "dotenv";

dotenv.config();

function required(name) {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required env var: ${name}`);
  return value;
}

export const config = {
  databaseUrl: required("DATABASE_URL"),
  jwtSecret: required("JWT_SECRET"),
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "7d",
  port: Number(process.env.PORT || 8000),
  publicBaseUrl: process.env.PUBLIC_BASE_URL || "http://localhost:8000",
  corsOrigins: (process.env.CORS_ORIGINS || "http://localhost:5173")
    .split(",")
    .map((o) => o.trim())
    .filter(Boolean),

  // Students may only register from these hostels (enforced server-side)
  allowedHostels: [
    "nivedita",
    "lt williams",
    "pandeya",
    "h-10",
    "h-11",
    "h-14",
  ],
};
