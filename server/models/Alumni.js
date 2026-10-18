import pool from "../config/db.js";

export const findAlumniByNis = async (nis) => {
    const [rows] = await pool.query("SELECT * FROM alumni WHERE nis = ?", [
        nis,
    ]);
    return rows[0];
};

export const createAlumni = async ({
    nis,
    nama,
    jurusan,
    tahunLulus,
    email,
    noHp,
}) => {
    const [result] = await pool.query(
        "INSERT INTO alumni (nis, nama, jurusan, tahun_lulus, email, no_hp) VALUES (?, ?, ?, ?, ?, ?)",
        [nis, nama, jurusan, tahunLulus, email || null, noHp || null],
    );
    return { id: result.insertId, nis, nama, jurusan, tahunLulus, email, noHp };
};

export const getAllAlumni = async () => {
    const [rows] = await pool.query(
        "SELECT * FROM alumni ORDER BY created_at DESC",
    );
    return rows;
};

export const getDistinctJurusan = async () => {
    const [rows] = await pool.query(
        "SELECT DISTINCT jurusan FROM alumni ORDER BY jurusan ASC",
    );
    return rows.map((r) => r.jurusan);
};

export const getDistinctTahunByJurusan = async (jurusan) => {
    const [rows] = await pool.query(
        "SELECT DISTINCT tahun_lulus FROM alumni WHERE jurusan = ? ORDER BY tahun_lulus DESC",
        [jurusan],
    );
    return rows.map((r) => r.tahun_lulus);
};

export const getAlumniByJurusanTahun = async (jurusan, tahunLulus) => {
    const [rows] = await pool.query(
        "SELECT id, nis, nama FROM alumni WHERE jurusan = ? AND tahun_lulus = ? ORDER BY nama ASC",
        [jurusan, tahunLulus],
    );
    return rows;
};

export const getAlumniWithSurvey = async ({ jurusan, tahunLulus, search } = {}) => {
    let query = `
        SELECT 
            a.id, a.nis, a.nama, a.jurusan, a.tahun_lulus, a.email, a.no_hp,
            s.status_saat_ini, s.nama_perusahaan, s.bidang_kerja, s.relevansi_jurusan,
            s.lama_tunggu_kerja, s.nama_kampus, s.jurusan_kampus, s.saran_untuk_sekolah,
            s.created_at AS tanggal_survey
        FROM alumni a
        LEFT JOIN survey s ON a.id = s.alumni_id
        WHERE 1=1
    `;
    const params = [];

    if (jurusan && jurusan !== "Semua") {
        query += " AND a.jurusan = ?";
        params.push(jurusan);
    }

    if (tahunLulus && tahunLulus !== "Semua") {
        query += " AND a.tahun_lulus = ?";
        params.push(tahunLulus);
    }

    if (search && search.trim()) {
        query += " AND (a.nama LIKE ? OR a.nis LIKE ?)";
        params.push(`%${search.trim()}%`, `%${search.trim()}%`);
    }

    query += " ORDER BY a.tahun_lulus DESC, a.nama ASC";

    const [rows] = await pool.query(query, params);
    return rows;
};

