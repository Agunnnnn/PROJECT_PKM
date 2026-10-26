import PDFDocument from "pdfkit";
import ExcelJS from "exceljs";
import { findAlumniByNis, createAlumni } from "../models/Alumni.js";
import {
    createSurveyEntry,
    getAllSurveyWithAlumni,
    getSurveyByTahun,
    getDistinctTahunLulus,
    getStatusCount,
    getRelevansiCount,
    countAlumni,
    countSurvey,
    updateSurveyRelevansi,
    getSurveysTanpaRelevansi,
    getLaporanByTahun,
    upsertSurveyByAlumniId,
} from "../models/Survey.js";

// Helper normalisasi string agar aman dari TypeError jika input berupa number/null/dll.
export const normalisasiString = (val, maxLen = 255) => {
    if (typeof val === "string") return val.trim().slice(0, maxLen);
    if (typeof val === "number") return String(val).trim().slice(0, maxLen);
    return "";
};

// Helper validasi tahun (4 digit angka, antara 1990 sampai 2100)
export const validasiTahun = (tahun) => {
    if (typeof tahun !== "string" && typeof tahun !== "number") return null;
    const str = String(tahun).trim();
    if (!/^\d{4}$/.test(str)) return null;
    const num = parseInt(str, 10);
    if (num < 1990 || num > 2100) return null;
    return num;
};

/**
 * Helper terpusat untuk memanggil Flask ML API
 * Menghubungkan tipe 'bekerja' & 'kuliah', serta menangani fail-safe
 */
export const hitungRelevansiModel = async ({
    jurusan,
    statusSaatIni,
    bidangKerja,
    jurusanKampus,
}) => {
    let tipe = null;
    let teks = "";

    if (statusSaatIni === "Bekerja") {
        tipe = "bekerja";
        teks = typeof bidangKerja === "string" ? bidangKerja.trim().slice(0, 150) : "";
    } else if (statusSaatIni === "Kuliah") {
        tipe = "kuliah";
        teks = typeof jurusanKampus === "string" ? jurusanKampus.trim().slice(0, 150) : "";
    } else {
        // Status Wirausaha, Belum Bekerja, dll. -> tidak memanggil ML
        return { relevansi: null, skor: 0, tersedia: false };
    }

    const jurusanClean = typeof jurusan === "string" ? jurusan.trim().slice(0, 150) : "";
    if (!jurusanClean || !teks) {
        return { relevansi: null, skor: 0, tersedia: false };
    }

    const mlBaseUrl = process.env.ML_API_URL || "http://localhost:5001";
    const endpoint = `${mlBaseUrl.replace(/\/+$/, "")}/predict`;

    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);

        const response = await fetch(endpoint, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                jurusan: jurusanClean,
                tipe,
                teks,
            }),
            signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
            return { relevansi: null, skor: 0, tersedia: false };
        }

        const data = await response.json();
        return {
            relevansi: data.relevansi || null,
            skor: typeof data.skor === "number" ? data.skor : 0,
            tersedia: data.tersedia !== false && data.relevansi !== null,
        };
    } catch (err) {
        console.error("Gagal memanggil ML API:", err.message);
        return { relevansi: null, skor: 0, tersedia: false };
    }
};

// Endpoint publik: cek prediksi sebelum submit survei (langkah 2 -> langkah 3)
export const prediksiRelevansi = async (req, res) => {
    try {
        const { jurusan, statusSaatIni, bidangKerja, jurusanKampus, nis } = req.body || {};
        let jurusanToUse = jurusan;
        if (nis) {
            const alumni = await findAlumniByNis(nis);
            if (alumni && alumni.jurusan) {
                jurusanToUse = alumni.jurusan;
            }
        }
        const hasil = await hitungRelevansiModel({
            jurusan: jurusanToUse,
            statusSaatIni,
            bidangKerja,
            jurusanKampus,
        });
        res.json(hasil);
    } catch (error) {
        res.status(500).json({ relevansi: null, skor: 0, tersedia: false, message: error.message });
    }
};

