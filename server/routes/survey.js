import express from "express";
import { createSurvey, getAllSurvey, getStats } from "../controllers/surveyController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.post("/", createSurvey);          // publik — diisi alumni
router.get("/", protect, getAllSurvey);  // admin only
router.get("/stats", protect, getStats); // admin only

export default router;
