import { pool, query, initSchema } from "./db.js";
import { hashPassword } from "./auth.js";

const CAMPUS = "IIT Bombay · Hostel 12";

// name, contact, avatar, rating, reviews, deals, verified
const USERS = [
  ["Yash M.", "9000000001", "#E7CFC2", 4.9, 28, 28, true], // the demo login user
  ["Aditya R.", "9000000002", "#E7CFC2", 4.9, 32, 0, true],
  ["Priya N.", "9000000003", "#CBD8E0", 4.8, 21, 0, true],
  ["Rohan M.", "9000000004", "#D8CFE0", 5.0, 14, 0, true],
  ["Sneha K.", "9000000005", "#E0D6C2", 4.7, 48, 0, true],
  ["Karan V.", "9000000006", "#D0DCD2", 4.9, 11, 0, false],
  ["Meera J.", "9000000007", "#E2CFD3", 4.6, 27, 0, true],
  ["Arjun P.", "9000000008", "#E7CFC2", 4.8, 19, 0, true],
  ["Diya S.", "9000000009", "#CBD8E0", 4.9, 36, 0, true],
  ["Isha T.", "9000000010", "#D8CFE0", 4.7, 9, 0, true],
  ["Nikhil B.", "9000000011", "#E0D6C2", 4.8, 23, 0, true],
  ["Tara L.", "9000000012", "#D0DCD2", 4.9, 15, 0, true],
  ["Sahil G.", "9000000013", "#E2CFD3", 4.8, 17, 0, true],
  ["Ananya D.", "9000000014", "#E7CFC2", 4.7, 12, 0, false],
  ["Vikram H.", "9000000015", "#D0DCD2", 4.6, 18, 0, false],
  ["Ankit S.", "9000000016", "#E7CFC2", 4.8, 20, 0, true],
];