export const createSurvey = async (req, res) => {
    try {
        const body = req.body || {};

        // Normalisasi input string & batas panjang karakter (mencegah error jika input bukan string)
        const nisClean = normalisasiString(body.nis, 50);
        const namaClean = normalisasiString(body.nama, 100);
        const statusClean = normalisasiString(body.statusSaatIni, 50);
        const namaPerusahaanClean = normalisasiString(body.namaPerusahaan, 150);
        const bidangKerjaClean = normalisasiString(body.bidangKerja, 150);
        const lamaTungguClean = normalisasiString(body.lamaTungguKerja, 50);
        const namaKampusClean = normalisasiString(body.namaKampus, 150);
        const jurusanKampusClean = normalisasiString(body.jurusanKampus, 150);
        const saranClean = normalisasiString(body.saranUntukSekolah, 1000);

        // 1. Validasi field wajib
        if (!nisClean || !namaClean || !statusClean) {
            return res.status(400).json({
                message: "Field wajib diisi: nis, nama, statusSaatIni",
            });
        }

        // 2. Whitelist statusSaatIni
        const validStatuses = ["Bekerja", "Kuliah", "Wirausaha", "Belum Bekerja"];
        if (!validStatuses.includes(statusClean)) {
            return res.status(400).json({
                message: `Status tidak valid. Pilih salah satu: ${validStatuses.join(", ")}`,
            });
        }

        // 3. Survei publik tidak membuat alumni baru, hanya menerima NIS yang sudah ada
        const alumni = await findAlumniByNis(nisClean);
        if (!alumni) {
            return res.status(404).json({
                message: "Data alumni dengan NIS tersebut tidak ditemukan di database sekolah. Pastikan NIS Anda sudah terdaftar.",
            });
        }

        // 4. Ambil jurusan langsung dari alumni.jurusan di DB (abaikan dari body client)
        const jurusanAlumni = alumni.jurusan;

        // Hitung ulang relevansi di sisi server (Bekerja & Kuliah), jangan percaya input client
        let relevansiJurusan = null;
        try {
            const hasilMl = await hitungRelevansiModel({
                jurusan: jurusanAlumni,
                statusSaatIni: statusClean,
                bidangKerja: bidangKerjaClean,
                jurusanKampus: jurusanKampusClean,
            });
            const validLabels = ["Sangat Sesuai", "Cukup Sesuai", "Tidak Sesuai"];
            if (validLabels.includes(hasilMl.relevansi)) {
                relevansiJurusan = hasilMl.relevansi;
            }
        } catch (mlError) {
            console.error("Gagal memanggil ML API di createSurvey:", mlError.message);
            // Tetap lanjut simpan survei dengan relevansi NULL (fail-safe)
        }

        // Simpan atau update jawaban survei (UPSERT)
        const result = await upsertSurveyByAlumniId(alumni.id, {
            statusSaatIni: statusClean,
            namaPerusahaan: namaPerusahaanClean || null,
            bidangKerja: bidangKerjaClean || null,
            relevansiJurusan,
            lamaTungguKerja: lamaTungguClean || null,
            namaKampus: namaKampusClean || null,
            jurusanKampus: jurusanKampusClean || null,
            saranUntukSekolah: saranClean || null,
        });

        res.status(201).json({
            id: result.id,
            relevansiJurusan,
            updated: result.updated,
        });
    } catch (error) {
        console.error("Error creating survey:", error);
        res.status(500).json({
            message: "Terjadi kesalahan saat menyimpan survey. Silakan coba lagi.",
        });
    }
};

