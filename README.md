# Sistem Tracer Study Alumni Berbasis Web & Machine Learning

Platform Tracer Study terintegrasi untuk melacak keterserapan alumni ke dunia kerja/pendidikan tinggi serta menilai relevansi jurusan secara otomatis menggunakan Natural Language Processing / Machine Learning.

- **Mitra / Objek Studi:** SMK Puspita Bangsa
- **Institusi Pengembang:** Universitas Pamulang (Program Kreativitas Mahasiswa - PKM)

---

## 📌 Ringkasan Arsitektur & Teknologi

Aplikasi ini menggunakan arsitektur modular yang terdiri dari 3 layanan utama:

```
[ Frontend: React + Vite ] (Port 5173)
         │
         ▼ (HTTP / REST API)
[ Backend: Express.js + MySQL ] (Port 5000)
         │
         ├──► [ MySQL Database ] (Port 3306)
         │
         ▼ (HTTP Request Internal)
[ ML API: Python Flask + Scikit-learn ] (Port 5001)
```

| Modul | Direktori | Stack / Library Utama | Tanggung Jawab |
|---|---|---|---|
| **Frontend** | `/client` | React 18, Vite, Tailwind CSS v4, React Router, Recharts, Lucide Icons, Axios | Antarmuka pengguna (wizard form survei alumni publik & dashboard admin interaktif) |
| **Backend API** | `/server` | Node.js, Express.js, MySQL2, JWT (`jsonwebtoken`), Bcryptjs, Multer, ExcelJS, PDFKit | Business logic, autentikasi admin, relasi data, ekspor laporan (PDF/Excel), proxy ke ML service |
| **ML Engine** | `/ml-api` | Python 3, Flask, Flask-CORS, Scikit-learn, Pandas, Joblib | Model klasifikasi relevansi berbasis teks (TF-IDF Vectorizer + Cosine Similarity) |
| **Database** | File `.sql` | MySQL (`Project_PKM.sql`) | Penyimpanan data master alumni, respons survei, dan kredensial admin |

---

## 🌟 Fitur Utama

1. **Survei Alumni Bertahap (Multi-step Wizard):**
   - Pencarian alumni berantai: Pilih **Jurusan** → **Tahun Lulus** → **Nama**, lalu **NIS** terisi otomatis.
   - Pilihan status: **Bekerja**, **Kuliah**, **Wirausaha**, atau **Belum Bekerja**.
   - Input dinamis sesuai status (nama perusahaan & bidang kerja, atau nama kampus & jurusan kuliah).
2. **Prediksi Relevansi Otomatis (Machine Learning):**
   - Menghitung kecocokan jurusan asal alumni dengan bidang kerja (atau jurusan kuliah) secara otomatis tanpa alumni perlu mengira-ngira sendiri.
   - Output prediktif: `Sangat Sesuai`, `Cukup Sesuai`, atau `Tidak Sesuai` berdasarkan kemiripan semantik TF-IDF.
   - Tersedia mekanisme override aturan khusus via `pengecualian.json`.
3. **Panel Admin & Manajemen Data:**
   - Autentikasi aman JWT untuk pengelola/BKK sekolah.
   - Dashboard analitik interaktif (Recharts): rasio status alumni dan persentase relevansi pekerjaan.
   - CRUD data alumni + fitur Import massal.
   - Tabel respons survei dengan filter tahun kelulusan.
   - Ekspor data laporan resmi siap cetak ke format **PDF** dan **Excel (.xlsx)**.
   - Fitur *Hitung Ulang Relevansi* massal jika model ML diperbarui.

---

## 📁 Struktur Direktori

```text
PROJECT_PKM/
├── client/                     # Frontend SPA (React + Vite)
│   ├── src/
│   │   ├── api/                # Axios instance & ML client service
│   │   ├── components/         # Navbar, Footer, Modal Import/Tambah Data
│   │   ├── pages/
│   │   │   ├── admin/          # Dashboard, DataAlumni, DataSurvey, Laporan, ProfilAdmin
│   │   │   └── survey/         # Multi-step Survey (DataDiri, Status, Rincian, Relevansi)
│   │   ├── App.jsx             # Routing (Public & Protected Admin Routes)
│   │   └── main.jsx
├── server/                     # Backend REST API (Node.js + Express)
│   ├── config/db.js            # Koneksi MySQL pool
│   ├── controllers/            # Controller auth, alumni, survey
│   ├── middleware/             # auth.js (JWT protect) & upload.js (Multer)
│   ├── models/                 # Model & query SQL (Admin, Alumni, Survey)
│   ├── routes/                 # Endpoint routing (/api/auth, /api/alumni, /api/survey)
│   ├── uploads/                # File upload (foto profil admin)
│   ├── migrate.js              # Script migrasi struktur tabel otomatis
│   ├── seed.js                 # Script seed data awal
│   └── server.js               # Entry point Express
├── ml-api/                     # Microservice Machine Learning (Python Flask)
│   ├── app.py                  # API server endpoint (/predict & /predict-batch)
│   ├── model_relevansi.pkl     # Model terlatih (TF-IDF & centroid per jurusan)
│   ├── pengecualian.json       # Kamus kecocokan manual / aturan khusus
│   └── requirements.txt        # Dependensi Python
├── PRD-Tracer-Study.md         # Dokumen kebutuhan produk lengkap (PRD)
├── Project_PKM.sql             # Dump database MySQL awal
└── README.md                   # Dokumentasi teknis & panduan instalasi
```

