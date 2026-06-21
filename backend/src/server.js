import express from "express";
import cors from "cors";
import multer from "multer";
import { config } from "./config.js";
import { initSchema } from "./db.js";
import { HttpError } from "./errors.js";
import { UPLOAD_DIR } from "./upload.js";
import authRouter from "./routes/auth.js";
import listingsRouter from "./routes/listings.js";
import wishlistRouter from "./routes/wishlist.js";
import requestsRouter from "./routes/requests.js";
import lostfoundRouter from "./routes/lostfound.js";
import activityRouter from "./routes/activity.js";
import notificationsRouter from "./routes/notifications.js";
import messagesRouter from "./routes/messages.js";

const app = express();

app.use(cors({ origin: config.corsOrigins, credentials: true }));
app.use(express.json());

// Serve uploaded images as static files
app.use("/uploads", express.static(UPLOAD_DIR));

app.get("/", (req, res) => res.json({ status: "ok", service: "Hare It API" }));
app.get("/health", (req, res) => res.json({ status: "healthy" }));

app.use("/auth", authRouter);
app.use("/listings", listingsRouter);
app.use("/wishlist", wishlistRouter);
app.use("/requests", requestsRouter);
app.use("/lostfound", lostfoundRouter);
app.use("/activity", activityRouter);
app.use("/notifications", notificationsRouter);
app.use("/conversations", messagesRouter);

// Centralized error handler -> always { detail } (matches frontend api.js)
app.use((err, req, res, next) => {
  if (err instanceof HttpError) {
    return res.status(err.status).json({ detail: err.detail });
  }
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(413).json({ detail: "Image too large (max 5 MB)" });
    }
    return res.status(400).json({ detail: err.message });
  }
  console.error(err);
  res.status(500).json({ detail: "Internal server error" });
});

initSchema()
  .then(() => {
    app.listen(config.port, () => {
      console.log(`Hare It API running on http://localhost:${config.port}`);
    });
  })
  .catch((err) => {
    console.error("Failed to initialize database schema:", err);
    process.exit(1);
  });
