import ExcelJS from "exceljs";
import {
    findAlumniByNis,
    createAlumni,
    getAllAlumni as getAllAlumniModel,
    getDistinctJurusan,
    getDistinctTahunByJurusan,
    getAlumniByJurusanTahun,
    getAlumniWithSurvey,
} from "../models/Alumni.js";

export const findOrCreateAlumni = async (req, res) => {
    try {
        const { nis, nama, jurusan, tahunLulus, email, noHp } = req.body;

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

        res.status(200).json(alumni);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getAllAlumni = async (req, res) => {
    try {
        const alumni = await getAllAlumniModel();
        res.json(alumni);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Daftar jurusan unik (buat dropdown pertama)
export const getJurusanList = async (req, res) => {
    try {
        const jurusanList = await getDistinctJurusan();
        res.json(jurusanList);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Daftar tahun lulus, difilter berdasarkan jurusan (buat dropdown kedua)
export const getTahunByJurusan = async (req, res) => {
    try {
        const { jurusan } = req.query;
        const tahunList = await getDistinctTahunByJurusan(jurusan);
        res.json(tahunList);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Daftar nama alumni, difilter jurusan + tahun (buat dropdown ketiga, sekaligus ambil NIS)
export const searchAlumni = async (req, res) => {
    try {
        const { jurusan, tahunLulus } = req.query;
        const alumni = await getAlumniByJurusanTahun(jurusan, tahunLulus);
        res.json(alumni);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ─── Ekspor Data Alumni ke Excel ──────────────────────────────────────────────
export const exportAlumniExcel = async (req, res) => {
    try {
        const { jurusan, tahun, cari } = req.query;
        const alumniList = await getAlumniWithSurvey({
            jurusan,
            tahunLulus: tahun,
            search: cari,
        });

        if (alumniList.length === 0) {
            return res.status(404).json({ message: "Tidak ada data alumni untuk diekspor" });
        }

        const workbook = new ExcelJS.Workbook();
        workbook.creator = "Tracer Study SMK Puspita Bangsa";
        workbook.created = new Date();

        const sheet = workbook.addWorksheet("Data Alumni", {
            views: [{ showGridLines: true }],
            pageSetup: {
                orientation: "landscape",
                fitToPage: true,
                fitToWidth: 1,
                fitToHeight: 0,
            },
        });

        // 1. Judul Utama
        sheet.mergeCells("A1:K1");
        const titleCell = sheet.getCell("A1");
        titleCell.value = "DATA ALUMNI & TRACER STUDY - SMK PUSPITA BANGSA";
        titleCell.font = { name: "Arial", size: 14, bold: true, color: { argb: "FFFFFFFF" } };
        titleCell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "FF1769AA" },
        };
        titleCell.alignment = { horizontal: "center", vertical: "middle" };
        sheet.getRow(1).height = 32;

        // 2. Info / Subjudul
        sheet.mergeCells("A2:K2");
        const infoCell = sheet.getCell("A2");
        const filterTeks = [
            jurusan && jurusan !== "Semua" ? `Jurusan: ${jurusan}` : "Semua Jurusan",
            tahun && tahun !== "Semua" ? `Tahun: ${tahun}` : null,
            cari ? `Pencarian: "${cari}"` : null,
        ]
            .filter(Boolean)
            .join(" | ");

        const now = new Date();
        const tglCetak = now.toLocaleDateString("id-ID", {
            day: "2-digit",
            month: "long",
            year: "numeric",
        });

        infoCell.value = `Tanggal Ekspor: ${tglCetak} | Filter: ${filterTeks} | Total: ${alumniList.length} Alumni`;
        infoCell.font = { name: "Arial", size: 9, italic: true, color: { argb: "FF475569" } };
        infoCell.alignment = { horizontal: "center", vertical: "middle" };
        sheet.getRow(2).height = 20;

        // Baris kosong
        sheet.getRow(3).height = 10;

        // 3. Header Kolom di Baris 4
        const headers = [
            { header: "No.", width: 6 },
            { header: "NIS", width: 16 },
            { header: "Nama Lengkap", width: 28 },
            { header: "Jurusan", width: 26 },
            { header: "Tahun Lulus", width: 14 },
            { header: "Email", width: 25 },
            { header: "No. HP / WA", width: 18 },
            { header: "Status Saat Ini", width: 18 },
            { header: "Aktivitas / Instansi / Kampus", width: 32 },
            { header: "Kesesuaian Jurusan", width: 20 },
            { header: "Lama Tunggu", width: 16 },
        ];

        const headerRow = sheet.getRow(4);
        headerRow.height = 26;
        headers.forEach((h, idx) => {
            const cell = headerRow.getCell(idx + 1);
            cell.value = h.header;
            cell.font = { name: "Arial", size: 10, bold: true, color: { argb: "FFFFFFFF" } };
            cell.fill = {
                type: "pattern",
                pattern: "solid",
                fgColor: { argb: "FF0F3B66" },
            };
            cell.alignment = { horizontal: "center", vertical: "middle", wrapText: true };
            cell.border = {
                top: { style: "thin", color: { argb: "FFCBD5E1" } },
                left: { style: "thin", color: { argb: "FFCBD5E1" } },
                bottom: { style: "medium", color: { argb: "FF0B2540" } },
                right: { style: "thin", color: { argb: "FFCBD5E1" } },
            };
            sheet.getColumn(idx + 1).width = h.width;
        });

        // 4. Data Rows mulai Baris 5
        let countBekerja = 0;
        let countKuliah = 0;
        let countWirausaha = 0;
        let countBelum = 0;
        let countBelumSurvey = 0;

        alumniList.forEach((item, index) => {
            const rowNumber = index + 5;
            const row = sheet.getRow(rowNumber);
            row.height = 22;

            let aktivitas = "-";
            if (item.status_saat_ini === "Bekerja") {
                countBekerja++;
                aktivitas = item.nama_perusahaan
                    ? `${item.nama_perusahaan}${item.bidang_kerja ? ` (${item.bidang_kerja})` : ""}`
                    : (item.bidang_kerja || "Bekerja");
            } else if (item.status_saat_ini === "Kuliah") {
                countKuliah++;
                aktivitas = [item.nama_kampus, item.jurusan_kampus].filter(Boolean).join(" - ") || "Kuliah";
            } else if (item.status_saat_ini === "Wirausaha") {
                countWirausaha++;
                aktivitas = item.bidang_kerja || item.nama_perusahaan || "Wirausaha";
            } else if (item.status_saat_ini === "Belum Bekerja") {
                countBelum++;
                aktivitas = "Belum Bekerja";
            } else {
                countBelumSurvey++;
                aktivitas = "-";
            }

            const rowData = [
                index + 1,
                item.nis || "-",
                item.nama || "-",
                item.jurusan || "-",
                item.tahun_lulus ? String(item.tahun_lulus) : "-",
                item.email || "-",
                item.no_hp || "-",
                item.status_saat_ini || "Belum Mengisi",
                aktivitas,
                item.relevansi_jurusan || "-",
                item.lama_tunggu_kerja || "-",
            ];

            const isEven = index % 2 === 1;
            const bgArgb = isEven ? "FFF8FAFC" : "FFFFFFFF";

            rowData.forEach((val, colIdx) => {
                const cell = row.getCell(colIdx + 1);
                cell.value = val;
                cell.font = { name: "Arial", size: 9 };
                cell.fill = {
                    type: "pattern",
                    pattern: "solid",
                    fgColor: { argb: bgArgb },
                };
                cell.border = {
                    top: { style: "thin", color: { argb: "FFE2E8F0" } },
                    left: { style: "thin", color: { argb: "FFE2E8F0" } },
                    bottom: { style: "thin", color: { argb: "FFE2E8F0" } },
                    right: { style: "thin", color: { argb: "FFE2E8F0" } },
                };

                // Alignment
                if ([0, 1, 4, 6, 7, 9, 10].includes(colIdx)) {
                    cell.alignment = { horizontal: "center", vertical: "middle" };
                } else {
                    cell.alignment = { horizontal: "left", vertical: "middle" };
                }
            });
        });

        // 5. Baris Ringkasan di Bawah
        const summaryRowIndex = alumniList.length + 6;
        sheet.mergeCells(`A${summaryRowIndex}:K${summaryRowIndex}`);
        const summaryCell = sheet.getCell(`A${summaryRowIndex}`);
        summaryCell.value = `Ringkasan: Total ${alumniList.length} Alumni | Bekerja: ${countBekerja} | Kuliah: ${countKuliah} | Wirausaha: ${countWirausaha} | Belum Bekerja: ${countBelum} | Belum Mengisi: ${countBelumSurvey}`;
        summaryCell.font = { name: "Arial", size: 9, bold: true, color: { argb: "FF0F3B66" } };
        summaryCell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "FFE9F2FA" },
        };
        summaryCell.alignment = { horizontal: "center", vertical: "middle" };
        sheet.getRow(summaryRowIndex).height = 24;

        // Header respons HTTP
        const cleanJurusan =
            jurusan && jurusan !== "Semua"
                ? `-${jurusan.toLowerCase().replace(/[^a-z0-9]/g, "-")}`
                : "";
        const cleanTahun = tahun && tahun !== "Semua" ? `-${tahun}` : "";
        const filename = `data-alumni${cleanJurusan}${cleanTahun}-${now.toISOString().slice(0, 10)}.xlsx`;

        res.setHeader(
            "Content-Type",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        );
        res.setHeader(
            "Content-Disposition",
            `attachment; filename=${filename}`,
        );

        await workbook.xlsx.write(res);
        res.end();
    } catch (error) {
        console.error("Gagal export alumni Excel:", error);
        res.status(500).json({
            message: "Gagal mengekspor data alumni ke Excel: " + error.message,
        });
    }
};
