import express from "express";
import {
    createSurvey,
    getAllSurvey,
    getStats,
    getTahunList,
    exportSurveyPdf,
    exportSurveyExcel,
} from "../controllers/surveyController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.post("/", createSurvey); // publik — diisi alumni
router.get("/", protect, getAllSurvey); // admin only
router.get("/stats", protect, getStats); // admin only
router.get("/tahun-list", protect, getTahunList); // admin only
router.get("/export/:tahun", protect, exportSurveyPdf); // admin only
router.get("/export-excel/:tahun", protect, exportSurveyExcel); // admin only

export default router;
