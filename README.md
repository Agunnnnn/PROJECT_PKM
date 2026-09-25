## Prasyarat

- Node.js sudah terinstall (cek dengan `node -v`)
- MySQL sudah terinstall & jalan (XAMPP/Laragon juga bisa dipakai, tinggal aktifkan MySQL-nya)


## Teknologi yang Digunakan (Tahap Prototype)

| Bagian | Teknologi |
|---|---|
| **Frontend** | ReactJS, Vite |
| **Backend** | NodeJS, ExpressJS |
| **Database** | MySQL |
| **Machine Learning** | Python, Flask, Scikit-learn, Pandas |



## Cara Menjalankan — Backend

```bash
cd server
npm install


npm run dev    # jalankan terminal (server)
```

## Cara Menjalankan — Frontend

Buka terminal baru:

```bash
cd client
npm install
npm run dev    # jalankan di http://localhost:5173
```


## Cara Menjalankan — ML API (Python/Flask)

Buka terminal baru lagi:

```bash
cd ml-api
pip3 install -r requirements.txt --break-system-packages
python3 app.py    # jalankan di http://localhost:5001
```

Untuk Windows
```bash
cd ml-api
python -m pip install -r requirements.txt
python app.py
```

> ⚠️ **Tiga terminal harus tetap terbuka bersamaan** (server, client, ml-api) supaya aplikasinya berfungsi penuh, termasuk fitur prediksi relevansi otomatis.

## Alur Pemakaian

1. Buka `http://localhost:5173` → halaman publik untuk alumni mengisi form survey. Alumni memilih Jurusan → Tahun Lulus → Nama, dan NIS otomatis terisi (data alumni diimport dari sekolah ke tabel `alumni`).
2. Buka `http://localhost:5173/login` → login pakai `admin` / `admin123`.
3. Setelah login:
   - **Dashboard** — grafik statistik status alumni & relevansi pekerjaan
   - **Data Survey** — tabel semua respons, bisa difilter per tahun lulus, dan export ke **PDF**/**Excel** per tahun


   ## Fitur Utama

- Form survey dengan dropdown berantai (Jurusan → Tahun Lulus → Nama → NIS otomatis)
- Field tambahan: Bidang Kerja, Jurusan Kampus (untuk yang melanjutkan kuliah)
- **Prediksi relevansi otomatis** — saat status "Bekerja", sistem otomatis menghitung kesesuaian bidang kerja dengan jurusan menggunakan Machine Learning (TF-IDF + Cosine Similarity), tanpa alumni perlu memilih manual
- Export laporan ke PDF dan Excel, difilter berdasarkan tahun lulus
- Login admin dengan JWT



## Struktur Database (lihat)
- `alumni` — data diri alumni (nis, nama, jurusan, tahun_lulus, email, no_hp)
- `survey` — respons survey, relasi ke `alumni` lewat `alumni_id`, termasuk kolom `jurusan_kampus` dan `relevansi_jurusan` (diisi otomatis oleh ML)
- `admin` — akun login untuk dashboard


## Tentang ML API (`ml-api/`)

- Model dilatih di notebook (`ProjectPKM.ipynb`) menggunakan TF-IDF + Cosine Similarity untuk mengukur kemiripan antara bidang kerja alumni dengan deskripsi kata kunci tiap jurusan
- Model disimpan sebagai `model_relevansi.pkl` (menggunakan `joblib`), lalu di-load oleh `app.py` saat Flask dijalankan
- **Kalau mau update kata kunci jurusan**: edit dictionary `deskripsi_baru` di notebook → jalankan ulang training & evaluasi → `joblib.dump(...)` ulang → copy `model_relevansi.pkl` yang baru ke folder `ml-api/` → restart `python3 app.py`
- Endpoint: `POST http://localhost:5001/predict` dengan body `{"jurusan": "...", "bidangKerja": "..."}`

## Troubleshooting

- **"Gagal konek ke MySQL"** → pastikan service MySQL sudah jalan, dan kredensial di `.env` sudah benar
- **Relevansi tidak muncul otomatis** → pastikan `ml-api` (`python3 app.py`) sedang berjalan; kalau mati, survey tetap bisa disimpan tapi kolom relevansi akan kosong
- **Dashboard/Data Survey kosong** → isi dulu form survey minimal 1-2 kali dari halaman utama
- **CORS error di browser** → pastikan backend Node.js sudah jalan duluan di port 5000
- **"does not provide an export named 'default'"** → biasanya ada file yang isinya salah taruh (misal isi model ketimpa ke file route, atau sebaliknya) — cek ulang isi file yang disebutkan di pesan error
