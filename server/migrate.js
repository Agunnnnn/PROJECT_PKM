// Jalankan sekali untuk menyinkronkan seluruh struktur database:
// npm run migrate
import dotenv from "dotenv";
import pool from "./config/db.js";

dotenv.config();

/**
 * Tambah kolom ke tabel tertentu jika belum ada.
 * Aman dijalankan berulang kali — tidak akan error jika kolom sudah ada.
 */
const addColumnIfMissing = async (table, columnName, definition) => {
    const [cols] = await pool.query(`DESCRIBE \`${table}\``);
    const exists = cols.some((c) => c.Field === columnName);
    if (!exists) {
        await pool.query(
            `ALTER TABLE \`${table}\` ADD COLUMN \`${columnName}\` ${definition}`
        );
        console.log(`  ✅ [${table}] Kolom '${columnName}' berhasil ditambahkan.`);
    } else {
        console.log(`  ℹ️  [${table}] Kolom '${columnName}' sudah ada, dilewati.`);
    }
};

const migrate = async () => {
    try {
        console.log("═══════════════════════════════════════════");
        console.log("  Menjalankan migrasi database...");
        console.log("═══════════════════════════════════════════\n");

        // ─── Tabel: admin ────────────────────────────────────────────────────
        console.log("📋 Tabel: admin");
        await addColumnIfMissing("admin", "nama",       "VARCHAR(100) DEFAULT NULL");
        await addColumnIfMissing("admin", "email",      "VARCHAR(100) DEFAULT NULL");
        await addColumnIfMissing("admin", "telepon",    "VARCHAR(20) DEFAULT NULL");
        await addColumnIfMissing("admin", "role",       "ENUM('Administrator','SuperAdmin') DEFAULT 'Administrator'");
        await addColumnIfMissing("admin", "foto",       "VARCHAR(255) DEFAULT NULL");
        await addColumnIfMissing("admin", "status",     "VARCHAR(20) DEFAULT 'Aktif'");
        await addColumnIfMissing("admin", "last_login", "DATETIME DEFAULT NULL");
        await addColumnIfMissing("admin", "created_at", "TIMESTAMP DEFAULT CURRENT_TIMESTAMP");

        // ─── Tabel: alumni ───────────────────────────────────────────────────
        console.log("\n📋 Tabel: alumni");
        await addColumnIfMissing(
            "alumni",
            "tanggal_lahir",
            "DATE DEFAULT NULL COMMENT 'Tanggal lahir alumni, digunakan sebagai verifikasi identitas saat mengisi survei'"
        );

        // ─── Tabel: survey ───────────────────────────────────────────────────
        console.log("\n📋 Tabel: survey");
        await addColumnIfMissing(
            "survey",
            "gaji",
            "VARCHAR(50) DEFAULT NULL COMMENT 'Rentang gaji bulanan, hanya diisi jika status Bekerja'"
        );

        console.log("\n═══════════════════════════════════════════");
        console.log("  ✅ Semua migrasi selesai!");
        console.log("═══════════════════════════════════════════");
    } catch (err) {
        console.error("\n❌ Gagal migrasi:", err.message);
        process.exit(1);
    } finally {
        await pool.end();
        process.exit(0);
    }
};

migrate();
