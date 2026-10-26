import pool from "../config/db.js";

export const createSurveyEntry = async ({
    alumniId,
    statusSaatIni,
    namaPerusahaan,
    bidangKerja,
    relevansiJurusan,
    lamaTungguKerja,
    namaKampus,
    jurusanKampus,
    saranUntukSekolah,
}) => {
    const [result] = await pool.query(
        `INSERT INTO survey
        (alumni_id, status_saat_ini, nama_perusahaan, bidang_kerja, relevansi_jurusan, lama_tunggu_kerja, nama_kampus, jurusan_kampus, saran_untuk_sekolah)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
            alumniId,
            statusSaatIni,
            namaPerusahaan || null,
            bidangKerja || null,
            relevansiJurusan || null,
            lamaTungguKerja || null,
            namaKampus || null,
            jurusanKampus || null,
            saranUntukSekolah || null,
        ],
    );
    return { id: result.insertId };
};

export const getAllSurveyWithAlumni = async () => {
    const [rows] = await pool.query(
        `SELECT s.*, a.nama, a.nis, a.jurusan, a.tahun_lulus
     FROM survey s
     JOIN alumni a ON s.alumni_id = a.id
     ORDER BY s.created_at DESC`,
    );
    return rows;
};

export const getSurveyByTahun = async (tahun) => {
    const [rows] = await pool.query(
        `SELECT s.*, a.nama, a.nis, a.jurusan, a.tahun_lulus
     FROM survey s
     JOIN alumni a ON s.alumni_id = a.id
     WHERE a.tahun_lulus = ?
     ORDER BY a.nama ASC`,
        [tahun],
    );
    return rows;
};

export const getDistinctTahunLulus = async () => {
    const [rows] = await pool.query(
        "SELECT DISTINCT tahun_lulus FROM alumni ORDER BY tahun_lulus DESC",
    );
    return rows.map((r) => r.tahun_lulus);
};

export const getStatusCount = async () => {
    const [rows] = await pool.query(
        "SELECT status_saat_ini AS status, COUNT(*) AS jumlah FROM survey GROUP BY status_saat_ini",
    );
    return rows;
};

export const getRelevansiCount = async () => {
    const [rows] = await pool.query(
        `SELECT relevansi_jurusan AS relevansi, COUNT(*) AS jumlah
     FROM survey
     WHERE relevansi_jurusan IS NOT NULL
     GROUP BY relevansi_jurusan`,
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

export const upsertSurveyByAlumniId = async (alumniId, data) => {
    const {
        statusSaatIni, namaPerusahaan, bidangKerja, relevansiJurusan,
        lamaTungguKerja, namaKampus, jurusanKampus, saranUntukSekolah,
    } = data;
    // Cek apakah survey sudah ada untuk alumni ini
    const [existing] = await pool.query(
        "SELECT id FROM survey WHERE alumni_id = ?",
        [alumniId],
    );
    if (existing.length > 0) {
        await pool.query(
            `UPDATE survey SET status_saat_ini=?, nama_perusahaan=?, bidang_kerja=?,
             relevansi_jurusan=?, lama_tunggu_kerja=?, nama_kampus=?, jurusan_kampus=?,
             saran_untuk_sekolah=? WHERE alumni_id=?`,
            [
                statusSaatIni, namaPerusahaan || null, bidangKerja || null,
                relevansiJurusan || null, lamaTungguKerja || null,
                namaKampus || null, jurusanKampus || null,
                saranUntukSekolah || null, alumniId,
            ],
        );
        return { id: existing[0].id, updated: true };
    } else {
        const result = await createSurveyEntry({
            alumniId, statusSaatIni, namaPerusahaan, bidangKerja,
            relevansiJurusan, lamaTungguKerja, namaKampus, jurusanKampus, saranUntukSekolah,
        });
        return { id: result.id, updated: false };
    }
};

export const deleteSurveyByAlumniId = async (alumniId) => {
    await pool.query("DELETE FROM survey WHERE alumni_id = ?", [alumniId]);
};

export const updateSurveyRelevansi = async (id, relevansi) => {
    const [result] = await pool.query(
        "UPDATE survey SET relevansi_jurusan = ? WHERE id = ?",
        [relevansi, id],
    );
    return result.affectedRows > 0;
};

export const getSurveysTanpaRelevansi = async () => {
    const [rows] = await pool.query(
        `SELECT s.id, s.status_saat_ini, s.bidang_kerja, s.jurusan_kampus, a.jurusan
         FROM survey s
         JOIN alumni a ON s.alumni_id = a.id
         WHERE s.relevansi_jurusan IS NULL
           AND s.status_saat_ini IN ('Bekerja', 'Kuliah')`,
    );
    return rows;
};

export const getLaporanByTahun = async (tahun) => {
    const [alumniRows] = await pool.query(
        "SELECT COUNT(*) AS total FROM alumni WHERE tahun_lulus = ?",
        [tahun],
    );
    const totalAlumni = alumniRows[0]?.total || 0;

    // ✅ FIX TES #18: Gunakan survei terbaru per alumni (MAX id) untuk mencegah duplikasi data
    const [surveyRows] = await pool.query(
        `SELECT s.status_saat_ini, s.relevansi_jurusan
         FROM survey s
         JOIN (
             SELECT alumni_id, MAX(id) AS max_id
             FROM survey
             GROUP BY alumni_id
         ) latest ON s.id = latest.max_id
         JOIN alumni a ON s.alumni_id = a.id
         WHERE a.tahun_lulus = ?`,
        [tahun],
    );

    const sudahMengisi = Math.min(totalAlumni, surveyRows.length);
    const belumMengisi = Math.max(0, totalAlumni - sudahMengisi);

    let bekerja = 0;
    let kuliah = 0;
    let wirausaha = 0;
    let belumBekerjaSurvey = 0;

    for (const r of surveyRows) {
        if (r.status_saat_ini === "Bekerja") bekerja++;
        else if (r.status_saat_ini === "Kuliah") kuliah++;
        else if (r.status_saat_ini === "Wirausaha") wirausaha++;
        else if (r.status_saat_ini === "Belum Bekerja") belumBekerjaSurvey++;
    }

    const belumBekerja = belumBekerjaSurvey + belumMengisi;
    const bekerjaKuliahPersen =
        totalAlumni > 0
            ? Math.min(100, Math.round(((bekerja + kuliah) / totalAlumni) * 100))
            : 0;

    return {
        tahun: Number(tahun),
        totalAlumni,
        sudahMengisi,
        belumMengisi,
        bekerjaKuliahPersen,
        status: {
            bekerja,
            kuliah,
            wirausaha,
            belumBekerja,
        },
    };
};
