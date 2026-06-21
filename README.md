# HareIt 🟠

A premium **marketplace for hostel students** — borrow, lend, buy & sell everyday items,
post **requests** for things you need, and run a **Lost & Found** board. Built to the
"design_handoff_hareit_marketplace" spec (coral theme): app shell with sticky top bar +
left sidebar, Discover / Item Detail / Requests / Lost & Found screens, wishlist, live
activity feed, seller ratings & verified badges, emergency-borrow and nearby rails.

- **Frontend:** React 19 + Vite (Plus Jakarta Sans + IBM Plex Mono)
- **Backend:** Node.js + Express 5 + PostgreSQL (node-postgres)
- **Auth:** JWT tokens, bcrypt-hashed passwords
- **Images:** uploaded (multer) and served as static files; tint placeholders otherwise

---

## Setup

```bash
createdb hare_it_db                       # 1. database

cd backend                                # 2. backend
cp .env.example .env                      #    set DATABASE_URL / JWT_SECRET
npm install
npm run seed                              #    load demo data (16 users, 14 listings, …)
npm run dev                               #    API on http://localhost:8000

cd ..                                     # 3. frontend
cp .env.example .env                      #    VITE_API_URL=http://localhost:8000
npm install
npm run dev                               #    app on http://localhost:5173
```

### Demo login
The seed creates a verified demo user **Yash M.** — contact `9000000001`, password `pass12`.
Other seeded students use `9000000002`…`9000000016` (same password). Or register a new account.

---

## Features

- **Discover** — emergency-borrow module, "Nearby" rail, listings in **grid/list** views,
  live **Activity** feed and **Top requests** in the right rail.
- **Browse by** Borrow / Lend / Buy / Sell + Quick access (Nearby, Wishlist, Room-shift,
  Emergency) — client-side category filters with live counts, plus top-bar search.
- **Wishlist** — heart toggle with live counts in the top bar & sidebar.
- **Item Detail** — gallery, description, Buy/Borrow CTA (→ "Request sent ✓"), seller trust card.
- **Request board** — post what you need, "I have this" offers.
- **Lost & Found** — report lost/found items, "I've seen this" / "This is mine".
- **List an item / Post a request / Report an item** modals create real, persisted records.
- Seller **ratings**, **verified** badges, themeable accent (coral).

---

## API

| Method | Path                     | Auth | Purpose                                   |
|--------|--------------------------|------|-------------------------------------------|
| POST   | `/auth/register`         | —    | Create account → JWT                      |
| POST   | `/auth/login`            | —    | Log in → JWT                              |
| GET    | `/auth/me`               | ✓    | Current user                              |
| GET    | `/listings`              | opt  | All listings (+ `wished`/`requested` if authed) |
| GET    | `/listings/:id`          | opt  | One listing                               |
| POST   | `/listings`              | ✓    | Create listing (+ image)                  |
| POST   | `/listings/:id/request`  | ✓    | Toggle buy/borrow request to owner        |
| DELETE | `/listings/:id`          | ✓    | Delete own listing                        |
| POST   | `/wishlist/:id/toggle`   | ✓    | Toggle wishlist                           |
| GET    | `/requests`              | opt  | Request board                             |
| POST   | `/requests`              | ✓    | Post a request                            |
| POST   | `/requests/:id/offer`    | ✓    | "I have this"                             |
| GET    | `/lostfound`             | —    | Lost & Found board                        |
| POST   | `/lostfound`             | ✓    | Report an item (+ image)                  |
| POST   | `/lostfound/:id/respond` | ✓    | Respond to a lost/found item              |
| GET    | `/activity`              | —    | Recent activity feed                      |

---

## Project structure

```
hare-it-hostel/
├── src/                       # React frontend
│   ├── api.js, format.js, toast.js
│   └── components/            # TopBar, Sidebar, Discover, ItemDetail, Requests,
│                              # LostFound, cards, Modal + 3 create modals, Login, …
└── backend/
    └── src/
        ├── server.js, db.js, auth.js, upload.js, serialize.js, seed.js
        └── routes/            # auth, listings, wishlist, requests, lostfound, activity
```

## Notes / next steps
- Listing photos default to warm tint placeholders (per the design); uploads override them.
- Tables are created on startup by `initSchema()` in `src/db.js`; `npm run seed` resets demo data.
- `JWT_SECRET` in `backend/.env` is a placeholder — replace before deploying.
- Accent theme is coral; the tokens live at the top of `src/index.css` (`--accent…`) if you
  ever want green/indigo.
