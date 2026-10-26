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
        const {
            nis,
            nama,
            jurusan,
            tahunLulus,
            email,
            noHp,
            statusSaatIni,
            namaPerusahaan,
            bidangKerja,
            lamaTungguKerja,
            namaKampus,
            jurusanKampus,
            saranUntukSekolah,
        } = req.body;

        // ✅ FIX BUG #2: Validasi required fields
        if (!nis || !nama || !jurusan || !tahunLulus || !statusSaatIni) {
            return res.status(400).json({
                message: "Field wajib diisi: nis, nama, jurusan, tahunLulus, statusSaatIni",
            });
        }

        // ✅ FIX BUG #3: Validasi enum statusSaatIni
        const validStatuses = ["Bekerja", "Kuliah", "Wirausaha", "Belum Bekerja"];
        if (!validStatuses.includes(statusSaatIni)) {
            return res.status(400).json({
                message: `Status tidak valid. Pilih salah satu: ${validStatuses.join(", ")}`,
            });
        }

        // Cari atau buat data alumni dulu
        let alumni = await findAlumniByNis(nis);
        if (!alumni) {
            alumni = await createAlumni({ nis, nama, jurusan, tahunLulus, email, noHp });
        }

        // ✅ FIX DATA INTEGRITY: Gunakan jurusan resmi dari database alumni jika sudah terdaftar,
        // mencegah manipulasi / spoofing jurusan dari client body
        const jurusanAlumni = (alumni && alumni.jurusan) ? alumni.jurusan : jurusan;

        // Hitung ulang relevansi di sisi server (Bekerja & Kuliah), jangan percaya input client
        let relevansiJurusan = null;
        try {
            const hasilMl = await hitungRelevansiModel({
                jurusan: jurusanAlumni,
                statusSaatIni,
                bidangKerja,
                jurusanKampus,
            });
            const validLabels = ["Sangat Sesuai", "Cukup Sesuai", "Tidak Sesuai"];
            if (validLabels.includes(hasilMl.relevansi)) {
                relevansiJurusan = hasilMl.relevansi;
            }
        } catch (mlError) {
            console.error("Gagal memanggil ML API di createSurvey:", mlError.message);
            // Tetap lanjut simpan survei dengan relevansi NULL (fail-safe)
        }

        // ✅ FIX BUG #1: UPSERT - Insert baru atau Update yang lama
        const result = await upsertSurveyByAlumniId(alumni.id, {
            statusSaatIni,
            namaPerusahaan,
            bidangKerja,
            relevansiJurusan,
            lamaTungguKerja,
            namaKampus,
            jurusanKampus,
            saranUntukSekolah,
        });

        res.status(201).json({
            id: result.id,
            relevansiJurusan,
            updated: result.updated, // true = data di-update, false = data baru
        });
    } catch (error) {
        // ✅ FIX BUG #2: Jangan expose SQL error ke client
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
        const surveys = await getSurveyByTahun(tahun);

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
        const surveys = await getSurveyByTahun(tahun);

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
        const laporan = await getLaporanByTahun(tahun);
        res.json(laporan);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
