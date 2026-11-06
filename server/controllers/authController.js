import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import {
  findAdminByUsername,
  findAdminById,
  createAdmin,
  updateAdminPassword,
  getAdminProfile,
  updateAdminProfile,
  updateAdminFoto,
  updateAdminLastLogin,
  isUsernameTaken,
  isUsernameExist,
  getAllAdmins,
  deleteAdminById,
  countSuperAdmins,
} from "../models/Admin.js";

const VALID_ROLES = ["Administrator", "SuperAdmin"];

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Hash dummy: waktu respons seragam saat user tidak ditemukan (anti timing attack)
const DUMMY_HASH =
  "$2b$10$abcdefghijklmnopqrstuvwxyz01234567890ABCDE/FGHIJKLMNOP";

// ─── Login ────────────────────────────────────────────────────────────────────
export const loginAdmin = async (req, res, next) => {
  try {
    const rawUsername = (req.body || {}).username;
    const rawPassword = (req.body || {}).password;

    // Validasi tipe: username dan password wajib string
    if (
      typeof rawUsername !== "string" ||
      typeof rawPassword !== "string" ||
      !rawUsername.trim() ||
      !rawPassword
    ) {
      return res
        .status(400)
        .json({ message: "Username dan password wajib diisi" });
    }

    const username = rawUsername.trim();
    const password = rawPassword;

    const admin = await findAdminByUsername(username);

    // Selalu jalankan bcrypt.compare (gunakan hash dummy jika user tidak ada)
    // Tujuan: waktu respons seragam → cegah timing attack / user enumeration
    const hashToCompare = admin ? admin.password : DUMMY_HASH;
    const isMatch = await bcrypt.compare(password, hashToCompare);

    if (!admin || !isMatch) {
      return res.status(401).json({ message: "Username atau password salah" });
    }

    const token = jwt.sign(
      { id: admin.id, username: admin.username },
      process.env.JWT_SECRET,
      { expiresIn: "1d" },
    );

    // Update waktu login terakhir admin
    await updateAdminLastLogin(admin.id);

    res.json({ token, username: admin.username });
  } catch (error) {
    next(error);
  }
};

// ─── Ubah Password ────────────────────────────────────────────────────────────
export const ubahPasswordAdmin = async (req, res, next) => {
  try {
    const passwordLama =
      req.body.passwordLama || req.body.oldPassword || req.body.currentPassword;
    const passwordBaru = req.body.passwordBaru || req.body.newPassword;
    const konfirmasiPassword =
      req.body.konfirmasiPassword || req.body.confirmPassword;

    if (!passwordLama || !passwordBaru) {
      return res
        .status(400)
        .json({ message: "Password lama dan password baru wajib diisi" });
    }

    if (passwordBaru.length < 6) {
      return res
        .status(400)
        .json({ message: "Password baru minimal 6 karakter" });
    }

    if (konfirmasiPassword && passwordBaru !== konfirmasiPassword) {
      return res
        .status(400)
        .json({ message: "Konfirmasi password baru tidak cocok" });
    }

    // Ambil data admin dari token (id atau username)
    let admin = null;
    if (req.admin?.id) {
      admin = await findAdminById(req.admin.id);
    }
    if (!admin && req.admin?.username) {
      admin = await findAdminByUsername(req.admin.username);
    }

    if (!admin) {
      return res.status(404).json({ message: "Akun admin tidak ditemukan" });
    }

    // Cek kecocokan password lama dengan hash di MySQL
    const isMatch = await bcrypt.compare(passwordLama, admin.password);
    if (!isMatch) {
      return res
        .status(400)
        .json({ message: "Password lama yang Anda masukkan salah" });
    }

    // Hash password baru dan simpan ke database MySQL
    const hashedPassword = await bcrypt.hash(passwordBaru, 10);
    const berhasil = await updateAdminPassword(admin.id, hashedPassword);

    if (!berhasil) {
      return res
        .status(500)
        .json({ message: "Gagal menyimpan password baru ke database" });
    }

    res.json({ message: "Password berhasil diperbarui" });
  } catch (error) {
    next(error);
  }
};

// ─── Get Profil ───────────────────────────────────────────────────────────────
export const getProfilAdmin = async (req, res, next) => {
  try {
    const adminId = req.admin?.id;
    if (!adminId)
      return res.status(401).json({ message: "Tidak terautentikasi" });

    const profil = await getAdminProfile(adminId);
    if (!profil)
      return res.status(404).json({ message: "Profil admin tidak ditemukan" });

    res.json(profil);
  } catch (error) {
    next(error);
  }
};

