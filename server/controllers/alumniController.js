import ExcelJS from "exceljs";
import multer from "multer";
import path from "path";
import {
    findAlumniByNis,
    findAlumniById,
    createAlumni,
    updateAlumni,
    deleteAlumni,
    bulkInsertAlumni,
    getAllAlumni as getAllAlumniModel,
    getDistinctJurusan,
    getDistinctTahun,
    getDistinctTahunByJurusan,
    getAlumniByJurusanTahun,
    getAlumniWithSurvey,
} from "../models/Alumni.js";
import { upsertSurveyByAlumniId } from "../models/Survey.js";
import pool from "../config/db.js";

// ─── Multer (upload ke memori, tidak simpan ke disk) ─────────────────────────
const storage = multer.memoryStorage();
export const upload = multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
    fileFilter: (req, file, cb) => {
        const ext = path.extname(file.originalname).toLowerCase();
        const allowed = [".xlsx", ".xls", ".sql"];
        if (allowed.includes(ext)) return cb(null, true);
        cb(new Error(`Tipe file tidak didukung: ${ext}`));
    },
});

// ─── Helper: normalkan nama kolom Excel ──────────────────────────────────────
const norm = (str) =>
    String(str ?? "")
        .toLowerCase()
        .replace(/[\s_\-/]/g, "");

