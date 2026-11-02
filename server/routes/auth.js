import express from "express";
import {
  loginAdmin,
  ubahPasswordAdmin,
  getProfilAdmin,
  updateProfilAdmin,
  uploadFotoAdmin,
  hapusFotoAdmin,
  tambahAkunAdmin,
  getDaftarAdmin,
  hapusAkunAdmin,
} from "../controllers/authController.js";
import { protect } from "../middleware/auth.js";
import { handleUploadFoto } from "../middleware/upload.js";
import { rateLimitLogin } from "../middleware/rateLimiter.js";

const router = express.Router();

router.post("/login", rateLimitLogin, loginAdmin);
router.put("/ubah-password", protect, ubahPasswordAdmin);
router.post("/ubah-password", protect, ubahPasswordAdmin);
router.get("/profil", protect, getProfilAdmin);
router.put("/profil", protect, handleUploadFoto, updateProfilAdmin);
router.post("/profil/foto", protect, handleUploadFoto, uploadFotoAdmin);
router.delete("/profil/foto", protect, hapusFotoAdmin);

// ─── Manajemen Akun Admin (hanya bisa diakses admin yang sudah login) ──────────
router.get("/admin-list", protect, getDaftarAdmin);
router.post("/tambah-admin", protect, tambahAkunAdmin);
router.delete("/hapus-admin/:id", protect, hapusAkunAdmin);

export default router;
