import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
});

// Tes koneksi sekali saat server start
export const testConnection = async () => {
    try {
        const conn = await pool.getConnection();
        console.log("MySQL Connect");
        conn.release();
    } catch (error) {
        console.error("Gagal konek ke MySQL:", error.message);
        process.exit(1);
    }
};

export default pool;