// ─── Temukan atau Buat Alumni (dipakai form survei publik) ───────────────────
export const findOrCreateAlumni = async (req, res) => {
    try {
        const { nis, nama, jurusan, tahunLulus, email, noHp } = req.body;

        let alumni = await findAlumniByNis(nis);
        if (!alumni) {
            alumni = await createAlumni({ nis, nama, jurusan, tahunLulus, email, noHp });
        }

        res.status(200).json(alumni);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ─── Tambah Alumni Manual (admin) ────────────────────────────────────────────
export const tambahAlumni = async (req, res) => {
    try {
        const { nis, nama, jurusan, tahunLulus, email, noHp } = req.body;

        if (!nis || !nama || !jurusan || !tahunLulus) {
            return res.status(400).json({ message: "NIS, nama, jurusan, dan tahun lulus wajib diisi." });
        }

        const existing = await findAlumniByNis(nis.trim());
        if (existing) {
            return res.status(409).json({ message: `NIS ${nis} sudah terdaftar (${existing.nama}).` });
        }

        const alumni = await createAlumni({
            nis: nis.trim(),
            nama: nama.trim(),
            jurusan: jurusan.trim(),
            tahunLulus: Number(tahunLulus),
            email: email?.trim() || null,
            noHp: noHp?.trim() || null,
        });

        res.status(201).json({ message: "Alumni berhasil ditambahkan.", alumni });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ─── Edit Alumni (admin) ──────────────────────────────────────────────────────
export const editAlumni = async (req, res) => {
    try {
        const { id } = req.params;
        const { nis, nama, jurusan, tahunLulus, email, noHp } = req.body;

        if (!nis || !nama || !jurusan || !tahunLulus) {
            return res.status(400).json({ message: "NIS, nama, jurusan, dan tahun lulus wajib diisi." });
        }

        const alumni = await findAlumniById(Number(id));
        if (!alumni) return res.status(404).json({ message: "Alumni tidak ditemukan." });

        // Cek NIS bentrok dengan alumni lain
        const duplikat = await findAlumniByNis(nis.trim());
        if (duplikat && duplikat.id !== Number(id)) {
            return res.status(409).json({ message: `NIS ${nis} sudah dipakai alumni lain (${duplikat.nama}).` });
        }

        await updateAlumni(Number(id), {
            nis: nis.trim(),
            nama: nama.trim(),
            jurusan: jurusan.trim(),
            tahunLulus: Number(tahunLulus),
            email: email?.trim() || null,
            noHp: noHp?.trim() || null,
        });

        res.json({ message: "Data alumni berhasil diperbarui." });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ─── Hapus Alumni (admin) ─────────────────────────────────────────────────────
export const hapusAlumni = async (req, res) => {
    try {
        const { id } = req.params;
        const alumni = await findAlumniById(Number(id));
        if (!alumni) return res.status(404).json({ message: "Alumni tidak ditemukan." });

        await deleteAlumni(Number(id));
        res.json({ message: `Data alumni "${alumni.nama}" berhasil dihapus.` });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ─── Import Excel ─────────────────────────────────────────────────────────────
// Kolom yang dikenali (fleksibel): nis/nisn, nama, jurusan, tahun/tahunlulus, email, nohp/hp/telepon
export const importAlumniExcel = async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ message: "File Excel tidak ditemukan." });

        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.load(req.file.buffer);

        const sheet = workbook.worksheets[0];
        if (!sheet) return res.status(400).json({ message: "Sheet pertama tidak ditemukan di file Excel." });

        // Ambil baris header (baris 1)
        const headerRow = sheet.getRow(1).values; // index mulai dari 1
        // headerRow[0] = undefined (ExcelJS), [1] = kolom A, dst.
        const colMap = {}; // key: nama kolom ternormalisasi → value: index
        headerRow.forEach((val, idx) => {
            if (val != null) colMap[norm(val)] = idx;
        });

        const getCel = (row, key) => {
            const idx = colMap[key];
            if (idx == null) return null;
            const cell = row.getCell(idx);
            return cell.value != null ? String(cell.value).trim() : null;
        };

        const rows = [];
        sheet.eachRow((row, rowNum) => {
            if (rowNum === 1) return; // skip header
            const nis = getCel(row, "nis") || getCel(row, "nisn");
            const nama = getCel(row, "nama") || getCel(row, "namalengkap");
            const jurusan = getCel(row, "jurusan") || getCel(row, "programkeahlian");
            const tahunLulus =
                getCel(row, "tahunlulus") ||
                getCel(row, "tahun") ||
                getCel(row, "angkatan");
            const email = getCel(row, "email");
            const noHp =
                getCel(row, "nohp") ||
                getCel(row, "hp") ||
                getCel(row, "telepon") ||
                getCel(row, "nomorhp");

            if (!nis || !nama) return; // skip baris kosong/tidak lengkap
            rows.push({ nis, nama, jurusan: jurusan || "", tahunLulus: tahunLulus || "", email, noHp });
        });

        if (rows.length === 0) {
            return res.status(400).json({ message: "Tidak ada data valid di file Excel. Pastikan baris 1 adalah header (NIS/NISN, Nama, Jurusan, Tahun Lulus)." });
        }

        const { inserted, skipped } = await bulkInsertAlumni(rows);
        res.json({
            message: `Import selesai. ${inserted} data baru ditambahkan, ${skipped} data dilewati (NIS sudah ada).`,
            inserted,
            skipped,
        });
    } catch (error) {
        console.error("Import Excel error:", error);
        res.status(500).json({ message: "Gagal memproses file Excel: " + error.message });
    }
};

// ─── Import SQL ───────────────────────────────────────────────────────────────
// Hanya izinkan INSERT INTO alumni / survey; tolak DROP, TRUNCATE, dll.
const ALLOWED_SQL_PATTERN = /^\s*INSERT\s+INTO\s+(alumni|survey)\s+/i;
const DANGEROUS_SQL_PATTERN = /\b(DROP|TRUNCATE|DELETE|UPDATE|ALTER|CREATE|REPLACE|EXEC|CALL)\b/i;

export const importAlumniSQL = async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ message: "File SQL tidak ditemukan." });

        const content = req.file.buffer.toString("utf-8");
        // Pisah per statement
        const statements = content
            .split(/;\s*\n|;\s*$/)
            .map((s) => s.trim())
            .filter(Boolean);

        let inserted = 0;
        let skipped = 0;
        const errors = [];

        for (const stmt of statements) {
            // Keamanan: hanya izinkan INSERT INTO alumni atau survey
            if (!ALLOWED_SQL_PATTERN.test(stmt)) {
                errors.push(`Statement dilewati (bukan INSERT alumni/survey): ${stmt.slice(0, 60)}...`);
                skipped++;
                continue;
            }
            if (DANGEROUS_SQL_PATTERN.test(stmt)) {
                errors.push(`Statement berbahaya diblokir: ${stmt.slice(0, 60)}...`);
                skipped++;
                continue;
            }
            try {
                await pool.query(stmt);
                inserted++;
            } catch (err) {
                errors.push(`Error pada statement: ${stmt.slice(0, 60)}... → ${err.message}`);
                skipped++;
            }
        }

        res.json({
            message: `Import SQL selesai. ${inserted} statement berhasil, ${skipped} dilewati/gagal.`,
            inserted,
            skipped,
            errors: errors.slice(0, 10), // kirim maks 10 error saja
        });
    } catch (error) {
        console.error("Import SQL error:", error);
        res.status(500).json({ message: "Gagal memproses file SQL: " + error.message });
    }
};

