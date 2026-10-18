import express from "express";
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

// Rate limiter ringan untuk endpoint publik prediksi-relevansi
const ipRequests = new Map();
const rateLimitPrediksi = (req, res, next) => {
    const ip = req.ip || req.headers["x-forwarded-for"] || req.socket.remoteAddress || "global";
    const now = Date.now();
    const windowMs = 60 * 1000;
    const maxRequests = 40;

    const record = ipRequests.get(ip) || { count: 0, resetTime: now + windowMs };
    if (now > record.resetTime) {
        record.count = 1;
        record.resetTime = now + windowMs;
    } else {
        record.count++;
    }
    ipRequests.set(ip, record);

    if (record.count > maxRequests) {
        return res.status(429).json({
            message: "Terlalu banyak permintaan prediksi. Silakan tunggu beberapa saat.",
            tersedia: false,
        });
    }
    next();
};

router.post("/prediksi-relevansi", rateLimitPrediksi, prediksiRelevansi); // publik — diisi alumni di langkah 2 -> 3
router.post("/hitung-ulang-relevansi", protect, hitungUlangRelevansi); // admin only
router.post("/", createSurvey); // publik — diisi alumni
router.get("/", protect, getAllSurvey); // admin only
router.get("/stats", protect, getStats); // admin only
router.get("/tahun-list", protect, getTahunList); // admin only
router.get("/laporan/:tahun", protect, getLaporan); // admin only
router.get("/export/:tahun", protect, exportSurveyPdf); // admin only
router.get("/export-excel/:tahun", protect, exportSurveyExcel); // admin only

export default router;