// ─── Update Profil ────────────────────────────────────────────────────────────
export const updateProfilAdmin = async (req, res, next) => {
  try {
    const adminId = req.admin?.id;
    if (!adminId)
      return res.status(401).json({ message: "Tidak terautentikasi" });

    const { username, nama, email, telepon, role, hapusFoto } = req.body;

    if (!username || !username.trim()) {
      return res.status(400).json({ message: "Username wajib diisi" });
    }

    // Ambil role terkini dari DB — jadi acuan, bukan dari request body
    const currentAdmin = await findAdminById(adminId);
    if (!currentAdmin) {
      return res.status(404).json({ message: "Akun admin tidak ditemukan" });
    }

    // SuperAdmin tidak boleh di-downgrade rolenya lewat edit profil
    if (currentAdmin.role === "SuperAdmin" && role && role.trim() !== "SuperAdmin") {
      return res.status(403).json({
        message: "Role SuperAdmin tidak dapat diubah.",
      });
    }

    // Administrator biasa tidak bisa eskalasi role sendiri ke SuperAdmin
    if (currentAdmin.role !== "SuperAdmin" && role && role.trim() === "SuperAdmin") {
      return res.status(403).json({
        message: "Perubahan role tidak diizinkan. Privilege escalation ditolak.",
      });
    }

    // Cek apakah username sudah dipakai admin lain
    const taken = await isUsernameTaken(username.trim(), adminId);
    if (taken) {
      return res
        .status(400)
        .json({ message: "Username sudah digunakan oleh akun lain" });
    }

    const currentProfil = await getAdminProfile(adminId);
    let fotoBaru = undefined;

    // Jika ada upload foto baru via multipart
    if (req.file) {
      fotoBaru = `/uploads/${req.file.filename}`;
      // Hapus foto lama jika tersimpan di uploads
      if (currentProfil?.foto && currentProfil.foto.startsWith("/uploads/")) {
        const oldFile = path.join(__dirname, "..", currentProfil.foto);
        if (fs.existsSync(oldFile)) {
          try {
            fs.unlinkSync(oldFile);
          } catch (e) {
            /* abaikan jika gagal hapus */
          }
        }
      }
    } else if (hapusFoto === "true" || hapusFoto === true) {
      // Admin memilih hapus foto profil
      fotoBaru = null;
      if (currentProfil?.foto && currentProfil.foto.startsWith("/uploads/")) {
        const oldFile = path.join(__dirname, "..", currentProfil.foto);
        if (fs.existsSync(oldFile)) {
          try {
            fs.unlinkSync(oldFile);
          } catch (e) {
            /* abaikan jika gagal hapus */
          }
        }
      }
    }

    await updateAdminProfile(adminId, {
      username: username.trim(),
      nama: nama?.trim() || username.trim(),
      email: email?.trim() || "",
      telepon: telepon?.trim() || "",
      role: currentAdmin.role, // Kunci role sesuai DB, tidak bisa diubah sendiri
      foto: fotoBaru,
    });

    // Ambil data terbaru setelah update
    const profilBaru = await getAdminProfile(adminId);

    res.json({ message: "Profil berhasil diperbarui", profil: profilBaru });
  } catch (error) {
    next(error);
  }
};

// ─── Khusus Upload Foto Saja ───────────────────────────────────────────────────
export const uploadFotoAdmin = async (req, res, next) => {
  try {
    const adminId = req.admin?.id;
    if (!adminId)
      return res.status(401).json({ message: "Tidak terautentikasi" });

    if (!req.file) {
      return res
        .status(400)
        .json({ message: "Tidak ada file foto yang dipilih" });
    }

    const currentProfil = await getAdminProfile(adminId);
    if (currentProfil?.foto && currentProfil.foto.startsWith("/uploads/")) {
      const oldFile = path.join(__dirname, "..", currentProfil.foto);
      if (fs.existsSync(oldFile)) {
        try {
          fs.unlinkSync(oldFile);
        } catch (e) {
          /* abaikan */
        }
      }
    }

    const fotoUrl = `/uploads/${req.file.filename}`;
    await updateAdminFoto(adminId, fotoUrl);

    const profilBaru = await getAdminProfile(adminId);
    res.json({
      message: "Foto profil berhasil diperbarui",
      foto: fotoUrl,
      profil: profilBaru,
    });
  } catch (error) {
    next(error);
  }
};

// ─── Hapus Foto Profil ─────────────────────────────────────────────────────────
export const hapusFotoAdmin = async (req, res, next) => {
  try {
    const adminId = req.admin?.id;
    if (!adminId)
      return res.status(401).json({ message: "Tidak terautentikasi" });

    const currentProfil = await getAdminProfile(adminId);
    if (currentProfil?.foto && currentProfil.foto.startsWith("/uploads/")) {
      const oldFile = path.join(__dirname, "..", currentProfil.foto);
      if (fs.existsSync(oldFile)) {
        try {
          fs.unlinkSync(oldFile);
        } catch (e) {
          /* abaikan */
        }
      }
    }

    await updateAdminFoto(adminId, null);
    const profilBaru = await getAdminProfile(adminId);
    res.json({ message: "Foto profil berhasil dihapus", profil: profilBaru });
  } catch (error) {
    next(error);
  }
};

