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
    tanggalLahir,
}) => {
    const [result] = await pool.query(
        "INSERT INTO alumni (nis, nama, jurusan, tahun_lulus, email, no_hp, tanggal_lahir) VALUES (?, ?, ?, ?, ?, ?, ?)",
        [nis, nama, jurusan, tahunLulus, email || null, noHp || null, tanggalLahir || null],
    );
    return { id: result.insertId, nis, nama, jurusan, tahunLulus, email, noHp, tanggalLahir };
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

export const getAlumniWithSurvey = async ({ jurusan, tahunLulus, status, search } = {}) => {
    let query = `
        SELECT 
            a.id, a.nis, a.nama, a.jurusan, a.tahun_lulus, a.email, a.no_hp,
            s.id AS survey_id,
            s.status_saat_ini, s.nama_perusahaan, s.bidang_kerja, s.relevansi_jurusan,
            s.lama_tunggu_kerja, s.gaji, s.nama_kampus, s.jurusan_kampus, s.saran_untuk_sekolah,
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

    if (status && status !== "Semua") {
        if (status.toLowerCase() === "belum mengisi" || status.toLowerCase() === "belum survey") {
            query += " AND s.id IS NULL";
        } else {
            query += " AND s.status_saat_ini = ?";
            params.push(status);
        }
    }

    if (search && search.trim()) {
        query += " AND (a.nama LIKE ? OR a.nis LIKE ?)";
        params.push(`%${search.trim()}%`, `%${search.trim()}%`);
    }

    query += " ORDER BY a.tahun_lulus DESC, a.nama ASC";

    const [rows] = await pool.query(query, params);
    return rows;
};

export const getAlumniWithSurveyPaginated = async ({
    jurusan,
    tahunLulus,
    status,
    search,
    page = 1,
    limit = 10,
} = {}) => {
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, parseInt(limit, 10) || 10);
    const offset = (pageNum - 1) * limitNum;

    let whereClause = "";
    const params = [];

    if (jurusan && jurusan !== "Semua") {
        whereClause += " AND a.jurusan = ?";
        params.push(jurusan);
    }

    if (tahunLulus && tahunLulus !== "Semua") {
        whereClause += " AND a.tahun_lulus = ?";
        params.push(tahunLulus);
    }

    if (status && status !== "Semua") {
        if (status.toLowerCase() === "belum mengisi" || status.toLowerCase() === "belum survey") {
            whereClause += " AND s.id IS NULL";
        } else {
            whereClause += " AND s.status_saat_ini = ?";
            params.push(status);
        }
    }

    if (search && search.trim()) {
        whereClause += " AND (a.nama LIKE ? OR a.nis LIKE ?)";
        params.push(`%${search.trim()}%`, `%${search.trim()}%`);
    }

    const joinClause = `
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
        WHERE 1=1 ${whereClause}
    `;

    const countQuery = `SELECT COUNT(*) AS total ${joinClause}`;
    const [countRows] = await pool.query(countQuery, params);
    const total = countRows[0]?.total || 0;

    const dataQuery = `
        SELECT 
            a.id, a.nis, a.nama, a.jurusan, a.tahun_lulus, a.email, a.no_hp,
            s.id AS survey_id,
            s.status_saat_ini, s.nama_perusahaan, s.bidang_kerja, s.relevansi_jurusan,
            s.lama_tunggu_kerja, s.gaji, s.nama_kampus, s.jurusan_kampus, s.saran_untuk_sekolah,
            s.created_at AS tanggal_survey
        ${joinClause}
        ORDER BY a.tahun_lulus DESC, a.nama ASC
        LIMIT ? OFFSET ?
    `;
    const [rows] = await pool.query(dataQuery, [...params, limitNum, offset]);

    return {
        data: rows,
        pagination: {
            total,
            page: pageNum,
            limit: limitNum,
            totalPages: Math.ceil(total / limitNum) || 1,
        },
    };
};

export const getAlumniDetailById = async (id) => {
    const query = `
        SELECT 
            a.id, a.nis, a.nama, a.jurusan, a.tahun_lulus, a.email, a.no_hp, a.created_at,
            s.id AS survey_id,
            s.status_saat_ini, s.nama_perusahaan, s.bidang_kerja, s.relevansi_jurusan,
            s.lama_tunggu_kerja, s.gaji, s.nama_kampus, s.jurusan_kampus, s.saran_untuk_sekolah,
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
        WHERE a.id = ?
    `;
    const [rows] = await pool.query(query, [id]);
    return rows[0];
};

export const updateAlumni = async (id, { nis, nama, jurusan, tahunLulus, email, noHp, tanggalLahir }) => {
    const [result] = await pool.query(
        "UPDATE alumni SET nis = ?, nama = ?, jurusan = ?, tahun_lulus = ?, email = ?, no_hp = ?, tanggal_lahir = ? WHERE id = ?",
        [nis, nama, jurusan, tahunLulus, email || null, noHp || null, tanggalLahir || null, id],
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
            const [existing] = await conn.query("SELECT id, tanggal_lahir FROM alumni WHERE nis = ?", [r.nis]);
            if (existing && existing.length > 0) {
                // Update tanggal_lahir jika sebelumnya NULL dan sekarang ada datanya
                if (r.tanggalLahir && !existing[0].tanggal_lahir) {
                    await conn.query(
                        "UPDATE alumni SET tanggal_lahir = ? WHERE nis = ? AND tanggal_lahir IS NULL",
                        [r.tanggalLahir, r.nis]
                    );
                }
                skipped++;
                skippedDetail.push(`NIS ${r.nis} (${r.nama}) sudah terdaftar`);
                continue;
            }
            // Cek apakah kolom tanggal_lahir sudah ada di tabel (aman jika migrasi belum jalan)
            try {
                await conn.query(
                    "INSERT INTO alumni (nis, nama, jurusan, tahun_lulus, email, no_hp, tanggal_lahir) VALUES (?, ?, ?, ?, ?, ?, ?)",
                    [r.nis, r.nama, r.jurusan, r.tahunLulus, r.email || null, r.noHp || null, r.tanggalLahir || null],
                );
            } catch (insertErr) {
                // Fallback: jika kolom tanggal_lahir belum ada, insert tanpa kolom itu
                if (insertErr.code === "ER_BAD_FIELD_ERROR") {
                    await conn.query(
                        "INSERT INTO alumni (nis, nama, jurusan, tahun_lulus, email, no_hp) VALUES (?, ?, ?, ?, ?, ?)",
                        [r.nis, r.nama, r.jurusan, r.tahunLulus, r.email || null, r.noHp || null],
                    );
                } else {
                    throw insertErr;
                }
            }
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

// Verifikasi identitas alumni: cocokkan NIS + tanggal lahir format DDMMYY
// Dipakai oleh form survei publik sebelum alumni boleh mengisi
export const verifikasiAlumni = async (nis, tanggalLahirInput) => {
    const [rows] = await pool.query(
        "SELECT id, nis, nama, jurusan, tahun_lulus, tanggal_lahir FROM alumni WHERE nis = ?",
        [nis.trim()]
    );
    const alumni = rows[0];
    if (!alumni) return null;

    // Jika alumni tidak punya tanggal lahir di DB, lewati verifikasi (data lama)
    if (!alumni.tanggal_lahir) return alumni;

    // Konversi tanggal lahir DB ke format DDMMYY
    // MySQL bisa return Date object atau string YYYY-MM-DD
    // Pakai string parsing langsung agar tidak terpengaruh timezone
    const tglStr = alumni.tanggal_lahir instanceof Date
        ? `${alumni.tanggal_lahir.getFullYear()}-${String(alumni.tanggal_lahir.getMonth()+1).padStart(2,"0")}-${String(alumni.tanggal_lahir.getDate()).padStart(2,"0")}`
        : String(alumni.tanggal_lahir).slice(0, 10);

    // tglStr sekarang pasti "YYYY-MM-DD"
    const [yyyy, mm, dd] = tglStr.split("-");
    const yy = yyyy.slice(-2);
    const ddmmyy = `${dd}${mm}${yy}`;

    if (tanggalLahirInput.trim() !== ddmmyy) return null;
    return alumni;
};

