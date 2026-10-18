import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { testConnection } from "./config/db.js";

import authRoutes from "./routes/auth.js";
import alumniRoutes from "./routes/alumni.js";
import surveyRoutes from "./routes/survey.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use("/api/auth", authRoutes);
app.use("/api/alumni", alumniRoutes);
app.use("/api/survey", surveyRoutes);

app.get("/", (req, res) => {
    res.send("Tracer Study API (MySQL) berjalan 🚀");
});

const PORT = process.env.PORT || 5000;

testConnection().then(() => {
    app.listen(PORT, () => console.log(`Server berjalan di port ${PORT}`));
});
