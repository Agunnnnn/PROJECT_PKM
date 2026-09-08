import pool from "../config/db.js";

export const findAdminByUsername = async (username) => {
  const [rows] = await pool.query("SELECT * FROM admin WHERE username = ?", [username]);
  return rows[0];
};

export const createAdmin = async (username, hashedPassword) => {
  const [result] = await pool.query(
    "INSERT INTO admin (username, password) VALUES (?, ?)",
    [username, hashedPassword]
  );
  return { id: result.insertId, username };
};
