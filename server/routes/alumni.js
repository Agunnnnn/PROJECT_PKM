import express from "express";
import {
  findOrCreateAlumni,
  tambahAlumni,
  editAlumni,
  hapusAlumni,
  getAlumniById,
  importAlumniExcel,
  getAllAlumni,
  getJurusanList,
  getTahunList,
  getTahunByJurusan,
  searchAlumni,
  exportAlumniExcel,
} from "../controllers/alumniController.js";
import { protect } from "../middleware/auth.js";
import { handleUploadExcel } from "../middleware/upload.js";

const router = express.Router();

// ─── Publik (dipakai form survei alumni) ──────────────────────────────────────
router.get("/jurusan-list", getJurusanList);
router.get("/tahun-list", getTahunList); // semua tahun unik dari DB
router.get("/tahun-by-jurusan", getTahunByJurusan);
router.get("/search", searchAlumni);
router.post("/", findOrCreateAlumni); // form survei publik (find-or-create)

// ─── Admin only ───────────────────────────────────────────────────────────────
router.get("/", protect, getAllAlumni);
router.get("/export-excel", protect, exportAlumniExcel);

// CRUD manual
router.get("/:id", protect, getAlumniById);
router.post("/tambah", protect, tambahAlumni);
router.put("/:id", protect, editAlumni);
router.delete("/:id", protect, hapusAlumni);

// Import massal
router.post("/import-excel", protect, handleUploadExcel, importAlumniExcel);

export default router;
