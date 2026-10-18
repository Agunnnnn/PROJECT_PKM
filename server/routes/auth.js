import express from "express";
import {
  loginAdmin,
  ubahPasswordAdmin,
  getProfilAdmin,
  updateProfilAdmin,
} from "../controllers/authController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.post("/login", loginAdmin);
router.put("/ubah-password", protect, ubahPasswordAdmin);
router.post("/ubah-password", protect, ubahPasswordAdmin);
router.get("/profil", protect, getProfilAdmin);
router.put("/profil", protect, updateProfilAdmin);

export default router;
