import express from "express";
import {
    findOrCreateAlumni,
    getAllAlumni,
} from "../controllers/alumniController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.post("/", findOrCreateAlumni);
router.get("/", protect, getAllAlumni);

export default router;