---

## 🗄️ Skema Database

- **`alumni`**: Menyimpan master data lulusan (`id`, `nis`, `nama`, `jurusan`, `tahun_lulus`, `email`, `no_hp`).
- **`survey`**: Menyimpan hasil pengisian kuesioner (`id`, `alumni_id`, `status_saat_ini`, `nama_perusahaan`, `bidang_kerja`, `relevansi_jurusan`, `lama_tunggu_kerja`, `nama_kampus`, `jurusan_kampus`, `saran_untuk_sekolah`).
- **`admin`**: Kredensial akun BKK/pengelola (`id`, `username`, `password` hash bcrypt, `nama`, `foto`).

---

## 🚀 Panduan Menjalankan Sistem

Pastikan sebelum memulai:
- **Node.js** (v18+) terpasang.
- **Python** (v3.9+) terpasang.
- **MySQL Server** aktif (bisa melalui DBngin, XAMPP, Homebrew, atau MySQL bawaan).

> ⚠️ **Penting:** Sistem membutuhkan **3 terminal** berjalan bersamaan (Database -> Backend -> ML API -> Frontend).

### 1. Persiapan Database MySQL
1. Buat database baru bernama `Project_PKM` di MySQL Anda.
2. Import file `Project_PKM.sql` ke dalam database `Project_PKM`.
3. Buat file `.env` di dalam folder `server/` (atau sesuaikan yang sudah ada):
   ```env
   PORT=5000
   DB_HOST=127.0.0.1
   DB_USER=root
   DB_PASSWORD=
   DB_NAME=Project_PKM
   JWT_SECRET=rahasia_jwt_tracer_study
   ```
   *(Catatan: Jika menggunakan DBngin di macOS, default password `root` adalah kosong/blank).*

---

### 2. Menjalankan Backend (Terminal 1)
```bash
cd server
npm install
npm run migrate    
npm run dev        # Berjalan di http://localhost:5000
```

---

### 3. Menjalankan ML API (Terminal 2)
```bash
cd ml-api

# macOS / Linux:
pip install -r requirements.txt
python app.py      # Berjalan di http://localhost:5001

# Windows:
python -m pip install -r requirements.txt
python app.py
```
*(Endpoint cek status: `http://localhost:5001/health`)*

---

### 4. Menjalankan Frontend (Terminal 3)
```bash
cd client
npm install
npm run dev        # Berjalan di http://localhost:5173
```

---

## 🔐 Kredensial Akses Awal

- **Halaman Pengisian Survei (Publik):** [http://localhost:5173](http://localhost:5173)
- **Login Portal Admin:** [http://localhost:5173/login](http://localhost:5173/login)
  - **Username:** `admin`
  - **Password:** `admin123`

---

## 🔍 Detail Mekanisme Machine Learning (`ml-api`)

1. **Training & Vectorization:**
   Model TF-IDF dilatih dengan korpus deskripsi profesi, kurikulum SMK, dan kata kunci tiap program keahlian (Akuntansi, OTKP, BDP, RPL, dll.).
2. **Kalkulasi Kemiripan:**
   Input bebas alumni (contoh: *"Junior Frontend Developer"*, *"Staff Kasir"*, *"Admin Gudang"*) dianalisis kemiripan vektor kosinusnya terhadap deskripsi jurusan.
3. **Penentuan Ambang Batas (Threshold):**
   - Skor Cosine $\ge 0.40$ $\rightarrow$ **Sangat Sesuai**
   - Skor Cosine antara $0.20 - 0.39$ $\rightarrow$ **Cukup Sesuai**
   - Skor Cosine $< 0.20$ $\rightarrow$ **Tidak Sesuai**
4. **Fail-Safe Mechanism:**
   Jika service `ml-api` belum aktif saat alumni submit, backend tetap menyimpan survei ke database dengan nilai `relevansi_jurusan = NULL`, sehingga proses survei tidak terganggu. Admin dapat melakukan kalkulasi susulan melalui tombol *Hitung Ulang Relevansi* di dashboard.

---

## 🛠️ Panduan Pemecahan Masalah (Troubleshooting)

- **`Access denied for user 'root'@'localhost'`:**
  Periksa password MySQL di `server/.env`. Untuk pengguna Mac DBngin, kosongi `DB_PASSWORD=` dan set `DB_HOST=127.0.0.1`.
- **`ModuleNotFoundError: No module named 'flask'`:**
  Gunakan environment Python aktif yang sama (misal `conda activate` atau buat venv tersendiri), lalu install dependensi dengan `pip install -r requirements.txt`.
- **Relevansi Berstatus Kosong:**
  Pastikan `python app.py` di folder `ml-api` berstatus running di port 5001.
- **Error CORS di Browser:**
  Pastikan backend berjalan di port 5000 sebelum membuka frontend di port 5173.
