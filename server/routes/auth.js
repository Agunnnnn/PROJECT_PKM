import express from "express";
import {
  loginAdmin,
  ubahPasswordAdmin,
  getProfilAdmin,
  updateProfilAdmin,
  uploadFotoAdmin,
  hapusFotoAdmin,
} from "../controllers/authController.js";
import { protect } from "../middleware/auth.js";
import { handleUploadFoto } from "../middleware/upload.js";

const router = express.Router();

router.post("/login", loginAdmin);
router.put("/ubah-password", protect, ubahPasswordAdmin);
router.post("/ubah-password", protect, ubahPasswordAdmin);
router.get("/profil", protect, getProfilAdmin);
router.put("/profil", protect, handleUploadFoto, updateProfilAdmin);
router.post("/profil/foto", protect, handleUploadFoto, uploadFotoAdmin);
router.delete("/profil/foto", protect, hapusFotoAdmin);

export default router;
