import pool from "../config/db.js";

export const findAdminByUsername = async (username) => {
  const [rows] = await pool.query("SELECT * FROM admin WHERE username = ?", [username]);
  return rows[0];
};

export const findAdminById = async (id) => {
  const [rows] = await pool.query("SELECT * FROM admin WHERE id = ?", [id]);
  return rows[0];
};

export const createAdmin = async (username, hashedPassword, role = "Administrator") => {
  const [result] = await pool.query(
    "INSERT INTO admin (username, password, role) VALUES (?, ?, ?)",
    [username, hashedPassword, role]
  );
  return { id: result.insertId, username };
};

export const updateAdminPassword = async (id, hashedPassword) => {
  const [result] = await pool.query(
    "UPDATE admin SET password = ? WHERE id = ?",
    [hashedPassword, id]
  );
  return result.affectedRows > 0;
};

export const getAdminProfile = async (id) => {
  const [rows] = await pool.query(
    "SELECT id, username, nama, email, telepon, role, foto, status, last_login FROM admin WHERE id = ?",
    [id]
  );
  return rows[0];
};

export const updateAdminLastLogin = async (id) => {
  try {
    const [result] = await pool.query(
      "UPDATE admin SET last_login = NOW() WHERE id = ?",
      [id]
    );
    return result.affectedRows > 0;
  } catch (err) {
    console.warn("[WARN] Gagal update last_login (jalankan npm run migrate):", err.message);
    return false;
  }
};

export const updateAdminProfile = async (id, { username, nama, email, telepon, role, foto }) => {
  if (foto !== undefined) {
    const [result] = await pool.query(
      "UPDATE admin SET username = ?, nama = ?, email = ?, telepon = ?, role = ?, foto = ? WHERE id = ?",
      [username, nama, email, telepon || "", role || "Administrator", foto, id]
    );
    return result.affectedRows > 0;
  }

  const [result] = await pool.query(
    "UPDATE admin SET username = ?, nama = ?, email = ?, telepon = ?, role = ? WHERE id = ?",
    [username, nama, email, telepon || "", role || "Administrator", id]
  );
  return result.affectedRows > 0;
};

export const updateAdminFoto = async (id, foto) => {
  const [result] = await pool.query(
    "UPDATE admin SET foto = ? WHERE id = ?",
    [foto, id]
  );
  return result.affectedRows > 0;
};

export const isUsernameTaken = async (username, currentAdminId) => {
  const [rows] = await pool.query(
    "SELECT id FROM admin WHERE username = ? AND id != ?",
    [username, currentAdminId]
  );
  return rows.length > 0;
};

export const isUsernameExist = async (username) => {
  const [rows] = await pool.query(
    "SELECT id FROM admin WHERE username = ?",
    [username]
  );
  return rows.length > 0;
};

export const getAllAdmins = async () => {
  const [rows] = await pool.query(
    "SELECT id, username, nama, email, telepon, role, foto, created_at FROM admin ORDER BY created_at ASC"
  );
  return rows;
};

export const deleteAdminById = async (id) => {
  // Proteksi: SuperAdmin tidak boleh dihapus via query ini
  const [rows] = await pool.query("SELECT role FROM admin WHERE id = ?", [id]);
  if (rows[0]?.role === "SuperAdmin") {
    throw new Error("SuperAdmin tidak dapat dihapus dari sistem");
  }
  const [result] = await pool.query("DELETE FROM admin WHERE id = ?", [id]);
  return result.affectedRows > 0;
};

export const countSuperAdmins = async () => {
  const [rows] = await pool.query(
    "SELECT COUNT(*) AS total FROM admin WHERE role = 'SuperAdmin'"
  );
  return rows[0]?.total || 0;
};