// Endpoint admin (JWT): hitung ulang relevansi untuk data lama yang masih NULL
export const hitungUlangRelevansi = async (req, res) => {
    try {
        const surveys = await getSurveysTanpaRelevansi();
        const diproses = surveys.length;

        if (diproses === 0) {
            return res.json({ diproses: 0, berhasil: 0, gagal: 0 });
        }

        const validLabels = ["Sangat Sesuai", "Cukup Sesuai", "Tidak Sesuai"];
        const mlBaseUrl = process.env.ML_API_URL || "http://localhost:5001";

        // ✅ FIX F-16: Fail-fast check apakah ML API hidup sebelum loop berat
        try {
            const healthRes = await fetch(`${mlBaseUrl.replace(/\/+$/, "")}/health`, {
                signal: AbortSignal.timeout(1500),
            });
            if (!healthRes.ok) throw new Error("ML not healthy");
        } catch {
            return res.json({
                diproses,
                berhasil: 0,
                gagal: diproses,
                message: "Layanan ML API sedang tidak aktif.",
            });
        }

        let berhasil = 0;
        let gagal = 0;

        // Gunakan batch endpoint /predict-batch jika tersedia
        const endpointBatch = `${mlBaseUrl.replace(/\/+$/, "")}/predict-batch`;
        const items = surveys.map((s) => ({
            jurusan: s.jurusan,
            tipe: s.status_saat_ini === "Kuliah" ? "kuliah" : "bekerja",
            teks: s.status_saat_ini === "Kuliah" ? (s.jurusan_kampus || "") : (s.bidang_kerja || ""),
        }));

        try {
            const batchRes = await fetch(endpointBatch, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ items }),
                signal: AbortSignal.timeout(15000),
            });

            if (batchRes.ok) {
                const batchData = await batchRes.json();
                const listHasil = batchData.hasil || [];
                for (let i = 0; i < surveys.length; i++) {
                    const hasil = listHasil[i];
                    if (hasil && validLabels.includes(hasil.relevansi)) {
                        await updateSurveyRelevansi(surveys[i].id, hasil.relevansi);
                        berhasil++;
                    } else {
                        gagal++;
                    }
                }
                return res.json({ diproses, berhasil, gagal });
            }
        } catch (batchErr) {
            console.warn("Fallback ke loop satuan:", batchErr.message);
        }

        // Fallback: loop per item jika batch gagal
        for (const s of surveys) {
            try {
                const hasil = await hitungRelevansiModel({
                    jurusan: s.jurusan,
                    statusSaatIni: s.status_saat_ini,
                    bidangKerja: s.bidang_kerja,
                    jurusanKampus: s.jurusan_kampus,
                });

                if (validLabels.includes(hasil.relevansi)) {
                    await updateSurveyRelevansi(s.id, hasil.relevansi);
                    berhasil++;
                } else {
                    gagal++;
                }
            } catch (err) {
                gagal++;
            }
        }

        res.json({ diproses, berhasil, gagal });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getAllSurvey = async (req, res) => {
    try {
        const surveys = await getAllSurveyWithAlumni();
        res.json(surveys);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Daftar tahun lulus yang ada di database (buat isi dropdown di frontend)
export const getTahunList = async (req, res) => {
    try {
        const tahunList = await getDistinctTahunLulus();
        res.json(tahunList);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Generate & kirim file PDF berisi data survey untuk tahun lulus tertentu
export const exportSurveyPdf = async (req, res) => {
    try {
        const { tahun } = req.params;
        const tahunNum = validasiTahun(tahun);

        if (!tahunNum) {
            return res.status(400).json({
                message: "Parameter tahun tidak valid. Harus berupa 4 digit angka antara 1990 sampai 2100.",
            });
        }

        const surveys = await getSurveyByTahun(tahunNum);

        if (surveys.length === 0) {
            return res
                .status(404)
                .json({ message: `Tidak ada data untuk tahun lulus ${tahun}` });
        }

        const doc = new PDFDocument({
            margin: 40,
            size: "A4",
            layout: "landscape",
        });

        // Set header supaya browser tahu ini file PDF untuk didownload
        res.setHeader("Content-Type", "application/pdf");
        res.setHeader(
            "Content-Disposition",
            `attachment; filename=laporan-tracer-study-${tahun}.pdf`,
        );

        doc.pipe(res);

        // Judul
        doc.fontSize(16).text(`Laporan Tracer Study - Tahun Lulus ${tahun}`, {
            align: "center",
        });
        doc.moveDown(0.3);
        doc.fontSize(10)
            .fillColor("#555")
            .text(`Dicetak pada: ${new Date().toLocaleDateString("id-ID")}`, {
                align: "center",
            });
        doc.moveDown(1);
        doc.fillColor("#000");

        // Header tabel
        const startX = 40;
        let y = doc.y;
        const colWidths = [110, 90, 110, 100, 120, 110];
        const headers = [
            "Nama",
            "Jurusan",
            "Status",
            "Relevansi",
            "Perusahaan/Kampus",
            "Lama Tunggu",
        ];

        const drawRow = (rowData, isHeader = false) => {
            let x = startX;
            doc.font(isHeader ? "Helvetica-Bold" : "Helvetica").fontSize(9);
            rowData.forEach((text, i) => {
                doc.text(text || "-", x, y, {
                    width: colWidths[i],
                    ellipsis: true,
                });
                x += colWidths[i];
            });
            y += 20;
        };

        drawRow(headers, true);
        doc.moveTo(startX, y)
            .lineTo(startX + colWidths.reduce((a, b) => a + b, 0), y)
            .stroke();
        y += 5;

        surveys.forEach((s) => {
            // Kalau halaman mau penuh, buat halaman baru
            if (y > 500) {
                doc.addPage();
                y = 40;
            }
            drawRow([
                s.nama,
                s.jurusan,
                s.status_saat_ini,
                s.relevansi_jurusan,
                s.nama_perusahaan || s.nama_kampus,
                s.lama_tunggu_kerja,
            ]);
        });

        doc.end();
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
// Generate & kirim file Excel berisi data survey untuk tahun lulus tertentu
export const exportSurveyExcel = async (req, res) => {
    try {
        const { tahun } = req.params;
        const tahunNum = validasiTahun(tahun);

        if (!tahunNum) {
            return res.status(400).json({
                message: "Parameter tahun tidak valid. Harus berupa 4 digit angka antara 1990 sampai 2100.",
            });
        }

        const surveys = await getSurveyByTahun(tahunNum);

        if (surveys.length === 0) {
            return res
                .status(404)
                .json({ message: `Tidak ada data untuk tahun lulus ${tahun}` });
        }

        const workbook = new ExcelJS.Workbook();
        const sheet = workbook.addWorksheet(`Tracer Study ${tahun}`);

        // Judul di baris pertama
        sheet.mergeCells("A1:F1");
        sheet.getCell("A1").value =
            `Laporan Tracer Study - Tahun Lulus ${tahun}`;
        sheet.getCell("A1").font = { bold: true, size: 14 };
        sheet.getCell("A1").alignment = { horizontal: "center" };

        // Header tabel di baris ke-3
        sheet.getRow(3).values = [
            "Nama",
            "Jurusan",
            "Status",
            "Relevansi",
            "Perusahaan/Kampus",
            "Lama Tunggu Kerja",
        ];
        sheet.getRow(3).font = { bold: true };
        sheet.columns = [
            { width: 25 },
            { width: 20 },
            { width: 15 },
            { width: 15 },
            { width: 25 },
            { width: 18 },
        ];

        // Isi data mulai baris ke-4
        surveys.forEach((s) => {
            sheet.addRow([
                s.nama,
                s.jurusan,
                s.status_saat_ini,
                s.relevansi_jurusan || "-",
                s.nama_perusahaan || s.nama_kampus || "-",
                s.lama_tunggu_kerja || "-",
            ]);
        });

        res.setHeader(
            "Content-Type",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        );
        res.setHeader(
            "Content-Disposition",
            `attachment; filename=laporan-tracer-study-${tahun}.xlsx`,
        );

        await workbook.xlsx.write(res);
        res.end();
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getStats = async (req, res) => {
    try {
        const statusCount = await getStatusCount();
        const relevansiCount = await getRelevansiCount();
        const totalAlumni = await countAlumni();
        const totalSurvey = await countSurvey();

        res.json({ totalAlumni, totalSurvey, statusCount, relevansiCount });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getLaporan = async (req, res) => {
    try {
        const { tahun } = req.params;
        const tahunNum = validasiTahun(tahun);

        // ✅ Validasi tahun (4 digit, 1990 - 2100)
        if (!tahunNum) {
            return res.status(400).json({
                message: "Parameter tahun tidak valid. Harus berupa 4 digit angka antara 1990 sampai 2100.",
            });
        }

        const laporan = await getLaporanByTahun(tahunNum);
        res.json(laporan);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
