import pg from "pg";
import { config } from "./config.js";

export const pool = new pg.Pool({ connectionString: config.databaseUrl });

export function query(text, params) {
  return pool.query(text, params);
}

// Create tables if they don't exist (simple bootstrap; swap for migrations later).
export async function initSchema() {
  await query(`
    CREATE TABLE IF NOT EXISTS users (
      id            SERIAL PRIMARY KEY,
      name          VARCHAR(120) NOT NULL,
      campus        VARCHAR(120) NOT NULL DEFAULT 'IIT Bombay · Hostel 12',
      contact       VARCHAR(10)  NOT NULL UNIQUE,
      password_hash VARCHAR(255) NOT NULL,
      avatar        VARCHAR(9)   NOT NULL DEFAULT '#E7CFC2',
      rating        NUMERIC(2,1),
      reviews       INTEGER      NOT NULL DEFAULT 0,
      deals         INTEGER      NOT NULL DEFAULT 0,
      verified      BOOLEAN      NOT NULL DEFAULT false,
      created_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW()
    );
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS listings (
      id          SERIAL PRIMARY KEY,
      owner_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      title       VARCHAR(160) NOT NULL,
      cat         VARCHAR(10)  NOT NULL,        -- borrow | lend | buy | sell
      price       NUMERIC(10,2) NOT NULL DEFAULT 0,
      unit        VARCHAR(10)  NOT NULL DEFAULT '',  -- '' or '/day'
      sub         VARCHAR(160) NOT NULL DEFAULT '',
      condition   VARCHAR(40)  NOT NULL DEFAULT 'Good',
      location    VARCHAR(120) NOT NULL DEFAULT '',
      distance    VARCHAR(60)  NOT NULL DEFAULT '',
      description TEXT         NOT NULL DEFAULT '',
      image_url   TEXT,
      tint        VARCHAR(9)   NOT NULL DEFAULT '#E4DECF',
      label       VARCHAR(40)  NOT NULL DEFAULT '',
      nearby      BOOLEAN      NOT NULL DEFAULT true,
      created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
    );
  `);
  await query(`CREATE INDEX IF NOT EXISTS ix_listings_owner ON listings(owner_id);`);
  await query(`CREATE INDEX IF NOT EXISTS ix_listings_cat ON listings(cat);`);

  await query(`
    CREATE TABLE IF NOT EXISTS wishlist (
      user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      listing_id INTEGER NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      PRIMARY KEY (user_id, listing_id)
    );
  `);

  // detail-page "Buy now / Borrow now" -> request to the owner
  await query(`
    CREATE TABLE IF NOT EXISTS purchase_requests (
      user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      listing_id INTEGER NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      PRIMARY KEY (user_id, listing_id)
    );
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS requests (
      id         SERIAL PRIMARY KEY,
      user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      item       VARCHAR(160) NOT NULL,
      note       TEXT         NOT NULL DEFAULT '',
      loc        VARCHAR(120) NOT NULL DEFAULT '',
      mode       VARCHAR(20)  NOT NULL DEFAULT 'Borrow',  -- Borrow | Buy
      budget     VARCHAR(40)  NOT NULL DEFAULT '',
      urgent     BOOLEAN      NOT NULL DEFAULT false,
      created_at TIMESTAMPTZ  NOT NULL DEFAULT NOW()
    );
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS request_offers (
      request_id INTEGER NOT NULL REFERENCES requests(id) ON DELETE CASCADE,
      user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      PRIMARY KEY (request_id, user_id)
    );
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS lostfound (
      id         SERIAL PRIMARY KEY,
      user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      type       VARCHAR(8)   NOT NULL,         -- lost | found
      title      VARCHAR(160) NOT NULL,
      place      VARCHAR(160) NOT NULL DEFAULT '',
      label      VARCHAR(40)  NOT NULL DEFAULT '',
      tint       VARCHAR(9)   NOT NULL DEFAULT '#DCE0E6',
      image_url  TEXT,
      created_at TIMESTAMPTZ  NOT NULL DEFAULT NOW()
    );
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS lostfound_responses (
      lostfound_id INTEGER NOT NULL REFERENCES lostfound(id) ON DELETE CASCADE,
      user_id      INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      PRIMARY KEY (lostfound_id, user_id)
    );
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS activity (
      id         SERIAL PRIMARY KEY,
      actor_id   INTEGER REFERENCES users(id) ON DELETE CASCADE,
      verb       VARCHAR(60)  NOT NULL,
      item       VARCHAR(160) NOT NULL DEFAULT '',
      tail       VARCHAR(120) NOT NULL DEFAULT '',
      link_id    INTEGER,
      created_at TIMESTAMPTZ  NOT NULL DEFAULT NOW()
    );
  `);

  // ---- migrations for existing databases ----
  await query(`ALTER TABLE listings DROP COLUMN IF EXISTS roomshift`);
  await query(`ALTER TABLE listings DROP COLUMN IF EXISTS emergency`);
  await query(`ALTER TABLE listings DROP COLUMN IF EXISTS eta`);
  await query(`ALTER TABLE activity ADD COLUMN IF NOT EXISTS link_id INTEGER`);

  await query(`
    CREATE TABLE IF NOT EXISTS notifications (
      id         SERIAL PRIMARY KEY,
      user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      actor_id   INTEGER REFERENCES users(id) ON DELETE CASCADE,
      kind       VARCHAR(20)  NOT NULL,
      text       VARCHAR(200) NOT NULL,
      read       BOOLEAN      NOT NULL DEFAULT false,
      created_at TIMESTAMPTZ  NOT NULL DEFAULT NOW()
    );
  `);
  await query(`CREATE INDEX IF NOT EXISTS ix_notifications_user ON notifications(user_id);`);

  await query(`
    CREATE TABLE IF NOT EXISTS conversations (
      id         SERIAL PRIMARY KEY,
      user_a     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      user_b     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      last_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      UNIQUE (user_a, user_b)
    );
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS messages (
      id              SERIAL PRIMARY KEY,
      conversation_id INTEGER NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
      sender_id       INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      body            TEXT NOT NULL,
      read            BOOLEAN NOT NULL DEFAULT false,
      created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);
  await query(`CREATE INDEX IF NOT EXISTS ix_messages_conv ON messages(conversation_id);`);
}