// ─── Tambah Akun Admin ────────────────────────────────────────────────────────
export const tambahAkunAdmin = async (req, res, next) => {
  try {
    const rawUsername = (req.body || {}).username;
    const rawPassword = (req.body || {}).password;
    const rawKonfirmasi = (req.body || {}).konfirmasiPassword;
    const rawNama = (req.body || {}).nama;
    const rawRole = (req.body || {}).role;

    // Validasi tipe & kekosongan
    if (
      typeof rawUsername !== "string" ||
      typeof rawPassword !== "string" ||
      !rawUsername.trim() ||
      !rawPassword
    ) {
      return res
        .status(400)
        .json({ message: "Username dan password wajib diisi" });
    }

    const username = rawUsername.trim();
    const nama = rawNama?.trim() || username;

    // Panjang minimum
    if (username.length < 3) {
      return res
        .status(400)
        .json({ message: "Username minimal 3 karakter" });
    }

    // Hanya boleh huruf, angka, underscore, atau titik — cegah injection via username
    if (!/^[a-zA-Z0-9_.]+$/.test(username)) {
      return res.status(400).json({
        message:
          "Username hanya boleh mengandung huruf, angka, titik, atau underscore",
      });
    }

    if (rawPassword.length < 6) {
      return res
        .status(400)
        .json({ message: "Password minimal 6 karakter" });
    }

    if (rawKonfirmasi && rawPassword !== rawKonfirmasi) {
      return res
        .status(400)
        .json({ message: "Konfirmasi password tidak cocok" });
    }

    // Validasi role — hanya nilai yang diizinkan, default ke Administrator
    const roleBaru = rawRole && VALID_ROLES.includes(rawRole.trim())
      ? rawRole.trim()
      : "Administrator";

    // Cek username sudah terpakai
    const sudahAda = await isUsernameExist(username);
    if (sudahAda) {
      return res
        .status(409)
        .json({ message: "Username sudah digunakan, pilih username lain" });
    }

    // Hash password sebelum disimpan
    const hashedPassword = await bcrypt.hash(rawPassword, 10);

    // Simpan ke DB dengan role yang ditentukan
    const { id } = await createAdmin(username, hashedPassword, roleBaru);

    // Perbarui kolom nama setelah insert jika berbeda dari username
    if (nama !== username) {
      await updateAdminProfile(id, {
        username,
        nama,
        email: "",
        telepon: "",
        role: roleBaru,
      });
    }

    return res.status(201).json({
      message: `Akun admin "${username}" berhasil dibuat`,
      admin: { id, username, nama, role: roleBaru },
    });
  } catch (error) {
    next(error);
  }
};

// ─── Daftar Semua Admin ───────────────────────────────────────────────────────
export const getDaftarAdmin = async (req, res, next) => {
  try {
    const admins = await getAllAdmins();
    // Jangan kirim password ke client — query sudah tidak include kolom password
    return res.json(admins);
  } catch (error) {
    next(error);
  }
};

// ─── Hapus Akun Admin ─────────────────────────────────────────────────────────
export const hapusAkunAdmin = async (req, res, next) => {
  try {
    const rawId = req.params.id;
    const targetId = /^\d+$/.test(rawId) ? parseInt(rawId, 10) : NaN;

    if (!targetId || isNaN(targetId)) {
      return res.status(400).json({ message: "ID admin tidak valid" });
    }

    // Admin tidak boleh menghapus dirinya sendiri
    if (req.admin?.id === targetId) {
      return res
        .status(400)
        .json({ message: "Anda tidak dapat menghapus akun Anda sendiri" });
    }

    const target = await findAdminById(targetId);
    if (!target) {
      return res.status(404).json({ message: "Akun admin tidak ditemukan" });
    }

    // Proteksi: akun SuperAdmin tidak dapat dihapus oleh siapapun
    if (target.role === "SuperAdmin") {
      return res.status(403).json({
        message: "Akun SuperAdmin tidak dapat dihapus dari sistem",
      });
    }

    const berhasil = await deleteAdminById(targetId);
    if (!berhasil) {
      return res
        .status(500)
        .json({ message: "Gagal menghapus akun admin dari database" });
    }

    return res.json({ message: `Akun admin "${target.username}" berhasil dihapus` });
  } catch (error) {
    next(error);
  }
};