const LISTINGS = [
  { key: "cycle", title: "Trek Marlin Cycle", cat: "sell", price: 4500, sub: "21-speed, barely used", cond: "Like new", loc: "Hostel 12 · Rm 214", dist: "2 floors up", tint: "#E4DECF", label: "CYCLE", roomshift: true, nearby: true, seller: "Aditya R.", desc: "Trek Marlin 5, ridden one semester. Recently serviced, new brake pads, no scratches. Selling because I am graduating. Helmet and lock included." },
  { key: "fan", title: "Table Fan (high speed)", cat: "borrow", price: 20, sub: "3-speed, works great", cond: "Good", loc: "Hostel 9 · Rm 108", dist: "Next block", tint: "#D9E2D8", label: "TABLE FAN", nearby: true, seller: "Priya N.", desc: "Bajaj 400mm table fan, three speeds, very quiet. Happy to lend by the day or week through the summer. Pick up any evening after 6pm." },
  { key: "calc", title: "Casio FX-991EX Calculator", cat: "borrow", price: 10, sub: "Exam-ready scientific", cond: "Good", loc: "Hostel 12 · Rm 301", dist: "Same floor", tint: "#DCE0E6", label: "CALCULATOR", emergency: true, eta: "2 min away", nearby: true, seller: "Rohan M.", desc: "Casio FX-991EX ClassWiz. Perfect for exams. Lending out between my own papers, message me your slot and I will keep it free." },
  { key: "induction", title: "Induction Cooktop", cat: "sell", price: 1200, sub: "1800W with pot", cond: "Good", loc: "Hostel 7 · Rm 12", dist: "5 min walk", tint: "#E7D8CF", label: "INDUCTION", roomshift: true, seller: "Sneha K.", desc: "Prestige 1800W induction cooktop with a stainless pot. Works perfectly. Moving out this week so quick pickup preferred." },
  { key: "lamp", title: "Study Lamp (LED)", cat: "buy", price: 350, sub: "Adjustable, warm light", cond: "Like new", loc: "Hostel 12 · Rm 220", dist: "1 floor up", tint: "#E8DDE0", label: "STUDY LAMP", nearby: true, seller: "Karan V.", desc: "Clip-on LED study lamp with three brightness levels and a warm/cool toggle. Easy on the eyes for late nights." },
  { key: "books", title: "DSA + OS Textbook Bundle", cat: "buy", price: 600, sub: "5 books, sem 3-4", cond: "Good", loc: "Hostel 5 · Rm 41", dist: "8 min walk", tint: "#DEE0D7", label: "TEXTBOOKS", seller: "Meera J.", desc: "Cormen, Galvin OS, and three reference books for sem 3-4. Minimal highlighting. Will sell as a bundle only." },
  { key: "cricket", title: "Cricket Kit (bat + pads)", cat: "borrow", price: 50, sub: "SS bat, full set", cond: "Good", loc: "Sports Block", dist: "Ground floor", tint: "#D6E1DC", label: "CRICKET KIT", seller: "Arjun P.", desc: "Full kit: SS Ton bat, pads, gloves, helmet. Great for weekend matches at the ground. Day or weekend rates available." },
  { key: "fridge", title: "Mini Fridge 50L", cat: "sell", price: 3800, sub: "Single door, clean", cond: "Good", loc: "Hostel 9 · Rm 210", dist: "Next block", tint: "#E4DECF", label: "MINI FRIDGE", roomshift: true, seller: "Diya S.", desc: "Haier 50L mini fridge, two years old, runs cold and quiet. Defrosted and cleaned. Selling as I head off campus." },
  { key: "umbrella", title: "Umbrella (large)", cat: "lend", price: 0, sub: "Monsoon-ready", cond: "Good", loc: "Hostel 12 · Rm 118", dist: "Same building", tint: "#D9E2D8", label: "UMBRELLA", emergency: true, eta: "1 min away", nearby: true, seller: "Isha T.", desc: "Big golf umbrella, easily covers two people. Just return it dry. Grab it from my door whenever it pours." },
  { key: "speaker", title: "JBL Go Bluetooth Speaker", cat: "buy", price: 900, sub: "Portable, loud", cond: "Like new", loc: "Hostel 5 · Rm 22", dist: "8 min walk", tint: "#E7D8CF", label: "SPEAKER", seller: "Nikhil B.", desc: "JBL Go 3, barely used, comes with the charging cable. Surprisingly loud for the size. Great for room parties." },
  { key: "iron", title: "Steam Iron Box", cat: "borrow", price: 15, sub: "Quick heat", cond: "Good", loc: "Hostel 12 · Rm 305", dist: "Same floor", tint: "#DCE0E6", label: "IRON BOX", emergency: true, eta: "3 min away", nearby: true, seller: "Tara L.", desc: "Philips steam iron, heats up fast. Lending by the day for placement season. Please return same evening." },
  { key: "powerbank", title: "20000mAh Power Bank", cat: "lend", price: 0, sub: "Fast charge, 2 ports", cond: "Like new", loc: "Hostel 12 · Rm 210", dist: "Same floor", tint: "#DEE0D7", label: "POWER BANK", emergency: true, eta: "2 min away", nearby: true, seller: "Sahil G.", desc: "Mi 20000mAh power bank, charges a phone three to four times. Happy to lend for a day when yours dies before a deadline." },
  { key: "extension", title: "Extension Board (6 socket)", cat: "lend", price: 0, sub: "Surge protected", cond: "Good", loc: "Hostel 9 · Rm 115", dist: "Next block", tint: "#D6E1DC", label: "EXTENSION", emergency: true, eta: "4 min away", seller: "Ananya D.", desc: "Six-socket surge-protected extension board, three-metre cord. Useful when your room has one plug and four gadgets." },
  { key: "beanbag", title: "Bean Bag (XL)", cat: "sell", price: 800, sub: "Comfy, fully filled", cond: "Good", loc: "Hostel 7 · Rm 30", dist: "5 min walk", tint: "#E8DDE0", label: "BEAN BAG", roomshift: true, seller: "Vikram H.", desc: "XL bean bag, freshly refilled with beans. Super comfortable for gaming or reading. Selling as I move rooms." },
];

const REQUESTS = [
  { who: "Nikhil B.", loc: "Hostel 5", ago: 6, item: "Hot water kettle for 3 days", note: "Down with a cold, need it for the week. Will pick up tonight.", urgent: true, mode: "Borrow", budget: "₹40/day", offers: 2 },
  { who: "Sneha K.", loc: "Hostel 7", ago: 22, item: "HDMI cable (2m+)", note: "For tomorrow's group presentation. Borrow or buy, either works.", urgent: false, mode: "Borrow", budget: "₹20/day", offers: 5 },
  { who: "Arjun P.", loc: "Hostel 12", ago: 60, item: "Floor cushion / yoga mat", note: "New to campus, setting up my room. Happy to buy second-hand.", urgent: false, mode: "Buy", budget: "up to ₹400", offers: 3 },
  { who: "Tara L.", loc: "Hostel 9", ago: 120, item: "Casio FX-991 calculator", note: "Mine stopped working right before the quant exam on Friday.", urgent: true, mode: "Borrow", budget: "₹10/day", offers: 7 },
  { who: "Karan V.", loc: "Hostel 12", ago: 240, item: "Trolley bag for a week", note: "Heading home for the break, need a large suitcase to borrow.", urgent: false, mode: "Borrow", budget: "₹60/day", offers: 1 },
];

