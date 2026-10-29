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

export const getDistinctTahun = async () => {
    const [rows] = await pool.query(
        "SELECT DISTINCT tahun_lulus FROM alumni ORDER BY tahun_lulus DESC",
    );
    return rows.map((r) => r.tahun_lulus);
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
            s.id AS survey_id,
            s.status_saat_ini, s.nama_perusahaan, s.bidang_kerja, s.relevansi_jurusan,
            s.lama_tunggu_kerja, s.nama_kampus, s.jurusan_kampus, s.saran_untuk_sekolah,
            s.created_at AS tanggal_survey
        FROM alumni a
        LEFT JOIN (
            SELECT s1.*
            FROM survey s1
            INNER JOIN (
                SELECT alumni_id, MAX(id) AS max_id
                FROM survey
                GROUP BY alumni_id
            ) s2 ON s1.id = s2.max_id
        ) s ON a.id = s.alumni_id
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

export const updateAlumni = async (id, { nis, nama, jurusan, tahunLulus, email, noHp }) => {
    const [result] = await pool.query(
        "UPDATE alumni SET nis = ?, nama = ?, jurusan = ?, tahun_lulus = ?, email = ?, no_hp = ? WHERE id = ?",
        [nis, nama, jurusan, tahunLulus, email || null, noHp || null, id],
    );
    return result.affectedRows > 0;
};

export const deleteAlumni = async (id) => {
    // Bungkus dalam transaksi: survey dan alumni harus terhapus bersamaan (atomic)
    const conn = await pool.getConnection();
    try {
        await conn.beginTransaction();
        await conn.query("DELETE FROM survey WHERE alumni_id = ?", [id]);
        const [result] = await conn.query("DELETE FROM alumni WHERE id = ?", [id]);
        await conn.commit();
        return result.affectedRows > 0;
    } catch (err) {
        await conn.rollback();
        throw err;
    } finally {
        conn.release();
    }
};

export const findAlumniById = async (id) => {
    const [rows] = await pool.query("SELECT * FROM alumni WHERE id = ?", [id]);
    return rows[0];
};

// Bulk insert untuk import dibungkus transaksi (atomic); skip jika NIS sudah ada
export const bulkInsertAlumni = async (rows) => {
    if (!rows || rows.length === 0) return { inserted: 0, skipped: 0, skippedDetail: [] };
    const conn = await pool.getConnection();
    try {
        await conn.beginTransaction();
        let inserted = 0;
        let skipped = 0;
        const skippedDetail = [];

        for (const r of rows) {
            const [existing] = await conn.query("SELECT id FROM alumni WHERE nis = ?", [r.nis]);
            if (existing && existing.length > 0) {
                skipped++;
                skippedDetail.push(`NIS ${r.nis} (${r.nama}) sudah terdaftar`);
                continue;
            }
            await conn.query(
                "INSERT INTO alumni (nis, nama, jurusan, tahun_lulus, email, no_hp) VALUES (?, ?, ?, ?, ?, ?)",
                [r.nis, r.nama, r.jurusan, r.tahunLulus, r.email || null, r.noHp || null],
            );
            inserted++;
        }

        await conn.commit();
        return { inserted, skipped, skippedDetail };
    } catch (err) {
        await conn.rollback();
        throw err;
    } finally {
        conn.release();
    }
};

