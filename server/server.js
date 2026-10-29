import express from "express";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import pool, { testConnection } from "./config/db.js";

import authRoutes from "./routes/auth.js";
import alumniRoutes from "./routes/alumni.js";
import surveyRoutes from "./routes/survey.js";

dotenv.config();

// ─── Validasi env wajib ───────────────────────────────────────────────────────
if (!process.env.JWT_SECRET || process.env.JWT_SECRET.trim() === "") {
  console.error(
    "[FATAL] JWT_SECRET belum di-set di file .env. Server tidak akan berjalan.",
  );
  process.exit(1);
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// ─── Hardening Keamanan ──────────────────────────────────────────────────────
app.disable("x-powered-by");
app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));

// ─── CORS Whitelist ke domain frontend ──────────────────────────────────────
const envOrigins = (process.env.CLIENT_URL || process.env.FRONTEND_URL || "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

const allowedOrigins = Array.from(
  new Set([
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    ...envOrigins,
  ]),
);

app.use(
  cors({
    origin: (origin, callback) => {
      // Izinkan request tanpa origin (curl, mobile app, Postman, internal server)
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error("Akses CORS ditolak oleh kebijakan keamanan"));
    },
    credentials: true,
  }),
);

app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use("/api/auth", authRoutes);
app.use("/api/alumni", alumniRoutes);
app.use("/api/survey", surveyRoutes);

app.get("/", (req, res) => {
  res.send("Tracer Study API (MySQL) berjalan 🚀");
});

// ─── 404 Handler untuk Route yang Tidak Ditemukan ───────────────────────────
app.use((req, res) => {
  res.status(404).json({ message: "Endpoint tidak ditemukan" });
});

// ─── Error Middleware Global (Pesan generik ke client, detail di log) ────────
app.use((err, req, res, next) => {
  console.error("[SERVER ERROR]", err);

  if (res.headersSent) {
    return next(err);
  }

  const status =
    err.status ||
    err.statusCode ||
    (err.name === "MulterError" ? 400 : err.message?.includes("CORS") ? 403 : 500);

  const message =
    status < 500
      ? (err.message || "Permintaan tidak valid")
      : "Terjadi kesalahan internal pada server";

  res.status(status).json({ message });
});

const PORT = process.env.PORT || 5000;
let server;

testConnection().then(() => {
  server = app.listen(PORT, () => console.log(`Server berjalan di port ${PORT}`));
});

// ─── Graceful Shutdown ───────────────────────────────────────────────────────
const shutdown = (signal) => {
  console.log(`\n[SHUTDOWN] Menerima sinyal ${signal}, menutup server dan database pool...`);
  if (server) {
    server.close(async () => {
      try {
        await pool.end();
        console.log("[SHUTDOWN] Database pool berhasil ditutup.");
        process.exit(0);
      } catch (err) {
        console.error("[SHUTDOWN ERROR] Gagal menutup database pool:", err);
        process.exit(1);
      }
    });
  } else {
    process.exit(0);
  }
};

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
