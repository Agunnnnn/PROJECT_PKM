import express from "express";
import {
    findOrCreateAlumni,
    getAllAlumni,
    getJurusanList,
    getTahunByJurusan,
    searchAlumni,
} from "../controllers/alumniController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.get("/jurusan-list", getJurusanList); // publik
router.get("/tahun-by-jurusan", getTahunByJurusan); // publik
router.get("/search", searchAlumni); // publik
router.post("/", findOrCreateAlumni);
router.get("/", protect, getAllAlumni);

export default router;
