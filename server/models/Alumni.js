import pool from "../config/db.js";

export const findAlumniByNis = async (nis) => {
  const [rows] = await pool.query("SELECT * FROM alumni WHERE nis = ?", [nis]);
  return rows[0];
};

export const createAlumni = async ({ nis, nama, jurusan, tahunLulus, email, noHp }) => {
  const [result] = await pool.query(
    "INSERT INTO alumni (nis, nama, jurusan, tahun_lulus, email, no_hp) VALUES (?, ?, ?, ?, ?, ?)",
    [nis, nama, jurusan, tahunLulus, email || null, noHp || null]
  );
  return { id: result.insertId, nis, nama, jurusan, tahunLulus, email, noHp };
};

export const getAllAlumni = async () => {
  const [rows] = await pool.query("SELECT * FROM alumni ORDER BY created_at DESC");
  return rows;
};
