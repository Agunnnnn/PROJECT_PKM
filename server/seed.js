// Jalankan sekali saja untuk membuat akun admin pertama:
// npm run seed
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import { findAdminByUsername, createAdmin } from "./models/Admin.js";
import pool from "./config/db.js";

dotenv.config();

const seedAdmin = async () => {
  const existing = await findAdminByUsername("admin");
  if (existing) {
    console.log("Admin sudah ada, tidak membuat ulang.");
    process.exit();
  }

  const hashedPassword = await bcrypt.hash("admin123", 10);
  await createAdmin("admin", hashedPassword);

  console.log("Admin berhasil dibuat!");
  console.log("Username: admin");
  console.log("Password: admin123");
  console.log("Ganti password ini setelah login pertama.");

  await pool.end();
  process.exit();
};

seedAdmin().catch((err) => {
  console.error("Gagal membuat admin:", err.message);
  process.exit(1);
});
