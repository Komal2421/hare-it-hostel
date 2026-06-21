# HareIt 🟠

A premium **marketplace for hostel students** — borrow, lend, buy & sell everyday items,
post **requests** for things you need, run a **Lost & Found** board, and message other
students directly. Built as a full-stack app with a React front end and an Express +
PostgreSQL back end.

- **Frontend:** React 19 + Vite · Plus Jakarta Sans + IBM Plex Mono · coral theme
- **Backend:** Node.js + Express 5 + PostgreSQL (node-postgres)
- **Auth:** JWT tokens, bcrypt-hashed passwords
- **Images:** uploaded with multer and served as static files (warm tint placeholders otherwise)

---

## Features

- **Discover** — browse listings in **grid or list** view, **sort** (nearest / newest / price),
  top-bar **search**, a "Nearby" rail, and a **Load more** pager so large catalogs stay fast.
- **Browse by** Borrow / Lend / Buy / Sell, plus Quick access (Nearby, Wishlist) with live counts.
- **Item detail** — gallery, description, seller trust card, and:
  - Buyers: **Buy / Borrow request** (notifies the owner), **Message seller**, **Wishlist**.
  - Owners: **Edit listing** (change details or add a photo later) and **Delete**.
- **Wishlist** — heart toggle with live counts in the header & sidebar.
- **Request board** — post what you need; others respond with "I have this".
- **Lost & Found** — report lost/found items; respond with "I've seen this" / "This is mine".
- **Notifications** — bell with unread badge; fired when someone wishlists, requests,
  offers, or responds to your items.
- **Direct messages** — real two-sided conversations (list, thread, composer, unread counts).
- **Profile** — edit your name, campus, and avatar color from the header avatar menu.
- **Activity feed** — live feed in a **toggleable** right rail; entries link to the related item.

---

## Setup

Requires **Node.js 18+** and a running **PostgreSQL**.

```bash
createdb hare_it_db                  # 1. database

cd backend                           # 2. backend
cp .env.example .env                 #    set DATABASE_URL / JWT_SECRET
npm install
npm run seed                         #    load demo data (idempotent reset)
npm run dev                          #    API on http://localhost:8000  (node --watch)

cd ..                                # 3. frontend
cp .env.example .env                 #    VITE_API_URL=http://localhost:8000
npm install
npm run dev                          #    app on http://localhost:5173
```

Open **http://localhost:5173**.

### Demo login
The seed creates a verified demo user **Yash M.** — contact `9000000001`, password `pass12`.
Other seeded students use `9000000002`…`9000000016` (same password). Or register a new account.

---

## API

| Method | Path                      | Auth | Purpose                                    |
|--------|---------------------------|------|--------------------------------------------|
| POST   | `/auth/register`          | —    | Create account → JWT                       |
| POST   | `/auth/login`             | —    | Log in → JWT                               |
| GET    | `/auth/me`                | ✓    | Current user                               |
| PATCH  | `/auth/me`                | ✓    | Update profile (name / campus / avatar)    |
| GET    | `/listings`               | opt  | All listings (+ `wished`/`requested` if authed) |
| GET    | `/listings/:id`           | opt  | One listing                                |
| POST   | `/listings`               | ✓    | Create listing (+ image)                   |
| PATCH  | `/listings/:id`           | ✓    | Edit own listing (+ optional new image)    |
| DELETE | `/listings/:id`           | ✓    | Delete own listing                         |
| POST   | `/listings/:id/request`   | ✓    | Toggle buy/borrow request to owner         |
| POST   | `/wishlist/:id/toggle`    | ✓    | Toggle wishlist                            |
| GET    | `/requests`               | opt  | Request board                              |
| POST   | `/requests`               | ✓    | Post a request                             |
| POST   | `/requests/:id/offer`     | ✓    | "I have this"                              |
| GET    | `/lostfound`              | —    | Lost & Found board                         |
| POST   | `/lostfound`              | ✓    | Report an item (+ image)                   |
| POST   | `/lostfound/:id/respond`  | ✓    | Respond to a lost/found item               |
| GET    | `/activity`               | —    | Recent activity feed                       |
| GET    | `/notifications`          | ✓    | Your notifications                         |
| POST   | `/notifications/read`     | ✓    | Mark all read                              |
| GET    | `/conversations`          | ✓    | Your conversations                         |
| POST   | `/conversations`          | ✓    | Get or create a conversation with a user   |
| GET    | `/conversations/:id`      | ✓    | Thread messages (marks incoming as read)   |
| POST   | `/conversations/:id/messages` | ✓ | Send a message                            |

---

## Project structure

```
hare-it-hostel/
├── index.html                 # fonts + root
├── src/                       # React frontend
│   ├── App.jsx                # shell, routing (client state), data fetching
│   ├── api.js                 # fetch wrapper + endpoints
│   ├── format.js, toast.js    # helpers + toast bus
│   └── components/
│       ├── TopBar, Sidebar, Discover, ItemDetail, Requests, LostFound
│       ├── cards, icons, ui, Toaster, Modal
│       └── ListItemModal, RequestModal, LostFoundModal, ProfileModal, MessagesDrawer
└── backend/
    ├── src/
    │   ├── server.js          # app, CORS, static uploads, error handler
    │   ├── db.js              # pg pool + schema bootstrap (initSchema) + migrations
    │   ├── auth.js            # JWT, bcrypt, auth/optional-auth middleware
    │   ├── upload.js          # multer image uploads
    │   ├── serialize.js, notify.js, errors.js, utils.js
    │   ├── seed.js            # demo data (npm run seed)
    │   └── routes/            # auth, listings, wishlist, requests, lostfound,
    │                          # activity, notifications, messages
    └── uploads/               # uploaded images (gitignored)
```

---

## Tech notes

- **Schema** is created on startup by `initSchema()` in `src/db.js` (plus small idempotent
  migrations); `npm run seed` truncates and reloads demo data.
- **Listing categories:** `borrow` (₹/day), `lend` (free), `buy` / `sell` (for sale).
- Listing photos default to warm **tint placeholders**; uploads override them.
- Front end keeps only the **JWT** in `localStorage`; all data is fetched from the API.
- `JWT_SECRET` in `backend/.env` is a placeholder — replace it before deploying.
- Accent theme is **coral**; the tokens live at the top of `src/index.css` (`--accent…`).
