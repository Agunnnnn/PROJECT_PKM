import jwt from "jsonwebtoken";
import { findAdminById } from "../models/Admin.js";

export const protect = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Tidak ada token, akses ditolak" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.admin = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Token tidak valid atau kedaluwarsa" });
  }
};

// Middleware: hanya SuperAdmin yang boleh melanjutkan
// Selalu re-query DB agar role yang tersimpan di DB jadi acuan, bukan token lama
export const requireSuperAdmin = async (req, res, next) => {
  try {
    const adminId = req.admin?.id;
    if (!adminId) {
      return res.status(401).json({ message: "Tidak terautentikasi" });
    }

    const admin = await findAdminById(adminId);
    if (!admin || admin.role !== "SuperAdmin") {
      return res.status(403).json({
        message: "Akses ditolak. Hanya SuperAdmin yang dapat melakukan tindakan ini.",
      });
    }

    // Sertakan role terkini ke req.admin supaya controller bisa menggunakannya
    req.admin.role = admin.role;
    next();
  } catch (error) {
    next(error);
  }
};
