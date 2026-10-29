import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadDir = path.join(__dirname, "../uploads");

// Pastikan folder uploads ada
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Konfigurasi penyimpanan
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const adminId = req.admin?.id || "admin";
    const ext = path.extname(file.originalname).toLowerCase();
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e6)}`;
    cb(null, `admin-${adminId}-${uniqueSuffix}${ext}`);
  },
});

// Filter tipe file gambar
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|webp|gif/;
  const extValid = allowedTypes.test(
    path.extname(file.originalname).toLowerCase(),
  );
  const mimeValid = allowedTypes.test(file.mimetype);

  if (extValid && mimeValid) {
    cb(null, true);
  } else {
    cb(
      new Error(
        "Hanya file gambar (JPG, JPEG, PNG, WEBP, GIF) yang diperbolehkan",
      ),
      false,
    );
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
});

// Middleware wrapper untuk menangani error multer dengan ramah
export const handleUploadFoto = (req, res, next) => {
  const uploadSingle = upload.single("foto");

  uploadSingle(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === "LIMIT_FILE_SIZE") {
        return res
          .status(400)
          .json({ message: "Ukuran file terlalu besar, maksimal 5MB." });
      }
      return res
        .status(400)
        .json({ message: `Gagal mengunggah foto: ${err.message}` });
    } else if (err) {
      return res.status(400).json({ message: err.message });
    }
    next();
  });
};

// ─── Multer Memori: Import Excel ──────────────────────────────────────────────
const excelStorage = multer.memoryStorage();
const excelFileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  const allowed = [".xlsx", ".xls"];
  if (allowed.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error("Hanya file Excel (.xlsx, .xls) yang diperbolehkan"), false);
  }
};

export const uploadExcel = multer({
  storage: excelStorage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: excelFileFilter,
});

export const handleUploadExcel = (req, res, next) => {
  const uploadSingle = uploadExcel.single("file");

  uploadSingle(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === "LIMIT_FILE_SIZE") {
        return res
          .status(400)
          .json({ message: "Ukuran file terlalu besar, maksimal 10MB." });
      }
      return res
        .status(400)
        .json({ message: `Gagal mengunggah file: ${err.message}` });
    } else if (err) {
      return res.status(400).json({ message: err.message });
    }
    next();
  });
};