// ─── GET semua alumni ─────────────────────────────────────────────────────────
export const getAllAlumni = async (req, res) => {
    try {
        const alumni = await getAllAlumniModel();
        res.json(alumni);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ─── Daftar jurusan unik (dropdown) ──────────────────────────────────────────
export const getJurusanList = async (req, res) => {
    try {
        const jurusanList = await getDistinctJurusan();
        res.json(jurusanList);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ─── Daftar semua tahun lulus unik dari DB (dropdown form tambah/edit) ────────
export const getTahunList = async (req, res) => {
    try {
        const tahunList = await getDistinctTahun();
        res.json(tahunList);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ─── Daftar tahun lulus per jurusan (dropdown survei publik) ─────────────────
export const getTahunByJurusan = async (req, res) => {
    try {
        const { jurusan } = req.query;
        const tahunList = await getDistinctTahunByJurusan(jurusan);
        res.json(tahunList);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ─── Cari alumni (dropdown survei publik) ────────────────────────────────────
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

        // Judul Utama
        sheet.mergeCells("A1:K1");
        const titleCell = sheet.getCell("A1");
        titleCell.value = "DATA ALUMNI & TRACER STUDY - SMK PUSPITA BANGSA";
        titleCell.font = { name: "Arial", size: 14, bold: true, color: { argb: "FFFFFFFF" } };
        titleCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF1769AA" } };
        titleCell.alignment = { horizontal: "center", vertical: "middle" };
        sheet.getRow(1).height = 32;

        sheet.mergeCells("A2:K2");
        const infoCell = sheet.getCell("A2");
        const filterTeks = [
            jurusan && jurusan !== "Semua" ? `Jurusan: ${jurusan}` : "Semua Jurusan",
            tahun && tahun !== "Semua" ? `Tahun: ${tahun}` : null,
            cari ? `Pencarian: "${cari}"` : null,
        ].filter(Boolean).join(" | ");
        const now = new Date();
        const tglCetak = now.toLocaleDateString("id-ID", { day: "2-digit", month: "long", year: "numeric" });
        infoCell.value = `Tanggal Ekspor: ${tglCetak} | Filter: ${filterTeks} | Total: ${alumniList.length} Alumni`;
        infoCell.font = { name: "Arial", size: 9, italic: true, color: { argb: "FF475569" } };
        infoCell.alignment = { horizontal: "center", vertical: "middle" };
        sheet.getRow(2).height = 20;
        sheet.getRow(3).height = 10;

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
            cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF0F3B66" } };
            cell.alignment = { horizontal: "center", vertical: "middle", wrapText: true };
            cell.border = {
                top: { style: "thin", color: { argb: "FFCBD5E1" } },
                left: { style: "thin", color: { argb: "FFCBD5E1" } },
                bottom: { style: "medium", color: { argb: "FF0B2540" } },
                right: { style: "thin", color: { argb: "FFCBD5E1" } },
            };
            sheet.getColumn(idx + 1).width = h.width;
        });

        let countBekerja = 0, countKuliah = 0, countWirausaha = 0, countBelum = 0, countBelumSurvey = 0;
        alumniList.forEach((item, index) => {
            const rowNumber = index + 5;
            const row = sheet.getRow(rowNumber);
            row.height = 22;
            let aktivitas = "-";
            if (item.status_saat_ini === "Bekerja") { countBekerja++; aktivitas = item.nama_perusahaan ? `${item.nama_perusahaan}${item.bidang_kerja ? ` (${item.bidang_kerja})` : ""}` : (item.bidang_kerja || "Bekerja"); }
            else if (item.status_saat_ini === "Kuliah") { countKuliah++; aktivitas = [item.nama_kampus, item.jurusan_kampus].filter(Boolean).join(" - ") || "Kuliah"; }
            else if (item.status_saat_ini === "Wirausaha") { countWirausaha++; aktivitas = item.bidang_kerja || item.nama_perusahaan || "Wirausaha"; }
            else if (item.status_saat_ini === "Belum Bekerja") { countBelum++; aktivitas = "Belum Bekerja"; }
            else { countBelumSurvey++; }

            const rowData = [
                index + 1, item.nis || "-", item.nama || "-", item.jurusan || "-",
                item.tahun_lulus ? String(item.tahun_lulus) : "-",
                item.email || "-", item.no_hp || "-",
                item.status_saat_ini || "Belum Mengisi", aktivitas,
                item.relevansi_jurusan || "-", item.lama_tunggu_kerja || "-",
            ];
            const bgArgb = index % 2 === 1 ? "FFF8FAFC" : "FFFFFFFF";
            rowData.forEach((val, colIdx) => {
                const cell = row.getCell(colIdx + 1);
                cell.value = val;
                cell.font = { name: "Arial", size: 9 };
                cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: bgArgb } };
                cell.border = {
                    top: { style: "thin", color: { argb: "FFE2E8F0" } },
                    left: { style: "thin", color: { argb: "FFE2E8F0" } },
                    bottom: { style: "thin", color: { argb: "FFE2E8F0" } },
                    right: { style: "thin", color: { argb: "FFE2E8F0" } },
                };
                cell.alignment = [0, 1, 4, 6, 7, 9, 10].includes(colIdx)
                    ? { horizontal: "center", vertical: "middle" }
                    : { horizontal: "left", vertical: "middle" };
            });
        });

        const summaryRowIndex = alumniList.length + 6;
        sheet.mergeCells(`A${summaryRowIndex}:K${summaryRowIndex}`);
        const summaryCell = sheet.getCell(`A${summaryRowIndex}`);
        summaryCell.value = `Ringkasan: Total ${alumniList.length} Alumni | Bekerja: ${countBekerja} | Kuliah: ${countKuliah} | Wirausaha: ${countWirausaha} | Belum Bekerja: ${countBelum} | Belum Mengisi: ${countBelumSurvey}`;
        summaryCell.font = { name: "Arial", size: 9, bold: true, color: { argb: "FF0F3B66" } };
        summaryCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFE9F2FA" } };
        summaryCell.alignment = { horizontal: "center", vertical: "middle" };
        sheet.getRow(summaryRowIndex).height = 24;

        const cleanJurusan = jurusan && jurusan !== "Semua" ? `-${jurusan.toLowerCase().replace(/[^a-z0-9]/g, "-")}` : "";
        const cleanTahun = tahun && tahun !== "Semua" ? `-${tahun}` : "";
        const filename = `data-alumni${cleanJurusan}${cleanTahun}-${now.toISOString().slice(0, 10)}.xlsx`;
        res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
        res.setHeader("Content-Disposition", `attachment; filename=${filename}`);
        await workbook.xlsx.write(res);
        res.end();
    } catch (error) {
        console.error("Gagal export alumni Excel:", error);
        res.status(500).json({ message: "Gagal mengekspor data alumni ke Excel: " + error.message });
    }
};
