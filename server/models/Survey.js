import pool from "../config/db.js";

export const createSurveyEntry = async ({
  alumniId,
  statusSaatIni,
  namaPerusahaan,
  bidangKerja,
  relevansiJurusan,
  lamaTungguKerja,
  namaKampus,
  saranUntukSekolah,
}) => {
  const [result] = await pool.query(
    `INSERT INTO survey
      (alumni_id, status_saat_ini, nama_perusahaan, bidang_kerja, relevansi_jurusan, lama_tunggu_kerja, nama_kampus, saran_untuk_sekolah)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      alumniId,
      statusSaatIni,
      namaPerusahaan || null,
      bidangKerja || null,
      relevansiJurusan || null,
      lamaTungguKerja || null,
      namaKampus || null,
      saranUntukSekolah || null,
    ]
  );
  return { id: result.insertId };
};

export const getAllSurveyWithAlumni = async () => {
  const [rows] = await pool.query(
    `SELECT s.*, a.nama, a.nis, a.jurusan, a.tahun_lulus
     FROM survey s
     JOIN alumni a ON s.alumni_id = a.id
     ORDER BY s.created_at DESC`
  );
  return rows;
};

export const getStatusCount = async () => {
  const [rows] = await pool.query(
    "SELECT status_saat_ini AS status, COUNT(*) AS jumlah FROM survey GROUP BY status_saat_ini"
  );
  return rows;
};

export const getRelevansiCount = async () => {
  const [rows] = await pool.query(
    `SELECT relevansi_jurusan AS relevansi, COUNT(*) AS jumlah
     FROM survey
     WHERE relevansi_jurusan IS NOT NULL
     GROUP BY relevansi_jurusan`
  );
  return rows;
};

export const countAlumni = async () => {
  const [rows] = await pool.query("SELECT COUNT(*) AS total FROM alumni");
  return rows[0].total;
};

export const countSurvey = async () => {
  const [rows] = await pool.query("SELECT COUNT(*) AS total FROM survey");
  return rows[0].total;
};
