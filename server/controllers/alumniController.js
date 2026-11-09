import ExcelJS from "exceljs";
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
  getAlumniWithSurveyPaginated,
  getAlumniDetailById,
  verifikasiAlumni,
} from "../models/Alumni.js";
import { upsertSurveyByAlumniId } from "../models/Survey.js";

// ─── Helper: normalkan nama kolom Excel ──────────────────────────────────────
const norm = (str) =>
  String(str ?? "")
    .toLowerCase()
    .replace(/[\s_\-/]/g, "");

// ─── Temukan Alumni (dipakai form survei publik setelah verifikasi) ───────────
// Tidak lagi membuat alumni baru — alumni hanya bisa ditambah admin via import Excel
export const findOrCreateAlumni = async (req, res, next) => {
  try {
    const { nis } = req.body;

    if (!nis) {
      return res.status(400).json({ message: "NIS wajib diisi." });
    }

    const alumni = await findAlumniByNis(nis.trim());
    if (!alumni) {
      return res.status(404).json({
        message: "Data alumni tidak ditemukan. Pastikan NIS sudah terdaftar.",
      });
    }

    res.status(200).json(alumni);
  } catch (error) {
    next(error);
  }
};

// ─── Verifikasi Identitas Alumni (NISN + Tanggal Lahir format DDMMYY) ────────
// Endpoint publik — dipanggil di Step 1 form survei sebelum alumni boleh lanjut
export const verifikasiAlumniHandler = async (req, res, next) => {
  try {
    const { nis, tanggalLahir } = req.body;

    if (!nis || !tanggalLahir) {
      return res.status(400).json({
        message: "NIS/NISN dan tanggal lahir wajib diisi.",
        valid: false,
      });
    }

    // Format tanggal lahir harus 6 digit angka (DDMMYY)
    const tglClean = String(tanggalLahir).replace(/\D/g, "");
    if (tglClean.length !== 6) {
      return res.status(400).json({
        message: "Format tanggal lahir tidak valid. Gunakan format DDMMYY (contoh: 150106).",
        valid: false,
      });
    }

    const alumni = await verifikasiAlumni(nis.trim(), tglClean);

    if (!alumni) {
      return res.status(401).json({
        message: "NIS/NISN atau tanggal lahir tidak sesuai. Periksa kembali data Anda.",
        valid: false,
      });
    }

    // Kembalikan data alumni (tanpa tanggal_lahir) untuk dipakai form
    res.json({
      valid: true,
      alumni: {
        id: alumni.id,
        nis: alumni.nis,
        nama: alumni.nama,
        jurusan: alumni.jurusan,
        tahunLulus: alumni.tahun_lulus,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ─── Tambah Alumni Manual (admin) ────────────────────────────────────────────
export const tambahAlumni = async (req, res, next) => {
  try {
    const { nis, nama, jurusan, tahunLulus, email, noHp, tanggalLahir } = req.body;

    if (!nis || !nama || !jurusan || !tahunLulus) {
      return res
        .status(400)
        .json({ message: "NIS, nama, jurusan, dan tahun lulus wajib diisi." });
    }

    const existing = await findAlumniByNis(nis.trim());
    if (existing) {
      return res
        .status(409)
        .json({ message: `NIS ${nis} sudah terdaftar (${existing.nama}).` });
    }

    const alumni = await createAlumni({
      nis: nis.trim(),
      nama: nama.trim(),
      jurusan: jurusan.trim(),
      tahunLulus: Number(tahunLulus),
      email: email?.trim() || null,
      noHp: noHp?.trim() || null,
      tanggalLahir: tanggalLahir?.trim() || null,
    });

    res.status(201).json({ message: "Alumni berhasil ditambahkan.", alumni });
  } catch (error) {
    next(error);
  }
};

// ─── Edit Alumni (admin) ──────────────────────────────────────────────────────
export const editAlumni = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { nis, nama, jurusan, tahunLulus, email, noHp, tanggalLahir } = req.body;

    if (!nis || !nama || !jurusan || !tahunLulus) {
      return res
        .status(400)
        .json({ message: "NIS, nama, jurusan, dan tahun lulus wajib diisi." });
    }

    const alumni = await findAlumniById(Number(id));
    if (!alumni)
      return res.status(404).json({ message: "Alumni tidak ditemukan." });

    // Cek NIS bentrok dengan alumni lain
    const duplikat = await findAlumniByNis(nis.trim());
    if (duplikat && duplikat.id !== Number(id)) {
      return res.status(409).json({
        message: `NIS ${nis} sudah dipakai alumni lain (${duplikat.nama}).`,
      });
    }

    await updateAlumni(Number(id), {
      nis: nis.trim(),
      nama: nama.trim(),
      jurusan: jurusan.trim(),
      tahunLulus: Number(tahunLulus),
      email: email?.trim() || null,
      noHp: noHp?.trim() || null,
      tanggalLahir: tanggalLahir?.trim() || null,
    });

    res.json({ message: "Data alumni berhasil diperbarui." });
  } catch (error) {
    next(error);
  }
};

// ─── Hapus Alumni (admin) ─────────────────────────────────────────────────────
// Penghapusan survey + alumni dibungkus transaksi di layer model (atomic)
export const hapusAlumni = async (req, res, next) => {
  try {
    const { id } = req.params;
    const alumni = await findAlumniById(Number(id));
    if (!alumni)
      return res.status(404).json({ message: "Alumni tidak ditemukan." });

    await deleteAlumni(Number(id));
    res.json({ message: `Data alumni "${alumni.nama}" berhasil dihapus.` });
  } catch (error) {
    next(error);
  }
};

// ─── Helper: Mapping kode Rombel Dapodik ke Jurusan Resmi ─────────────────────
const mapRombelToJurusan = (rombel) => {
  if (!rombel) return null;
  const upper = String(rombel).toUpperCase().replace(/\s+/g, "");
  if (upper.includes("RPL")) return "Rekayasa Perangkat Lunak";
  if (upper.includes("AKL") || upper.includes(".AK")) return "Akuntansi";
  if (upper.includes("BD")) return "Bisnis Daring dan Pemasaran";
  if (upper.includes("MP") || upper.includes("OTKP")) return "Otomatisasi Tata Kelola Perkantoran";
  if (upper.includes("PH") || upper.includes("HOTEL")) return "Perhotelan";
  return String(rombel).trim();
};

// ─── Helper: Ekstrak Tingkat Kelas dari Rombel ─────────────────────────────────
const mapRombelToTingkat = (rombel) => {
  if (!rombel) return "UNKNOWN";
  const upper = String(rombel).toUpperCase().trim();
  if (upper.startsWith("XII.") || upper.startsWith("XII ") || upper.startsWith("12")) return "XII";
  if (upper.startsWith("XI.") || upper.startsWith("XI ") || upper.startsWith("11")) return "XI";
  if (upper.startsWith("X.") || upper.startsWith("X ") || upper.startsWith("10")) return "X";
  return "UNKNOWN";
};

// ─── Import Excel & Dapodik ──────────────────────────────────────────────────
// Mendukung 2 format:
// 1. Template Standar Tracer Study (Header baris 1: NIS, Nama, Jurusan, Tahun Lulus, Email, No HP)
// 2. Format Mentah Dapodik Kemendikbud (Header otomatis dideteksi baris 5, membaca NISN, Nama, Rombel, HP, Email)
// Fitur: filter tingkat (XII/XI/X/ALL), default tahun kelulusan, dan validasi per baris
export const importAlumniExcel = async (req, res, next) => {
  try {
    if (!req.file)
      return res.status(400).json({ message: "File Excel tidak ditemukan." });

    const filterKelas = (req.body.filterKelas || "XII").trim(); // Default hanya kelas XII
    const defaultTahun = req.body.tahunLulus
      ? parseInt(String(req.body.tahunLulus).trim(), 10)
      : new Date().getFullYear();

    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(req.file.buffer);

    const sheet = workbook.worksheets[0];
    if (!sheet)
      return res
        .status(400)
        .json({ message: "Sheet pertama tidak ditemukan di file Excel." });

    // ─── Deteksi Baris Header Otomatis (Baris 1 hingga 10) ───────────────────
    let headerRowNum = 1;
    let isDapodik = false;

    for (let r = 1; r <= Math.min(10, sheet.rowCount); r++) {
      const rowVals = sheet.getRow(r).values;
      if (!rowVals || !Array.isArray(rowVals)) continue;
      const normalizedCells = rowVals.map((c) => norm(c));
      const hasNis = normalizedCells.some(
        (c) => c === "nis" || c === "nisn" || c === "nipd"
      );
      const hasNama = normalizedCells.some(
        (c) => c === "nama" || c === "namalengkap"
      );
      const hasJurusanOrRombel = normalizedCells.some(
        (c) => c === "jurusan" || c.includes("rombel")
      );

      if (hasNis && hasNama && hasJurusanOrRombel) {
        headerRowNum = r;
        isDapodik = normalizedCells.some(
          (c) => c.includes("rombel") || c === "nisn" || c === "nipd"
        );
        break;
      }
    }

    const headerRow = sheet.getRow(headerRowNum).values;
    const colMap = {};
    headerRow.forEach((val, idx) => {
      if (val != null) colMap[norm(val)] = idx;
    });

    const getCel = (row, key) => {
      const idx = colMap[key];
      if (idx == null) return null;
      const cell = row.getCell(idx);
      if (cell.value == null) return null;
      if (typeof cell.value === "object" && cell.value.text) {
        return String(cell.value.text).trim();
      }
      return String(cell.value).trim();
    };

    // ─── Tahap 1: Baca & validasi baris data ─────────────────────────────────
    const validRows = [];
    const errorRows = [];
    let filteredOutCount = 0;

    sheet.eachRow((row, rowNum) => {
      // Lewati baris header dan baris sebelum header
      if (rowNum <= headerRowNum) return;

      const nama = getCel(row, "nama") || getCel(row, "namalengkap");
      const nisRaw =
        getCel(row, "nisn") || getCel(row, "nis") || getCel(row, "nipd");

      // Lewati jika ini adalah baris kosong atau subheader berulang
      if (!nama && !nisRaw) return;
      if (
        norm(nama) === "nama" ||
        norm(nisRaw) === "nis" ||
        norm(nisRaw) === "nisn" ||
        norm(nisRaw) === "nipd"
      ) {
        return;
      }

      // Ambil rombel & jurusan
      const rombelRaw =
        getCel(row, "rombelsaatini") || getCel(row, "rombel");

      // Jika format Dapodik dan ada filter kelas (misal hanya kelas XII)
      if (isDapodik && rombelRaw && filterKelas !== "ALL") {
        const tingkat = mapRombelToTingkat(rombelRaw);
        if (tingkat !== filterKelas) {
          filteredOutCount++;
          return; // dilewati karena bukan kelas yang ditargetkan (bukan error)
        }
      }

      const jurusan =
        (isDapodik ? mapRombelToJurusan(rombelRaw) : null) ||
        getCel(row, "jurusan") ||
        getCel(row, "programkeahlian") ||
        mapRombelToJurusan(rombelRaw);

      // Tahun lulus: ambil dari excel jika ada, atau fallback ke default input tahun
      const tahunCell =
        getCel(row, "tahunlulus") ||
        getCel(row, "tahun") ||
        getCel(row, "angkatan");
      const tahunRaw = tahunCell || defaultTahun;

      const email = getCel(row, "email");
      const noHpRaw =
        getCel(row, "hp") ||
        getCel(row, "nohp") ||
        getCel(row, "telepon") ||
        getCel(row, "nomorhp");

      // Bersihkan noHp jika ada format ilmiah/spasi
      const noHp = noHpRaw ? String(noHpRaw).replace(/[^\d+]/g, "").trim() : null;

      // Tanggal lahir — baca dari kolom "Tanggal Lahir" atau "tgllahir" di Dapodik
      // Format di Excel biasanya YYYY-MM-DD atau Date object dari ExcelJS
      const tglLahirRaw =
        getCel(row, "tanggallahir") ||
        getCel(row, "tgllahir") ||
        getCel(row, "tgl.lahir") ||
        getCel(row, "tanggal lahir");

      let tanggalLahir = null;
      if (tglLahirRaw) {
        // ExcelJS bisa mengembalikan Date object atau string berbagai format
        // Gunakan string parsing langsung agar tidak terpengaruh timezone server
        if (tglLahirRaw instanceof Date) {
          // Date object dari ExcelJS — pakai local methods karena ExcelJS sudah handle timezone
          const d = tglLahirRaw;
          const yyyy = d.getFullYear();
          const mm = String(d.getMonth() + 1).padStart(2, "0");
          const dd = String(d.getDate()).padStart(2, "0");
          tanggalLahir = `${yyyy}-${mm}-${dd}`;
        } else {
          // String — coba ekstrak YYYY-MM-DD langsung tanpa new Date()
          const tglStr = String(tglLahirRaw).trim();
          // Format YYYY-MM-DD (paling umum dari Dapodik)
          const matchISO = tglStr.match(/^(\d{4})-(\d{2})-(\d{2})/);
          if (matchISO) {
            tanggalLahir = `${matchISO[1]}-${matchISO[2]}-${matchISO[3]}`;
          } else {
            // Format DD/MM/YYYY atau DD-MM-YYYY
            const matchDMY = tglStr.match(/^(\d{2})[\/\-](\d{2})[\/\-](\d{4})/);
            if (matchDMY) {
              tanggalLahir = `${matchDMY[3]}-${matchDMY[2]}-${matchDMY[1]}`;
            }
          }
        }
      }

      const rowErrors = [];

      if (!nisRaw) rowErrors.push("NIS / NISN kosong");
      else if (String(nisRaw).length > 50)
        rowErrors.push("NIS terlalu panjang (maks 50 karakter)");

      if (!nama) rowErrors.push("Nama kosong");
      else if (String(nama).length > 100)
        rowErrors.push("Nama terlalu panjang (maks 100 karakter)");

      if (!jurusan) rowErrors.push("Jurusan / Rombel kosong");
      else if (String(jurusan).length > 100)
        rowErrors.push("Jurusan terlalu panjang (maks 100 karakter)");

      const tahunNum = tahunRaw ? parseInt(String(tahunRaw).trim(), 10) : NaN;
      if (!tahunRaw || isNaN(tahunNum))
        rowErrors.push("Tahun lulus kosong atau bukan angka");
      else if (tahunNum < 1990 || tahunNum > 2100)
        rowErrors.push(
          `Tahun lulus tidak valid: ${tahunRaw} (harus antara 1990–2100)`
        );

      if (rowErrors.length > 0) {
        errorRows.push({ baris: rowNum, error: rowErrors.join("; ") });
        return;
      }

      validRows.push({
        nis: String(nisRaw).trim(),
        nama: String(nama).trim(),
        jurusan: String(jurusan).trim(),
        tahunLulus: tahunNum,
        email: email ? String(email).trim() : null,
        noHp: noHp || null,
        tanggalLahir: tanggalLahir || null,
      });
    });

    if (validRows.length === 0 && errorRows.length === 0) {
      return res.status(400).json({
        message:
          "Tidak ada data valid yang ditemukan di file Excel. Pastikan file berisi data siswa / alumni.",
      });
    }

    // ─── Tahap 2: Insert baris valid dibungkus transaksi (atomic) ────────────
    const { inserted, skipped, skippedDetail } = await bulkInsertAlumni(
      validRows
    );

    const filterInfo =
      filteredOutCount > 0
        ? ` (${filteredOutCount} siswa non-Kelas ${filterKelas} dilewati otomatis)`
        : "";

    res.json({
      message: `Import ${isDapodik ? "Dapodik" : "Excel"} selesai. ${inserted} ditambahkan, ${skipped} dilewati (NIS sudah ada), ${errorRows.length} baris error.${filterInfo}`,
      inserted,
      skipped,
      filteredOut: filteredOutCount,
      isDapodik,
      errorCount: errorRows.length,
      errors: errorRows,
      skippedDetail,
    });
  } catch (error) {
    console.error("Import Excel error:", error);
    if (
      error.message?.includes("Excel") ||
      error.message?.includes("workbook") ||
      error.message?.includes("zip")
    ) {
      return res.status(400).json({
        message:
          "Gagal memproses file Excel. Pastikan file berformat Excel (.xlsx/.xls) yang valid.",
      });
    }
    next(error);
  }
};

// ─── GET Detail Alumni by ID (admin) ─────────────────────────────────────────
export const getAlumniById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const alumniId = Number(id);
    if (isNaN(alumniId)) {
      return res.status(400).json({ message: "ID alumni harus berupa angka" });
    }

    const alumni = await getAlumniDetailById(alumniId);
    if (!alumni) {
      return res.status(404).json({ message: "Alumni tidak ditemukan." });
    }

    res.json(alumni);
  } catch (error) {
    next(error);
  }
};

// ─── GET semua alumni (dengan filter & pagination) ───────────────────────────
export const getAllAlumni = async (req, res, next) => {
  try {
    const { page, limit, status, jurusan, tahunLulus, search, cari } = req.query;
    const searchParam = search || cari;

    if (page !== undefined || limit !== undefined) {
      const result = await getAlumniWithSurveyPaginated({
        jurusan,
        tahunLulus,
        status,
        search: searchParam,
        page,
        limit,
      });
      return res.json(result);
    }

    const alumni = await getAlumniWithSurvey({
      jurusan,
      tahunLulus,
      status,
      search: searchParam,
    });
    res.json(alumni);
  } catch (error) {
    next(error);
  }
};

// ─── Daftar jurusan unik (dropdown) ──────────────────────────────────────────
export const getJurusanList = async (req, res, next) => {
  try {
    const jurusanList = await getDistinctJurusan();
    res.json(jurusanList);
  } catch (error) {
    next(error);
  }
};

// ─── Daftar semua tahun lulus unik dari DB (dropdown form tambah/edit) ────────
export const getTahunList = async (req, res, next) => {
  try {
    const tahunList = await getDistinctTahun();
    res.json(tahunList);
  } catch (error) {
    next(error);
  }
};

// ─── Daftar tahun lulus per jurusan (dropdown survei publik) ─────────────────
export const getTahunByJurusan = async (req, res, next) => {
  try {
    const { jurusan } = req.query;
    const tahunList = await getDistinctTahunByJurusan(jurusan);
    res.json(tahunList);
  } catch (error) {
    next(error);
  }
};

// ─── Cari alumni (dropdown survei publik) ────────────────────────────────────
export const searchAlumni = async (req, res, next) => {
  try {
    const { jurusan, tahunLulus } = req.query;
    const alumni = await getAlumniByJurusanTahun(jurusan, tahunLulus);
    res.json(alumni);
  } catch (error) {
    next(error);
  }
};

// ─── Ekspor Data Alumni ke Excel ──────────────────────────────────────────────
export const exportAlumniExcel = async (req, res, next) => {
  try {
    const { jurusan, tahun, cari } = req.query;
    const alumniList = await getAlumniWithSurvey({
      jurusan,
      tahunLulus: tahun,
      search: cari,
    });

    if (alumniList.length === 0) {
      return res
        .status(404)
        .json({ message: "Tidak ada data alumni untuk diekspor" });
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
    sheet.mergeCells("A1:L1");
    const titleCell = sheet.getCell("A1");
    titleCell.value = "DATA ALUMNI & TRACER STUDY - SMK PUSPITA BANGSA";
    titleCell.font = {
      name: "Arial",
      size: 14,
      bold: true,
      color: { argb: "FFFFFFFF" },
    };
    titleCell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF1769AA" },
    };
    titleCell.alignment = { horizontal: "center", vertical: "middle" };
    sheet.getRow(1).height = 32;

    sheet.mergeCells("A2:L2");
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
    infoCell.font = {
      name: "Arial",
      size: 9,
      italic: true,
      color: { argb: "FF475569" },
    };
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
      { header: "Rentang Gaji", width: 18 },
      { header: "Aktivitas / Instansi / Kampus", width: 32 },
      { header: "Kesesuaian Jurusan", width: 20 },
      { header: "Lama Tunggu", width: 16 },
    ];
    const headerRow = sheet.getRow(4);
    headerRow.height = 26;
    headers.forEach((h, idx) => {
      const cell = headerRow.getCell(idx + 1);
      cell.value = h.header;
      cell.font = {
        name: "Arial",
        size: 10,
        bold: true,
        color: { argb: "FFFFFFFF" },
      };
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FF0F3B66" },
      };
      cell.alignment = {
        horizontal: "center",
        vertical: "middle",
        wrapText: true,
      };
      cell.border = {
        top: { style: "thin", color: { argb: "FFCBD5E1" } },
        left: { style: "thin", color: { argb: "FFCBD5E1" } },
        bottom: { style: "medium", color: { argb: "FF0B2540" } },
        right: { style: "thin", color: { argb: "FFCBD5E1" } },
      };
      sheet.getColumn(idx + 1).width = h.width;
    });

    let countBekerja = 0,
      countKuliah = 0,
      countWirausaha = 0,
      countBelum = 0,
      countBelumSurvey = 0;
    alumniList.forEach((item, index) => {
      const rowNumber = index + 5;
      const row = sheet.getRow(rowNumber);
      row.height = 22;
      let aktivitas = "-";
      if (item.status_saat_ini === "Bekerja") {
        countBekerja++;
        aktivitas = item.nama_perusahaan
          ? `${item.nama_perusahaan}${item.bidang_kerja ? ` (${item.bidang_kerja})` : ""}`
          : item.bidang_kerja || "Bekerja";
      } else if (item.status_saat_ini === "Kuliah") {
        countKuliah++;
        aktivitas =
          [item.nama_kampus, item.jurusan_kampus].filter(Boolean).join(" - ") ||
          "Kuliah";
      } else if (item.status_saat_ini === "Wirausaha") {
        countWirausaha++;
        aktivitas = item.bidang_kerja || item.nama_perusahaan || "Wirausaha";
      } else if (item.status_saat_ini === "Belum Bekerja") {
        countBelum++;
        aktivitas = "Belum Bekerja";
      } else {
        countBelumSurvey++;
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
        item.status_saat_ini === "Bekerja" ? (item.gaji || "-") : "Belum Bekerja",
        aktivitas,
        item.relevansi_jurusan || "-",
        item.lama_tunggu_kerja || "-",
      ];
      const bgArgb = index % 2 === 1 ? "FFF8FAFC" : "FFFFFFFF";
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
        cell.alignment = [0, 1, 4, 6, 7, 8, 10, 11].includes(colIdx)
          ? { horizontal: "center", vertical: "middle" }
          : { horizontal: "left", vertical: "middle" };
      });
    });

    const summaryRowIndex = alumniList.length + 6;
    sheet.mergeCells(`A${summaryRowIndex}:L${summaryRowIndex}`);
    const summaryCell = sheet.getCell(`A${summaryRowIndex}`);
    summaryCell.value = `Ringkasan: Total ${alumniList.length} Alumni | Bekerja: ${countBekerja} | Kuliah: ${countKuliah} | Wirausaha: ${countWirausaha} | Belum Bekerja: ${countBelum} | Belum Mengisi: ${countBelumSurvey}`;
    summaryCell.font = {
      name: "Arial",
      size: 9,
      bold: true,
      color: { argb: "FF0F3B66" },
    };
    summaryCell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFE9F2FA" },
    };
    summaryCell.alignment = { horizontal: "center", vertical: "middle" };
    sheet.getRow(summaryRowIndex).height = 24;

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
    res.setHeader("Content-Disposition", `attachment; filename=${filename}`);
    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    next(error);
  }
};
