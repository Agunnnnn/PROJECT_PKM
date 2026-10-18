import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import {
  findAdminByUsername,
  findAdminById,
  updateAdminPassword,
  getAdminProfile,
  updateAdminProfile,
  isUsernameTaken,
} from "../models/Admin.js";

// ─── Login ────────────────────────────────────────────────────────────────────
export const loginAdmin = async (req, res) => {
  try {
    const { username, password } = req.body;

    const admin = await findAdminByUsername(username);
    if (!admin) {
      return res.status(400).json({ message: "Username atau password salah" });
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Username atau password salah" });
    }

    const token = jwt.sign(
      { id: admin.id, username: admin.username },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({ token, username: admin.username });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── Ubah Password ────────────────────────────────────────────────────────────
export const ubahPasswordAdmin = async (req, res) => {
  try {
    const passwordLama =
      req.body.passwordLama ||
      req.body.oldPassword ||
      req.body.currentPassword;
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
      return res.status(500).json({ message: "Gagal menyimpan password baru ke database" });
    }

    res.json({ message: "Password berhasil diperbarui" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── Get Profil ───────────────────────────────────────────────────────────────
export const getProfilAdmin = async (req, res) => {
  try {
    const adminId = req.admin?.id;
    if (!adminId) return res.status(401).json({ message: "Tidak terautentikasi" });

    const profil = await getAdminProfile(adminId);
    if (!profil) return res.status(404).json({ message: "Profil admin tidak ditemukan" });

    res.json(profil);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── Update Profil ────────────────────────────────────────────────────────────
export const updateProfilAdmin = async (req, res) => {
  try {
    const adminId = req.admin?.id;
    if (!adminId) return res.status(401).json({ message: "Tidak terautentikasi" });

    const { username, nama, email, telepon, role } = req.body;

    if (!username || !username.trim()) {
      return res.status(400).json({ message: "Username wajib diisi" });
    }

    // Cek apakah username sudah dipakai admin lain
    const taken = await isUsernameTaken(username.trim(), adminId);
    if (taken) {
      return res.status(400).json({ message: "Username sudah digunakan oleh akun lain" });
    }

    await updateAdminProfile(adminId, {
      username: username.trim(),
      nama: nama?.trim() || username.trim(),
      email: email?.trim() || "",
      telepon: telepon?.trim() || "",
      role: role?.trim() || "Administrator",
    });

    // Ambil data terbaru setelah update
    const profilBaru = await getAdminProfile(adminId);

    res.json({ message: "Profil berhasil diperbarui", profil: profilBaru });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
