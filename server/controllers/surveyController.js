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
} from "../models/Survey.js";

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
            relevansiJurusan,
            lamaTungguKerja,
            namaKampus,
            jurusanKampus,
            saranUntukSekolah,
        } = req.body;

        // Cari atau buat data alumni dulu
        let alumni = await findAlumniByNis(nis);
        if (!alumni) {
            alumni = await createAlumni({
                nis,
                nama,
                jurusan,
                tahunLulus,
                email,
                noHp,
            });
        }

        const survey = await createSurveyEntry({
            alumniId: alumni.id,
            statusSaatIni,
            namaPerusahaan,
            bidangKerja,
            relevansiJurusan,
            lamaTungguKerja,
            namaKampus,
            jurusanKampus,
            saranUntukSekolah,
        });

        res.status(201).json(survey);
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