const LOSTFOUND = [
  { type: "found", title: "Black Wildcraft backpack", place: "Central Library, 2nd floor", ago: 60, label: "BACKPACK", tint: "#DCE0E6" },
  { type: "lost", title: "Blue water bottle (steel)", place: "Sports ground", ago: 180, label: "BOTTLE", tint: "#D9E2D8" },
  { type: "found", title: "Set of room keys", place: "Hostel 12 mess", ago: 300, label: "KEYS", tint: "#E8DDE0" },
  { type: "lost", title: "AirPods Pro (white case)", place: "Lecture Hall 3", ago: 1440, label: "EARBUDS", tint: "#E4DECF" },
  { type: "found", title: "Spectacles, brown frame", place: "Canteen near Hostel 5", ago: 1450, label: "GLASSES", tint: "#DEE0D7" },
  { type: "lost", title: "ID card — Anuj Mehta", place: "Somewhere near Hostel 9", ago: 2880, label: "ID CARD", tint: "#E7D8CF" },
];

const ACTIVITY = [
  { who: "Ankit S.", verb: "lent a", item: "Table Fan", tail: " to Priya", ago: 2, key: "fan" },
  { who: "Meera J.", verb: "listed", item: "DSA Textbook Bundle", tail: " for sale", ago: 14, key: "books" },
  { who: "Rohan M.", verb: "got a", item: "5★ rating", tail: " from Karan", ago: 38 },
  { who: "Isha T.", verb: "returned the", item: "Umbrella", tail: " on time", ago: 60, key: "umbrella" },
  { who: "Diya S.", verb: "listed", item: "Mini Fridge", tail: " for sale", ago: 120, key: "fridge" },
];

async function run() {
  await initSchema();
  await query(
    `TRUNCATE activity, lostfound_responses, lostfound, request_offers, requests,
              purchase_requests, wishlist, listings, users RESTART IDENTITY CASCADE`
  );

  const pw = await hashPassword("pass12");
  const uid = {};
  for (const [name, contact, avatar, rating, reviews, deals, verified] of USERS) {
    const { rows } = await query(
      `INSERT INTO users (name, campus, contact, password_hash, avatar, rating, reviews, deals, verified)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING id`,
      [name, CAMPUS, contact, pw, avatar, rating, reviews, deals, verified]
    );
    uid[name] = rows[0].id;
  }

  const lid = {};
  for (let i = 0; i < LISTINGS.length; i++) {
    const l = LISTINGS[i];
    const unit = l.cat === "borrow" ? "/day" : "";
    const { rows } = await query(
      `INSERT INTO listings
        (owner_id, title, cat, price, unit, sub, condition, location, distance, description,
         tint, label, nearby, created_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13, NOW() - ($14 * INTERVAL '1 minute'))
       RETURNING id`,
      [
        uid[l.seller], l.title, l.cat, l.price, unit, l.sub, l.cond, l.loc, l.dist, l.desc,
        l.tint, l.label, l.nearby !== false, i,
      ]
    );
    lid[l.key] = rows[0].id;
  }

  // Yash's wishlist: cycle + books
  for (const key of ["cycle", "books"]) {
    await query("INSERT INTO wishlist (user_id, listing_id) VALUES ($1,$2)", [
      uid["Yash M."], lid[key],
    ]);
  }

  const allIds = Object.values(uid);
  for (const r of REQUESTS) {
    const { rows } = await query(
      `INSERT INTO requests (user_id, item, note, loc, mode, budget, urgent, created_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7, NOW() - ($8 * INTERVAL '1 minute')) RETURNING id`,
      [uid[r.who], r.item, r.note, r.loc, r.mode, r.budget, r.urgent, r.ago]
    );
    // synthesize the offer count from other users (not the author, not the demo user)
    const offerers = allIds
      .filter((id) => id !== uid[r.who] && id !== uid["Yash M."])
      .slice(0, r.offers);
    for (const oid of offerers) {
      await query(
        "INSERT INTO request_offers (request_id, user_id) VALUES ($1,$2) ON CONFLICT DO NOTHING",
        [rows[0].id, oid]
      );
    }
  }

  let li = 0;
  for (const l of LOSTFOUND) {
    const owner = allIds[li++ % allIds.length];
    await query(
      `INSERT INTO lostfound (user_id, type, title, place, label, tint, created_at)
       VALUES ($1,$2,$3,$4,$5,$6, NOW() - ($7 * INTERVAL '1 minute'))`,
      [owner, l.type, l.title, l.place, l.label, l.tint, l.ago]
    );
  }

  for (const a of ACTIVITY) {
    await query(
      `INSERT INTO activity (actor_id, verb, item, tail, link_id, created_at)
       VALUES ($1,$2,$3,$4,$5, NOW() - ($6 * INTERVAL '1 minute'))`,
      [uid[a.who], a.verb, a.item, a.tail, a.key ? lid[a.key] : null, a.ago]
    );
  }

  console.log(
    `Seeded ${USERS.length} users, ${LISTINGS.length} listings, ${REQUESTS.length} requests, ` +
      `${LOSTFOUND.length} lost&found, ${ACTIVITY.length} activity.`
  );
  await pool.end();
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
