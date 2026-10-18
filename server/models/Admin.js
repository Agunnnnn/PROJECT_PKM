import pool from "../config/db.js";

export const findAdminByUsername = async (username) => {
  const [rows] = await pool.query("SELECT * FROM admin WHERE username = ?", [username]);
  return rows[0];
};

export const findAdminById = async (id) => {
  const [rows] = await pool.query("SELECT * FROM admin WHERE id = ?", [id]);
  return rows[0];
};

export const createAdmin = async (username, hashedPassword) => {
  const [result] = await pool.query(
    "INSERT INTO admin (username, password) VALUES (?, ?)",
    [username, hashedPassword]
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
    "SELECT id, username, nama, email, telepon, role, foto FROM admin WHERE id = ?",
    [id]
  );
  return rows[0];
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
