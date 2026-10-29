// Jalankan sekali saja untuk update struktur tabel admin:
// npm run migrate
import dotenv from "dotenv";
import pool from "./config/db.js";

dotenv.config();

const addColumnIfMissing = async (columnName, definition) => {
  const [cols] = await pool.query("DESCRIBE admin");
  const exists = cols.some((c) => c.Field === columnName);
  if (!exists) {
    await pool.query(`ALTER TABLE admin ADD COLUMN ${columnName} ${definition}`);
    console.log(`  ✅ Kolom '${columnName}' berhasil ditambahkan.`);
  } else {
    console.log(`  ℹ️  Kolom '${columnName}' sudah ada, dilewati.`);
  }
};

const migrate = async () => {
  try {
    console.log("Menjalankan migrasi database...\n");

    await addColumnIfMissing("nama",       "VARCHAR(100) DEFAULT NULL");
    await addColumnIfMissing("email",      "VARCHAR(100) DEFAULT NULL");
    await addColumnIfMissing("telepon",    "VARCHAR(20) DEFAULT NULL");
    await addColumnIfMissing("role",       "VARCHAR(50) DEFAULT 'Administrator'");
    await addColumnIfMissing("foto",       "VARCHAR(255) DEFAULT NULL");
    await addColumnIfMissing("status",     "VARCHAR(20) DEFAULT 'Aktif'");
    await addColumnIfMissing("last_login", "DATETIME DEFAULT NULL");

    console.log("\n✅ Migrasi selesai!");
  } catch (err) {
    console.error("❌ Gagal migrasi:", err.message);
    process.exit(1);
  } finally {
    await pool.end();
    process.exit();
  }
};

migrate();
