import express from "express";
import rateLimit from "express-rate-limit";
import { rateLimitSurvey } from "../middleware/rateLimiter.js";
import {
  createSurvey,
  prediksiRelevansi,
  hitungUlangRelevansi,
  getAllSurvey,
  getStats,
  getTahunList,
  getLaporan,
  exportSurveyPdf,
  exportSurveyExcel,
} from "../controllers/surveyController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

// Rate limiter untuk endpoint publik prediksi-relevansi — pakai express-rate-limit
// agar tidak ada memory leak dari Map yang tumbuh selamanya
const rateLimitPrediksi = rateLimit({
  windowMs: 60 * 1000,   // 1 menit
  max: 40,               // maks 40 request per IP per menit
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message: "Terlalu banyak permintaan prediksi. Silakan tunggu beberapa saat.",
    tersedia: false,
  },
});

router.post("/prediksi-relevansi", rateLimitPrediksi, prediksiRelevansi); // publik — diisi alumni di langkah 2 -> 3
router.post("/hitung-ulang-relevansi", protect, hitungUlangRelevansi); // admin only
router.post("/", rateLimitSurvey, createSurvey); // publik — diisi alumni (rate limited)
router.get("/", protect, getAllSurvey); // admin only
router.get("/stats", protect, getStats); // admin only
router.get("/tahun-list", protect, getTahunList); // admin only
router.get("/laporan/:tahun", protect, getLaporan); // admin only
router.get("/export/:tahun", protect, exportSurveyPdf); // admin only
router.get("/export-excel/:tahun", protect, exportSurveyExcel); // admin only

export default router;
