# QA Audit Report — Backend Sistem Tracer Study Alumni

- **Tanggal audit:** 2026-10-19
- **Mode:** read-only (analisis kode statis). Tidak ada endpoint yang dijalankan, tidak ada file lain yang diubah.
- **Yang dibaca:** semua file di `server/` (kecuali `node_modules`), `ml-api/app.py`, `ml-api/pengecualian.json`, isi `model_relevansi.pkl` (hanya nilai threshold, dibaca lewat `joblib.load`), `Project_PKM.sql`, `README.md`, `PRD-Tracer-Study.md`. Sebagian file `client/src` dibaca hanya untuk memverifikasi pemakaian endpoint.
- **Konvensi bukti:** `file:baris`. Path relatif terhadap root repo.
- **Label "PERLU VERIFIKASI MANUAL":** perilaku runtime yang tidak bisa dipastikan dari pembacaan kode.

> [!IMPORTANT]
> **Koreksi atas pekerjaan saya sebelumnya.** README.md yang saya tulis ulang di sesi ini memuat threshold ML yang **salah** (`>= 0.40` / `0.20–0.39` / `< 0.20`). Angka itu tidak saya verifikasi dan tidak ada di kode atau model. Detailnya ada di temuan **F-07** dan bagian 4. README belum saya ubah karena mode ini read-only.

---

## 1. Ringkasan Eksekutif

1. Backend berjalan secara fungsional untuk alur utama: survei publik, login admin, CRUD alumni, laporan, ekspor PDF/Excel, dan prediksi ML.
2. **Dari 9 task "selesai": 2 ADA & SESUAI, 7 ADA TAPI KURANG.** Tidak ada yang sepenuhnya TIDAK ADA, tetapi *detail alumni* (task 7) dan *pagination/filter status* (task 3) tidak ada.
3. **Endpoint tulis publik (`POST /api/survey`, `POST /api/alumni`) tanpa validasi sama sekali.** Akibatnya data sampah, error SQL mentah ke client, dan alumni baru bisa dibuat siapa saja.
4. **Survei ganda tidak dicegah.** `survey.alumni_id` hanya `KEY`, bukan `UNIQUE`, dan controller tidak mengecek. Statistik dan laporan bisa membengkak.
5. Relevansi dihitung dari `jurusan` kiriman client, bukan dari data alumni di database. Label ML bisa dimanipulasi.
6. Threshold ML aktual (`model_relevansi.pkl`) adalah **bekerja 0.01/0.05** dan **kuliah 0.02/0.04**. PRD, README, dan model memberi tiga angka berbeda.
7. Fail-safe ML **berfungsi** dan ada timeout 5 detik. Namun "Hitung Ulang" berjalan berurutan, jadi bisa sangat lambat bila ML mati.
8. Semua route admin yang saya periksa dilindungi `protect`. Tidak ada route admin yang bolong. Query memakai parameter, sehingga tidak ada SQL injection klasik, kecuali jalur *Import SQL* yang mengeksekusi SQL mentah.
9. Keamanan: `admin/admin123` masih default di seed, tidak ada rate limit login, CORS `*`, tidak ada error handler global, dan `Project_PKM.sql` ter-ignore git padahal dokumentasi menyuruh meng-import-nya.
10. Total: **0 Critical, 8 High, 12 Medium, 8 Low**.

---

## 2. Tahap 1 — Inventaris Route

Prefix mount: `server/server.js:23-25` → `/api/auth`, `/api/alumni`, `/api/survey`. Juga `GET /` (health, `server.js:27`) dan `/uploads` (static publik, `server.js:21`).

| Method | Path | Akses | Controller | Middleware | Tabel / sumber lain |
|---|---|---|---|---|---|
| POST | `/api/auth/login` | publik | `loginAdmin` | – | admin (R) |
| PUT, POST | `/api/auth/ubah-password` | protected | `ubahPasswordAdmin` | `protect` | admin (R/W) |
| GET | `/api/auth/profil` | protected | `getProfilAdmin` | `protect` | admin (R) |
| PUT | `/api/auth/profil` | protected | `updateProfilAdmin` | `protect`, `handleUploadFoto` | admin (R/W) + file `uploads/` |
| POST | `/api/auth/profil/foto` | protected | `uploadFotoAdmin` | `protect`, `handleUploadFoto` | admin (W) + file |
| DELETE | `/api/auth/profil/foto` | protected | `hapusFotoAdmin` | `protect` | admin (W) + file |
| GET | `/api/alumni/jurusan-list` | publik | `getJurusanList` | – | alumni (R) |
| GET | `/api/alumni/tahun-list` | publik | `getTahunList` | – | alumni (R) |
| GET | `/api/alumni/tahun-by-jurusan` | publik | `getTahunByJurusan` | – | alumni (R) |
| GET | `/api/alumni/search` | publik | `searchAlumni` | – | alumni (R) |
| POST | `/api/alumni/` | publik | `findOrCreateAlumni` | – | alumni (R/W) |
| GET | `/api/alumni/` | protected | `getAllAlumni` | `protect` | alumni (R) |
| GET | `/api/alumni/export-excel` | protected | `exportAlumniExcel` | `protect` | alumni + survey (R) |
| POST | `/api/alumni/tambah` | protected | `tambahAlumni` | `protect` | alumni (R/W) |
| PUT | `/api/alumni/:id` | protected | `editAlumni` | `protect` | alumni (R/W) |
| DELETE | `/api/alumni/:id` | protected | `hapusAlumni` | `protect` | survey (W), alumni (W) |
| POST | `/api/alumni/import-excel` | protected | `importAlumniExcel` | `protect`, `upload.single` (memori) | alumni (R/W) |
| POST | `/api/alumni/import-sql` | protected | `importAlumniSQL` | `protect`, `upload.single` (memori) | alumni/survey (INSERT mentah) |
| POST | `/api/survey/prediksi-relevansi` | publik | `prediksiRelevansi` | `rateLimitPrediksi` | – (memanggil ML) |
| POST | `/api/survey/hitung-ulang-relevansi` | protected | `hitungUlangRelevansi` | `protect` | survey, alumni (R/W) + ML |
| POST | `/api/survey/` | publik | `createSurvey` | – | alumni (R/W), survey (W) + ML |
| GET | `/api/survey/` | protected | `getAllSurvey` | `protect` | survey, alumni (R) |
| GET | `/api/survey/stats` | protected | `getStats` | `protect` | survey, alumni (R) |
| GET | `/api/survey/tahun-list` | protected | `getTahunList` | `protect` | alumni (R) |
| GET | `/api/survey/laporan/:tahun` | protected | `getLaporan` | `protect` | alumni, survey (R) |
| GET | `/api/survey/export/:tahun` | protected | `exportSurveyPdf` | `protect` | survey, alumni (R) |
| GET | `/api/survey/export-excel/:tahun` | protected | `exportSurveyExcel` | `protect` | survey, alumni (R) |

Bukti: `routes/auth.js:15-21`, `routes/alumni.js:22-49`, `routes/survey.js:43-51`. Query ada di `models/Admin.js`, `models/Alumni.js`, `models/Survey.js`.

**ML API (Flask):** `GET /health` (`app.py:161`), `POST /predict` (`app.py:173`), `POST /predict-batch` (`app.py:203`). Tidak ada autentikasi.

---

## 3. Tahap 2 — Status 9 Task Backend

| # | Task | Status | Bukti | Kekurangan |
|---|---|---|---|---|
| 1 | API ambil profil | **ADA TAPI KURANG** | `GET /api/auth/profil` → `authController.js:111-123`; query `Admin.js:29-35` mengambil `id, username, nama, email, telepon, role, foto` | **Tidak ada `status` dan `terakhir login`.** Tidak ada kolom `status`/`last_login` di `Project_PKM.sql:30-34` maupun `migrate.js:24-28`; grep `last_login` di `server/` kosong. `foto` berupa path relatif (`/uploads/..`, `authController.js:148`), bukan URL penuh. |
| 2 | API jawaban terbaru | **ADA TAPI KURANG** | Tidak ada endpoint khusus. `GET /api/survey` (`routes/survey.js:46`) → `Survey.js:33-41`: `SELECT s.*, a.nama, a.nis, a.jurusan, a.tahun_lulus … ORDER BY s.created_at DESC` | Mengembalikan **semua** baris, tanpa `LIMIT`. Field yang diminta ada (nama, jurusan, status, `nama_perusahaan`/`nama_kampus`, `relevansi_jurusan`), tetapi "terbaru" harus dipotong di client. |
| 3 | API daftar alumni (cari, filter jurusan/status/tahun) | **ADA TAPI KURANG** | `GET /api/alumni` → `alumniController.js:251-258` → `Alumni.js:25-30` (`SELECT * FROM alumni`). Versi berfilter `getAlumniWithSurvey` (`Alumni.js:62-95`) hanya dipakai oleh ekspor Excel (`alumniController.js:306`). | **Tidak ada pagination.** Endpoint list **tidak menerima filter apa pun**. Filter **status tidak ada** di backend (hanya `jurusan`, `tahunLulus`, `search`). Endpoint list tidak menyertakan status survei. Cara frontend memfilter: PERLU VERIFIKASI MANUAL (kemungkinan client-side). |
| 4 | API simpan jawaban survey (validasi + cegah ganda) | **ADA TAPI KURANG** | `createSurvey` → `surveyController.js:99-157` | **Validasi tidak ada** (tidak ada cek wajib/format/panjang/enum). **Anti-ganda tidak ada** (lihat F-02). Fail-safe ML ada (baris 124-139). |
| 5 | API dashboard | **ADA TAPI KURANG** | `GET /api/survey/stats` → `surveyController.js:376-387` mengembalikan `{ totalAlumni, totalSurvey, statusCount, relevansiCount }` | Field `relevan`, `tidakRelevan`, `sudahBekerjaKuliah` **tidak dihitung di backend**. Dihitung di frontend (`client/src/pages/admin/Dashboard.jsx:268-290`). Bentuk respons tidak sama dengan spesifikasi task. |
| 6 | API laporan per periode | **ADA & SESUAI** | `getLaporanByTahun` → `Survey.js:144-193`; respons `{ tahun, totalAlumni, sudahMengisi, belumMengisi, bekerjaKuliahPersen, status:{bekerja,kuliah,wirausaha,belumBekerja} }` (baris 180-192) | Nama field persis sesuai. Catatan semantik di F-11. "Periode" hanya per tahun lulus, tanpa rentang tanggal. |
| 7 | API detail, ubah, hapus alumni (validasi) | **ADA TAPI KURANG** | Ubah `PUT /:id` → `alumniController.js:86-117`. Hapus `DELETE /:id` → `120-131`. | **Endpoint detail (`GET /api/alumni/:id`) TIDAK ADA** (tidak ada di `routes/alumni.js`). Validasi hanya field wajib + NIS unik (baris 91-102). Tidak ada validasi tipe, panjang, atau format. `Number(id)` / `Number(tahunLulus)` tidak dicek `NaN`. |
| 8 | API edit profil | **ADA TAPI KURANG** | `PUT /api/auth/profil` → `authController.js:126-183` | Hanya `username` yang divalidasi (baris 133). Tidak ada validasi format email/telepon atau panjang. `role` bisa diubah bebas lewat body (baris 131, 172). |
| 9 | API daftar tahun & daftar pilihan form (jurusan, NIS/NISN) | **ADA & SESUAI** | Tahun: `GET /api/alumni/tahun-list` (`alumni.js:23`), `/tahun-by-jurusan` (`:24`), `GET /api/survey/tahun-list` (`survey.js:48`). Jurusan: `/jurusan-list` (`:22`). Nama + NIS: `/search` (`:25`, `Alumni.js:54-60`). | Istilah di kode adalah **NIS**, bukan NISN (lihat 3c). Catatan keamanan publik di F-04. |

---

## 4. Tahap 3 — Jawaban Kejanggalan Spesifik

**a. Threshold relevansi.** Nilai aktual ada di `model_relevansi.pkl` (dibaca lewat `joblib.load`):
- tipe `bekerja`: `batas_bawah = 0.01`, `batas_atas = 0.05`
- tipe `kuliah`: `batas_bawah = 0.02`, `batas_atas = 0.04`

`app.py:143-148` memakai: `skor < bawah` → Tidak Sesuai; `skor < atas` → Cukup Sesuai; selain itu Sangat Sesuai. Nilai fallback di kode adalah 0.05 / 0.15 (`app.py:42-43`, `54-55`) dan hanya terpakai bila pkl tidak memuat batas. **Jawaban:** README (0.40 / 0.20) **tidak cocok dengan kode maupun model**. PRD (`PRD-Tracer-Study.md:150`, 0.05 / 0.15) hanya cocok dengan nilai fallback, **tidak** dengan pkl. Tidak ada satu pun dokumen yang cocok dengan perilaku sebenarnya.

**b. Relevansi hanya "Bekerja" atau juga "Kuliah"?** Keduanya. `surveyController.js:31-36` memanggil ML untuk `Bekerja` (teks = `bidangKerja`) dan `Kuliah` (teks = `jurusanKampus`). `getSurveysTanpaRelevansi` juga memilih keduanya (`Survey.js:139`). **README benar, PRD F-15 (`PRD:93`) sudah usang.**

**c. NISN atau NIS?** Database dan model konsisten **NIS** (`alumni.nis`, `Alumni.js:4`). Istilah NISN muncul di: import Excel menerima header `nisn` (`alumniController.js:134, 163, 182`) dan di frontend (variabel `nisn` di `DataAlumni.jsx:68`, `Dashboard.jsx:189`, `TambahEditAlumniModal.jsx:38`; label "NIS / NISN" di `:141`). Backend konsisten NIS, frontend campur.

**d. Kolom admin.** `Project_PKM.sql:30-34`: hanya `id, username, password`. `migrate.js:24-28` menambah `nama, email, telepon, role, foto`. **Tidak ada `status` maupun `last_login`** di mana pun. API profil hanya mengembalikan kolom yang ada (`Admin.js:31`). Dua field itu **tidak diisi dan tidak ada**. Pada database hasil import `.sql` tanpa `npm run migrate`, `GET /profil` gagal (kolom tidak ada).

**e. `survey.alumni_id` UNIQUE?** **Tidak.** `Project_PKM.sql:223-225` hanya `ADD KEY alumni_id` (non-unik). `createSurvey` (`surveyController.js:118-151`) tidak mengecek survei yang sudah ada, jadi setiap submit menghasilkan **201 dan baris baru**. Race condition: baca-lalu-tulis `findAlumniByNis` → `createAlumni` (baris 118-121) tidak atomik. Yang kalah akan kena `ER_DUP_ENTRY` dari `UNIQUE nis` (`SQL:216-218`) dan masuk ke `catch` → **HTTP 500 dengan `error.message` SQL mentah** (baris 154-156), bukan 409. `upsertSurveyByAlumniId` ada di `Survey.js:89-119` tetapi **tidak dipakai** (lihat F-17).

**f. Alumni dihapus, survey?** Aplikasi menghapus manual: `DELETE FROM survey WHERE alumni_id=?` lalu `DELETE FROM alumni` (`Alumni.js:105-110`). FK `survey_ibfk_1` **tanpa `ON DELETE`** (`SQL:256-257`), jadi bila urutan di kode gagal, MySQL menolak (tidak ada orphan). Dua query itu **bukan satu transaksi**. Kegagalan di antaranya menyisakan survei terhapus, alumni utuh. Komentar di `Alumni.js:106` menyebut `ON DELETE CASCADE` padahal tidak ada.

**g. Mapping dashboard.**
- Backend **tidak** memetakan relevan/tidak relevan. `getRelevansiCount` (`Survey.js:69-77`) hanya `GROUP BY relevansi_jurusan`.
- Di frontend, **"Cukup Sesuai" masuk relevan** (`Dashboard.jsx:182-183`, `277-280`). "Tidak Sesuai" masuk tidak relevan.
- **Baris `NULL`:** backend mengecualikannya (`Survey.js:73`). Di frontend, persentase memakai penyebut `relevan + tidakRelevan` sehingga NULL **tidak** dihitung (`Dashboard.jsx:283-290`). Baris NULL tidak ditampilkan terpisah di endpoint stats.
- **`bekerjaKuliahPersen`:** `(bekerja + kuliah) / totalAlumni` (`Survey.js:175-178`), jadi penyebutnya **seluruh alumni** pada tahun itu, bukan hanya yang sudah mengisi. `belumBekerja` = `belumBekerjaSurvey + belumMengisi` (`Survey.js:174`).

**h. Fail-safe.** **Ya.** `hitungRelevansiModel` menangkap semua error dan mengembalikan `{relevansi:null, tersedia:false}` (`surveyController.js:77-80`). `createSurvey` membungkusnya lagi (`:125-139`) dan tetap `INSERT` dengan relevansi `NULL`. **Timeout ada: 5000 ms** via `AbortController` (`:51-52`). Respons non-2xx dari ML juga menghasilkan `null` (`:67-69`). Perilaku runtime sebenarnya (ML dimatikan): PERLU VERIFIKASI MANUAL.

**i. Endpoint tambahan.** Semuanya **ada**: Hitung Ulang (`survey.js:44`), ekspor PDF/Excel survei (`:50-51`), ekspor Excel alumni (`alumni.js:30`), import Excel/SQL (`alumni.js:38-49`), login (`auth.js:15`), ganti password (`auth.js:16-17`). **Tidak satu pun tercakup di 9 task** (kecuali laporan di task 6). Artinya endpoint-endpoint ini berada di luar cakupan verifikasi tim. Beberapa di antaranya berisiko tinggi (import SQL, hitung ulang).

**j. Cascading wizard.** **Ada.** Jurusan `GET /alumni/jurusan-list`, tahun `GET /alumni/tahun-by-jurusan?jurusan=`, nama + NIS `GET /alumni/search?jurusan=&tahunLulus=` (mengembalikan `id, nis, nama`, `Alumni.js:54-60`). Semuanya publik.

---

## 5. Daftar Temuan (urut severity)

### High

| ID | Severity | Lokasi | Deskripsi | Dampak | Rekomendasi |
|---|---|---|---|---|---|
| F-01 | High | `surveyController.js:99-157`; `alumniController.js:41-54` | `POST /api/survey` dan `POST /api/alumni` publik **tanpa validasi** (wajib, tipe, panjang, enum `statusSaatIni`). Alumni baru dibuat langsung dari body (`:119-121`, `:46-48`). | Siapa pun bisa menyisipkan alumni palsu dan survei sampah. Input kosong → error SQL mentah ke client (`:155`). | Validasi skema (mis. zod/joi), whitelist `statusSaatIni`, batasi panjang. Untuk survei publik, **jangan buat alumni baru**. Hanya terima NIS yang sudah ada di tabel `alumni`. |
| F-02 | High | `Project_PKM.sql:223-225`; `surveyController.js:118-151` | `survey.alumni_id` bukan UNIQUE dan tidak ada cek duplikat. | Satu alumni bisa mengirim banyak survei (klik ganda, refresh). Statistik, persentase laporan, dan ekspor menggelembung. `bekerjaKuliahPersen` bisa >100%. | Tambah `UNIQUE (alumni_id)`, atau cek lalu kembalikan **409**. Pakai `upsertSurveyByAlumniId` bila update diizinkan. |
| F-03 | High | `surveyController.js:118-131` | Relevansi dihitung dari `jurusan` di **body**, bukan `alumni.jurusan` dari DB. Komentar baris 123 ("jangan percaya input client") tidak dipenuhi. | Label relevansi dapat dimanipulasi dengan mengirim jurusan lain. Data statistik tidak bisa dipercaya. | Ambil `alumni.jurusan` dari database setelah `findAlumniByNis`, abaikan body. |
| F-04 | High | `routes/alumni.js:22-25`; `Alumni.js:54-60` | Daftar nama + NIS seluruh alumni per jurusan/tahun bisa diambil **tanpa autentikasi**. | Siapa pun bisa meng-enumerasi seluruh data alumni (PII). Perlu konfirmasi apakah ini memang disengaja untuk dropdown (PRD F-01). | Bila harus publik: kembalikan nama saja dan validasi NIS di server saat submit, tambah rate limit. **Perlu keputusan produk.** |
| F-05 | High | `seed.js:17-23`; `Project_PKM.sql:41`; README | Akun default `admin` / `admin123` (hash bcrypt di dump SQL). Tidak ada pemaksaan ganti password. `JWT_SECRET` di `server/.env:8` berupa string mudah ditebak. | Akses admin penuh jika di-deploy apa adanya. | Generate password acak saat seed, wajib ganti saat login pertama. `JWT_SECRET` acak ≥32 byte dan hentikan server jika kosong. Jangan taruh kredensial di README produksi. |
| F-06 | High | `routes/auth.js:15`; `routes/survey.js:18-41` | Rate limiter hanya dipasang di `/prediksi-relevansi`. **`/login`, `POST /survey`, `POST /alumni` tidak dibatasi.** | Brute-force password admin tak terbatas. Spam survei. | Pasang rate limit (mis. `express-rate-limit`) pada login dan endpoint tulis publik, plus lockout bertahap. |
| F-07 | High | `ml-api/app.py:42-43, 143-148`; `model_relevansi.pkl`; `PRD:150`; `README.md` | Tiga sumber, tiga threshold: pkl bekerja **0.01/0.05**, kuliah **0.02/0.04**; PRD 0.05/0.15; README (hasil tulisan saya) 0.40/0.20. Band `kuliah` hanya 0.02 lebar. | Dokumentasi dan laporan akademik (PKM) menyebut aturan yang tidak dipakai sistem. Hasil sulit dipertanggungjawabkan. Klaim akurasi 80,70% (`PRD:152`) tidak bisa diverifikasi dari repo. | Satukan sumber kebenaran, sebaiknya dari pkl atau satu file konfigurasi. Perbarui PRD dan README. Sertakan skrip evaluasi. |
| F-08 | High | `.gitignore:7-8`; `README.md`; `PRD` | `Project_PKM.sql` **dan `.gitignore` itu sendiri** ada di `.gitignore`. Di repo hanya `PRD` dan `README` yang ter-track (`git ls-files`). Dokumen menyuruh meng-import `Project_PKM.sql`. | Clone baru tidak punya skema database. Anggota tim sulit menyamakan skema (padahal PRD butir risiko `:176` menyebut hal ini). Kolom admin juga hanya dibuat oleh `migrate.js` (baru bisa jalan setelah tabel ada). | Hapus `Project_PKM.sql` dari ignore, pisahkan dump data dari skema, tambah `schema.sql` lengkap (termasuk kolom admin dan UNIQUE). |

### Medium

| ID | Severity | Lokasi | Deskripsi | Dampak | Rekomendasi |
|---|---|---|---|---|---|
| F-09 | Medium | `alumniController.js:199-236` | Import SQL: whitelist regex hanya mengecek awal statement. `INSERT INTO alumni … SELECT … FROM admin` lolos (`DANGEROUS` tidak memuat `SELECT`). Kata "update/delete/create" di dalam nilai data diblokir (false positive). Pemisah statement `;\s*\n` rapuh. | Admin (atau token yang dicuri) bisa menyalin hash password ke kolom alumni lalu membacanya dari `GET /alumni`. Import data sah bisa gagal acak. | Hapus fitur import SQL, atau parse statement dengan benar dan hanya terima `INSERT … VALUES`. Utamakan import Excel. |
| F-10 | Medium | `server.js` (tidak ada error middleware); `routes/alumni.js:38-49` + `alumniController.js:23-32`; `NODE_ENV` tidak dirujuk di `server/` | Tidak ada error handler global. Error multer pada import (tipe/ukuran) tidak ditangkap seperti di `upload.js:50-63`. Hampir semua `catch` mengirim `error.message` (mis. `surveyController.js:155`, `authController.js:42`). | Error SQL, path, atau stack trace bisa bocor. Status 500 padahal seharusnya 400 untuk file salah. Stack trace Express muncul bila `NODE_ENV` bukan production. | Tambah error middleware, bungkus multer seperti `handleUploadFoto`, kirim pesan generik ke client dan log detail di server. |
| F-11 | Medium | `Survey.js:174-178` | `belumBekerja` = survei "Belum Bekerja" **+ semua yang belum mengisi**. `bekerjaKuliahPersen` memakai `totalAlumni` sebagai penyebut. `tahun` tidak divalidasi. | Angka "Belum Bekerja" bercampur dengan "belum mengisi" dan tampil lebih besar dari kenyataan. Perlu keputusan apakah ini definisi yang dimaksud. | **Perlu keputusan produk.** Pisahkan field `belumMengisi` dari `belumBekerja`, validasi `tahun` (4 digit). |
| F-12 | Medium | `Alumni.js:25-30, 62-95`; `Survey.js:33-41`; `alumniController.js:251-258` | Semua query list tanpa `LIMIT`/pagination. | Lambat dan boros memori seiring data bertambah. Saat ini ±100 alumni, jadi belum terasa. | Tambah `page`/`limit`, total, dan filter di server. |
| F-13 | Medium | `Alumni.js:62-95`; `routes/alumni.js:29` | Filter status alumni tidak ada. `GET /alumni` tidak menerima filter apa pun. | Task 3 tidak terpenuhi di sisi backend. Bergantung pada filter client-side. | Sambungkan `getAlumniWithSurvey` ke `GET /alumni`, tambah parameter `status`. |
| F-14 | Medium | `routes/alumni.js` (tidak ada `GET /:id`) | Endpoint detail alumni tidak ada. | Task 7 sebagian tidak terpenuhi. | Tambah `GET /api/alumni/:id` (protected). |
| F-15 | Medium | `authController.js:131, 167-174`; `Admin.js:37-51` | `role` bisa diubah sendiri oleh pemilik akun lewat body. Email/telepon/nama tanpa validasi format dan panjang. | Eskalasi label peran. Jika kelak ada role-based access, ini menjadi celah. | Whitelist/abaikan `role` dari body, validasi email dan telepon. |
| F-16 | Medium | `surveyController.js:160-193` | `hitungUlangRelevansi` memanggil ML **satu per satu** (`for … await`). Tiap panggilan bisa menunggu sampai 5 detik. | Jika ML mati dan ada N baris, total waktu hingga 5×N detik. Request admin kena timeout, sementara proses terus berjalan di server. | Pakai `POST /predict-batch` (sudah ada di `app.py:203`), atau berhenti setelah beberapa kegagalan beruntun. |
| F-17 | Medium | `Alumni.js:117-138`; `alumniController.js:161-179` | Import Excel: N+1 (2 query per baris). Baris dengan `jurusan`/`tahunLulus` kosong tetap dimasukkan (`:178`). Tidak ada `try/catch` per baris dan tidak ada transaksi. | Data tidak valid ditolak MySQL di tengah jalan. Request gagal 500 dengan **sebagian data sudah masuk**. Komentar menyebut `INSERT IGNORE` padahal tidak dipakai. | Validasi per baris, kumpulkan error, pakai transaksi dan bulk insert. |
| F-18 | Medium | `Alumni.js:105-110`; `Project_PKM.sql:256-257` | Hapus alumni = dua query tanpa transaksi. Komentar menyebut `ON DELETE CASCADE` yang tidak ada. | Kegagalan di antara dua query menyisakan data tidak konsisten. | Bungkus dalam transaksi, atau tambahkan `ON DELETE CASCADE` di skema. |
| F-19 | Medium | `server.js:19`; `app.py:153-158, 230` | CORS `*` di Express dan Flask. ML API tanpa autentikasi dan berjalan dengan `debug=True`. | Siapa pun dapat memanggil API dari origin mana pun. Mode debug Werkzeug berbahaya bila host kelak dibuka ke jaringan. Saat ini default hanya `127.0.0.1` (PERLU VERIFIKASI MANUAL di environment deploy). | Batasi `origin` ke domain frontend, matikan `debug` di produksi, jalankan ML di jaringan internal. |
| F-20 | Medium | `Dashboard.jsx:182-183, 268-290`; `surveyController.js:376-387` | Logika bisnis dashboard (relevan = Sangat + Cukup, penyebut tanpa NULL) hanya ada di frontend. | Angka dashboard, laporan, dan ekspor bisa berbeda di tempat lain. Definisi "Cukup Sesuai" tidak tertulis di PRD. | **Perlu keputusan produk.** Pindahkan perhitungan ke backend dan dokumentasikan definisinya. |

### Low

| ID | Severity | Lokasi | Deskripsi | Dampak | Rekomendasi |
|---|---|---|---|---|---|
| F-21 | Low | `routes/survey.js:18-32` | `Map` rate limiter tidak pernah dibersihkan, hanya per proses, dan memakai `req.ip` (di balik proxy tanpa `trust proxy` semua klien terlihat satu IP). | Memori naik pelan-pelan. Pembatasan tidak akurat di balik proxy. | Pakai library, atau bersihkan entri kedaluwarsa. |
| F-22 | Low | `upload.js:29-39`; `server.js:21` | Validasi foto hanya ekstensi + `mimetype` kiriman client, tanpa cek magic bytes. File tampil publik di `/uploads`. Foto lama dihapus **sebelum** UPDATE DB berhasil (`authController.js:146-155`). | File yang menyamar sebagai gambar bisa tersimpan. Kegagalan UPDATE menyisakan foto hilang. | Cek magic bytes, hapus foto lama setelah DB sukses. |
| F-23 | Low | `app.py:125-130`; `surveyController.js:71-76` | Jurusan di luar model mengembalikan label `"Tidak Diketahui"` dengan `tersedia: true`. Backend meneruskannya ke client lewat `/prediksi-relevansi`. Saat disimpan jadi `NULL` (`:132-135`). | UI publik bisa menampilkan label di luar enum. | Kembalikan `tersedia:false` untuk kasus ini. |
| F-24 | Low | `authController.js:26, 31, 85`; kode lain | Status code tidak konsisten: login gagal memakai **400** (bukan 401). Duplikat NIS memakai 409 di `tambah/edit` tetapi 500 di `createSurvey`/`findOrCreate`. Bentuk respons campur (array mentah vs objek `{message, …}`). | Menyulitkan client dan pengujian otomatis. | Standarkan format `{ data, message }` dan status code. |
| F-25 | Low | `authController.js:29` (login) | `password` bukan string (mis. tidak dikirim) pada `bcrypt.compare` kemungkinan melempar error → 500 dengan pesan internal. **PERLU VERIFIKASI MANUAL.** | Pesan error internal bocor. | Validasi `username`/`password` bertipe string sebelum diproses. |
| F-26 | Low | `Survey.js:89-123`; `alumniController.js:18` | `upsertSurveyByAlumniId` dan `deleteSurveyByAlumniId` tidak dipakai. Import `upsertSurveyByAlumniId` di `alumniController.js:18` tidak terpakai. Duplikasi `PUT` dan `POST` `ubah-password` (`auth.js:16-17`) serta `tahun-list` ganda. | Kode mati dan membingungkan. | Hapus atau pakai (lihat F-02). |
| F-27 | Low | `Project_PKM.sql:209-225` | Hanya indeks PK, `nis`, `username`, `alumni_id`. Tidak ada indeks untuk `alumni.tahun_lulus`, `alumni.jurusan`, `survey.status_saat_ini`, `survey.relevansi_jurusan`. Pencarian `LIKE '%…%'` (`Alumni.js:87`) tidak memakai indeks. | Belum terasa pada ±100 baris. | Tambah indeks bila data tumbuh. |
| F-28 | Low | `ml-api/requirements.txt`; `config/db.js:19`; `server.js:34`; `seed.js:20-23` | Versi pustaka Python tidak di-pin (`flask`, `pandas`, `scikit-learn`, `joblib`) padahal pkl bergantung pada versi scikit-learn. `console.log` sisa (`db.js`, `server.js`, `seed.js`). Tidak ada TODO/FIXME (grep kosong). File nyasa `package.json 13-02-09-477.json` dan `ml-api/package-lock.json 20-29-00-654.json`. | Model bisa gagal dimuat atau berubah perilaku di mesin lain. | Pin versi, buang file nyasa. |

---

## 6. Inkonsistensi Dokumentasi vs Kode

| # | Dokumen | Isi dokumen | Kenyataan di kode | Bukti |
|---|---|---|---|---|
| 1 | README (tulisan saya) | Threshold ≥0.40 / 0.20–0.39 / <0.20 | **Salah.** Aktual 0.01/0.05 (bekerja), 0.02/0.04 (kuliah) | `app.py:143-148`, pkl |
| 2 | PRD `:150` | Threshold <0.05 / 0.05–0.15 / ≥0.15 | Hanya sama dengan fallback, bukan nilai pkl | `app.py:42-43` |
| 3 | PRD F-15 `:93` | Relevansi hanya untuk "Bekerja" | Juga "Kuliah" | `surveyController.js:34-36` |
| 4 | PRD `:44` | Prediksi untuk kuliah = out of scope/opsional | Sudah diimplementasikan dan pkl memuat model `kuliah` | `app.py:35` |
| 5 | PRD `:141` | Entitas Admin: `id, username, password` | Ada `nama, email, telepon, role, foto` (via migrate) | `migrate.js:24-28` |
| 6 | PRD `:183` | Ubah password / manajemen akun admin = pengembangan lanjutan | Sudah ada (ubah password, profil, foto) | `routes/auth.js:16-21` |
| 7 | README (tulisan saya) | Stack ML: "Flask, Flask-CORS, Scikit-learn, Pandas, Joblib" | `flask-cors` **tidak ada** di `requirements.txt`. CORS manual di `app.py:153-158` | `requirements.txt` |
| 8 | README (tulisan saya) | "Python 3.9+", "Node.js v18+" | Tidak tercantum di repo. Node ≥18 memang diperlukan (`fetch` global, `surveyController.js:54`). Python 3.9+ tidak diverifikasi | – |
| 9 | README + PRD | Import `Project_PKM.sql` | File itu ter-ignore git dan tidak ada di repo | `.gitignore:7` |
| 10 | README (versi lama) | Retrain lewat notebook `ProjectPKM.ipynb` | Notebook tidak ada di `ml-api/`. Panduan retrain **hilang saat saya menulis ulang README** | listing `ml-api/` |
| 11 | Komentar kode | "Survey terhapus otomatis jika ada ON DELETE CASCADE" | Tidak ada CASCADE | `Alumni.js:106`, `SQL:256-257` |
| 12 | Komentar kode | "skip jika NIS sudah ada (INSERT IGNORE)" | Tidak memakai `INSERT IGNORE` | `Alumni.js:117-138` |
| 13 | Task 1 | Profil memuat status dan terakhir login | Kolom tidak ada | `Admin.js:31` |
| 14 | Task 5 | Dashboard memuat `relevan`/`tidakRelevan`/`sudahBekerjaKuliah` | Dihitung di frontend, bukan backend | `Dashboard.jsx:268-290` |
| 15 | Label | NISN | Kode dan DB memakai NIS | lihat 3c |

---

## 7. Checklist Test Manual

Asumsi: backend `http://localhost:5000`, ML `http://localhost:5001`. Dapatkan token dulu, lalu ekspor `TOKEN=...`.

| # | Uji | Perintah / payload | Hasil yang diharapkan (menurut kode) | Jika berbeda |
|---|---|---|---|---|
| 1 | Login valid | `curl -X POST :5000/api/auth/login -H 'Content-Type: application/json' -d '{"username":"admin","password":"admin123"}'` | 200 `{token, username}` | – |
| 2 | Login body kosong (F-25) | sama, `-d '{}'` | Seharusnya 400. **Catat apakah 400 atau 500 + pesan internal.** | Bug F-25 |
| 3 | Route admin tanpa token | `curl :5000/api/survey` | 401 `Tidak ada token…` | Route bolong |
| 4 | Route admin token palsu | `-H 'Authorization: Bearer x'` | 401 `Token tidak valid…` | – |
| 5 | Profil | `GET /api/auth/profil` + token | 200: `id, username, nama, email, telepon, role, foto`. **Tidak ada `status`/`terakhir login`.** Jika error `Unknown column`, jalankan `npm run migrate`. | – |
| 6 | Edit profil: `role` bebas (F-15) | `PUT /api/auth/profil` `{"username":"admin","role":"Superuser"}` | Saat ini **diterima**. | Setelah diperbaiki: diabaikan/ditolak |
| 7 | Survei valid | `POST /api/survey` `{"nis":"2024642717","nama":"Oki Puspita Pratama","jurusan":"Akuntansi","tahunLulus":2023,"statusSaatIni":"Bekerja","namaPerusahaan":"PT X","bidangKerja":"Staf Akuntansi","lamaTungguKerja":"1 bulan"}` | 201 `{id, relevansiJurusan}` | – |
| 8 | **Survei ganda (F-02)** | Kirim #7 dua kali | Saat ini **dua-duanya 201**. Cek `SELECT COUNT(*) FROM survey WHERE alumni_id=…` = 2. | Setelah diperbaiki: kedua 409 |
| 9 | **Survei kosong (F-01)** | `POST /api/survey` `-d '{}'` | Saat ini **500 + pesan SQL mentah**. | Setelah diperbaiki: 400 |
| 10 | Status tak valid | `"statusSaatIni":"Hacker"` | Saat ini 500 (enum MySQL ditolak). | Seharusnya 400 |
| 11 | **Manipulasi jurusan (F-03)** | `POST /api/survey/prediksi-relevansi` `{"jurusan":"Akuntansi","statusSaatIni":"Bekerja","bidangKerja":"Web developer"}` lalu ulangi dengan `"jurusan":"Rekayasa Perangkat Lunak"` | Label **berbeda** → membuktikan jurusan dari client dipakai. | – |
| 12 | **Fail-safe ML (Tahap 3h)** | Matikan `ml-api`, ulangi #7 dengan NIS lain | 201, `relevansiJurusan: null`, data tersimpan di DB. Catat durasi (≤ ~5 dtik). | Jika error atau lama: bug |
| 13 | Hitung ulang saat ML mati (F-16) | `POST /api/survey/hitung-ulang-relevansi` + token | Respons `{diproses, berhasil:0, gagal:N}`. **Ukur waktu**; ekspektasi lambat bila banyak NULL. | – |
| 14 | Rate limit prediksi | 41 kali `POST /prediksi-relevansi` < 1 menit | Ke-41 → 429 | – |
| 15 | **Tidak ada rate limit login (F-06)** | 50× `POST /login` password salah | Saat ini **tidak ada 429**. | Setelah diperbaiki: 429 |
| 16 | Stats vs hitung manual | `GET /api/survey/stats` lalu `SELECT status_saat_ini,COUNT(*) FROM survey GROUP BY 1` | Angka sama. Bentuk: `totalAlumni,totalSurvey,statusCount,relevansiCount`. | – |
| 17 | Laporan | `GET /api/survey/laporan/2023` | Field sesuai task 6. Cocokkan `totalAlumni` dengan `SELECT COUNT(*) FROM alumni WHERE tahun_lulus=2023`. Cek `belumBekerja` (termasuk belum mengisi, F-11). | – |
| 18 | Laporan dengan duplikat | Setelah #8, ulang #17 | `sudahMengisi` bertambah, `bekerjaKuliahPersen` bisa >100. | – |
| 19 | Laporan tahun ngawur | `GET /laporan/abc` | Saat ini 200 dengan `tahun: null`, semua 0. | Seharusnya 400 |
| 20 | Tambah alumni duplikat NIS | `POST /api/alumni/tambah` NIS yang sama | 409 | – |
| 21 | Detail alumni | `GET /api/alumni/1` | **404 Route tidak ada** (F-14) | – |
| 22 | Hapus alumni yang punya survei | `DELETE /api/alumni/:id` | 200. Cek tabel `survey` untuk `alumni_id` tsb. juga hilang. | Jika error FK: periksa urutan |
| 23 | Enumerasi publik (F-04) | `curl ':5000/api/alumni/search?jurusan=Akuntansi&tahunLulus=2023'` tanpa token | 200, daftar `id, nis, nama`. | – |
| 24 | Upload foto > 5MB | `POST /api/auth/profil/foto` file 6MB | 400 `maksimal 5MB` | – |
| 25 | Upload foto bukan gambar | file `.exe`/`.html` | 400 `Hanya file gambar…` | – |
| 26 | Import Excel ekstensi salah (F-10) | `POST /api/alumni/import-excel` file `.txt` | Idealnya 400. **Saat ini kemungkinan 500/HTML error handler default.** PERLU VERIFIKASI MANUAL | – |
| 27 | Import Excel baris cacat (F-17) | Excel dengan kolom tahun kosong di baris 3 | Catat: apakah ada baris yang masuk sebelum error? | – |
| 28 | Import SQL berbahaya (F-09) | file `.sql` berisi `INSERT INTO alumni (nis,nama,jurusan,tahun_lulus) SELECT username,password,'x',2020 FROM admin;` | Saat ini kemungkinan **lolos**. Cek isi tabel `alumni`. Gunakan database uji. | – |
| 29 | Ekspor | `GET /api/survey/export/2023` dan `export-excel/2023` | File PDF/XLSX valid. Tahun tanpa data → 404. | – |
| 30 | ML langsung | `curl -X POST :5001/predict -H 'Content-Type: application/json' -d '{"jurusan":"Perhotelan","tipe":"bekerja","teks":"Barista"}'` | `Sangat Sesuai`, `sumber: pengecualian` (`pengecualian.json:9-13`) | – |
| 31 | Health ML | `GET :5001/health` | `models: [bekerja, kuliah]` | Jika kosong: pkl gagal dimuat (versi scikit-learn) |

---

## 8. Temuan Tambahan (Audit Lanjutan) dan Cara Menanggulanginya

Bagian ini melengkapi F-01 s/d F-28. Sumber: pembacaan ulang `server/` dan rujukan dokumentasi resmi Express serta `jsonwebtoken` (via Context7). Penomorannya lanjut dari F-29. Tidak ada yang berstatus Critical.

> [!IMPORTANT]
> **Koreksi atas analisis awal saya di chat.** Tiga klaim saya perbaiki setelah diperiksa ulang, supaya Anda tidak memperbaiki hal yang bukan masalah:
> - **Tidak ada `pool.on('error')` → bukan temuan.** `mysql2` sudah membuang koneksi idle yang putus secara internal. Yang berguna hanya `enableKeepAlive` (lihat F-37).
> - **"Algorithm confusion" JWT → risikonya rendah.** `JWT_SECRET` adalah string, jadi `jsonwebtoken` v9 hanya menerima algoritma HMAC. Menambah `algorithms: ["HS256"]` tetap praktik yang baik, tetapi hanya sebagai hardening (bagian dari F-29).
> - **Formula injection di Excel → risiko kecil.** `ExcelJS` menyimpan string biasa sebagai teks, bukan formula, kecuali nilainya objek `{ formula }`. Dicatat sebagai F-39 (Info), **PERLU VERIFIKASI MANUAL** di Excel/LibreOffice.

### Ringkasan

| ID | Severity | Topik |
|---|---|---|
| F-29 | Medium | Token JWT tidak dicabut setelah ganti password / akun dihapus |
| F-30 | Medium | Import Excel memuat file 10 MB ke RAM |
| F-31 | Medium | Ekspor alumni menampilkan baris ganda (efek F-02) |
| F-32 | Low | Timing attack: username terdaftar bisa dibedakan |
| F-33 | Low | `nis.trim()` melempar error bila `nis` bukan string |
| F-34 | Low | `tahun` tidak divalidasi, masuk ke header `Content-Disposition` |
| F-35 | Low | Ekspor PDF: error setelah header terkirim dan stream tidak dibersihkan |
| F-36 | Low | Tidak ada `helmet`, `X-Powered-By` aktif |
| F-37 | Low | Tidak ada graceful shutdown, pool tanpa keep-alive |
| F-38 | Low | Wildcard `%` dan `_` pada pencarian tidak di-escape |
| F-39 | Info | Formula injection pada ekspor Excel (kemungkinan kecil) |

Total tambahan: **0 Critical, 0 High, 3 Medium, 7 Low, 1 Info**. Dengan itu total gabungan: **0 Critical, 8 High, 15 Medium, 15 Low, 1 Info**.

---

### F-29 (Medium) Token JWT tidak dicabut

- **Lokasi:** `middleware/auth.js:13`; `authController.js:34-38, 97-98`.
- **Masalah:** Token berlaku 1 hari (`expiresIn: "1d"`). Mengganti password tidak membuat token lama tidak sah. `protect` hanya memeriksa tanda tangan, tidak mengecek apakah admin masih ada di database.
- **Dampak:** Jika token admin bocor, mengganti password tidak menghentikan pelaku sampai token kedaluwarsa. Admin yang dihapus tetap bisa mengakses API.
- **Cara menanggulangi:**
  1. Tambah kolom di tabel admin (masukkan juga ke `migrate.js`):
     ```sql
     ALTER TABLE admin ADD COLUMN token_version INT NOT NULL DEFAULT 0;
     ```
  2. Masukkan versi ke token saat login (`authController.js`):
     ```js
     jwt.sign(
       { id: admin.id, username: admin.username, tv: admin.token_version },
       process.env.JWT_SECRET,
       { expiresIn: "1d", algorithm: "HS256" }
     );
     ```
  3. Naikkan versi saat password diganti (di `updateAdminPassword`):
     ```sql
     UPDATE admin SET password = ?, token_version = token_version + 1 WHERE id = ?
     ```
  4. Cek di `protect`. Jadikan async, whitelist algoritma, dan bandingkan versi:
     ```js
     export const protect = async (req, res, next) => {
       // ...ambil token seperti sebelumnya...
       try {
         const decoded = jwt.verify(token, process.env.JWT_SECRET, { algorithms: ["HS256"] });
         const admin = await findAdminById(decoded.id);
         if (!admin || admin.token_version !== decoded.tv) {
           return res.status(401).json({ message: "Sesi tidak valid, silakan login ulang" });
         }
         req.admin = decoded;
         next();
       } catch {
         return res.status(401).json({ message: "Token tidak valid atau kedaluwarsa" });
       }
     };
     ```
- **Catatan:** Setelah ganti password, frontend harus mengarahkan admin untuk login ulang karena token lamanya langsung tidak berlaku.

### F-30 (Medium) Import Excel memuat file 10 MB ke RAM

- **Lokasi:** `alumniController.js:22-25` (`multer.memoryStorage()`, batas 10 MB), `:140` (`workbook.xlsx.load`).
- **Masalah:** File `.xlsx` dibuka ke memori sebagai buffer, lalu diurai menjadi objek JS. Memori yang terpakai bisa jauh lebih besar dari ukuran file. Beberapa unggahan bersamaan bisa menghabiskan heap Node.js (PERLU VERIFIKASI MANUAL dengan file besar).
- **Dampak:** Server bisa crash atau sangat lambat. Endpoint ini memang hanya untuk admin, tetapi token yang dicuri (F-29) cukup untuk memicunya.
- **Cara menanggulangi:**
  - Turunkan batas, misalnya `fileSize: 2 * 1024 * 1024`. Data alumni sekolah ±100–ribuan baris cukup kecil.
  - Batasi jumlah baris: tolak bila `sheet.rowCount > 5000`.
  - Bila file kelak makin besar, pakai pembaca streaming `ExcelJS.stream.xlsx.WorkbookReader`.
  - Bungkus `upload.single("file")` agar error multer menjadi 400 (lihat F-10).

### F-31 (Medium) Ekspor alumni menampilkan baris ganda

- **Lokasi:** `Alumni.js:62-95` (`LEFT JOIN survey s ON a.id = s.alumni_id`), `alumniController.js:384-424`.
- **Masalah:** Selama F-02 belum diperbaiki, satu alumni bisa punya beberapa survei. `LEFT JOIN` lalu menghasilkan satu baris per survei.
- **Dampak:** Nama alumni muncul berulang di Excel. Angka "Total alumni" dan ringkasan status di baris bawah ikut membengkak, karena memakai `alumniList.length`.
- **Cara menanggulangi:** Perbaiki F-02 dulu (`UNIQUE (alumni_id)`). Sebagai pengaman tambahan, ambil survei terbaru saja:
  ```sql
  LEFT JOIN survey s ON s.id = (
    SELECT MAX(s2.id) FROM survey s2 WHERE s2.alumni_id = a.id
  )
  ```
  Verifikasi: setelah data duplikat dibuat (tes #8), jumlah baris ekspor harus sama dengan `SELECT COUNT(*) FROM alumni`.

### F-32 (Low) Timing attack pada login

- **Lokasi:** `authController.js:24-32`.
- **Masalah:** Username yang tidak ada langsung dijawab 400 tanpa `bcrypt.compare`. Username yang ada butuh puluhan milidetik karena bcrypt. Selisih waktu ini membocorkan apakah suatu username terdaftar.
- **Cara menanggulangi:** Selalu jalankan satu perbandingan bcrypt:
  ```js
  const DUMMY_HASH = "$2a$10$7EqJtq98hPqEX7fNZaFWoOhi5BcJ4mQxX5vJ5kqJd6bYh3a1uXz9G"; // hash bcrypt apa saja
  const hash = admin ? admin.password : DUMMY_HASH;
  const isMatch = await bcrypt.compare(password, hash);
  if (!admin || !isMatch) {
    return res.status(401).json({ message: "Username atau password salah" });
  }
  ```
  Sekalian validasi `typeof username === "string" && typeof password === "string"` (menutup F-25) dan ubah status login gagal ke 401 (F-24).

### F-33 (Low) `nis.trim()` melempar error bila bukan string

- **Lokasi:** `alumniController.js:65, 71-73, 99, 105-107`.
- **Masalah:** Body JSON `{"nis": 12345, ...}` membuat `nis.trim()` melempar `TypeError`, lalu respons menjadi 500 dengan pesan internal. Hal yang sama berlaku untuk `nama` dan `jurusan`.
- **Cara menanggulangi:** Normalisasi di awal, atau pakai skema validasi (F-01):
  ```js
  const str = (v) => (typeof v === "string" ? v.trim() : v == null ? "" : String(v).trim());
  const nis = str(req.body.nis);
  ```
  Tambahkan juga cek `Number.isInteger(Number(tahunLulus))` dan rentang tahun wajar (mis. 1990 sampai tahun sekarang + 1).

### F-34 (Low) Parameter `tahun` tidak divalidasi

- **Lokasi:** `surveyController.js:217, 236, 310, 366` (`laporan-tracer-study-${tahun}`), `:392`.
- **Masalah:** `tahun` dari URL dipakai apa adanya di nama file dan header `Content-Disposition`. Nilai aneh bisa membuat `setHeader` melempar error (500), atau menghasilkan nama file aneh.
- **Cara menanggulangi:**
  ```js
  const tahun = Number(req.params.tahun);
  if (!Number.isInteger(tahun) || tahun < 1990 || tahun > 2100) {
    return res.status(400).json({ message: "Tahun tidak valid" });
  }
  ```
  Satu helper ini bisa dipakai di `getLaporan`, `exportSurveyPdf`, dan `exportSurveyExcel` (sekaligus menutup tes #19).

### F-35 (Low) Ekspor PDF tidak menangani error stream

- **Lokasi:** `surveyController.js:226-306`.
- **Masalah:** Setelah `doc.pipe(res)`, header sudah terkirim. Jika error terjadi di tengah proses, `catch` mencoba `res.status(500).json(...)` dan itu gagal dengan `ERR_HTTP_HEADERS_SENT`. Tidak ada penanganan saat klien memutus koneksi.
- **Cara menanggulangi:**
  ```js
  res.on("close", () => { if (!res.writableEnded) doc.destroy(); });
  doc.on("error", (err) => {
    console.error("PDF error:", err);
    if (!res.headersSent) res.status(500).json({ message: "Gagal membuat PDF" });
    else res.end();
  });
  ```
  Di `catch`, cek `if (res.headersSent) return res.end();` sebelum mengirim JSON.

### F-36 (Low) Tidak ada `helmet`, `X-Powered-By` aktif

- **Lokasi:** `server.js:17-21`.
- **Masalah:** Express mengirim `X-Powered-By: Express`, dan tidak ada header keamanan standar. Panduan produksi Express merekomendasikan `helmet`.
- **Cara menanggulangi:**
  ```bash
  cd server && npm install helmet
  ```
  ```js
  import helmet from "helmet";
  app.disable("x-powered-by");
  app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
  ```
  Opsi `crossOriginResourcePolicy` perlu agar gambar di `/uploads` tetap bisa dimuat frontend yang berbeda origin. Tes setelahnya: foto profil masih tampil.

### F-37 (Low) Tidak ada graceful shutdown, pool tanpa keep-alive

- **Lokasi:** `server.js:33-35`; `config/db.js:6-13`.
- **Masalah:** Saat server dimatikan atau di-restart, request berjalan terputus mendadak dan pool tidak ditutup. Pool juga tanpa `enableKeepAlive`, sehingga koneksi idle bisa diputus MySQL (`wait_timeout`) dan memunculkan error pada request pertama setelah lama diam (PERLU VERIFIKASI MANUAL).
- **Cara menanggulangi:**
  ```js
  // db.js
  mysql.createPool({ /* ...opsi lama... */ enableKeepAlive: true, keepAliveInitialDelay: 10000 });

  // server.js
  const server = app.listen(PORT, () => console.log(`Server berjalan di port ${PORT}`));
  const shutdown = () => server.close(async () => { await pool.end(); process.exit(0); });
  process.on("SIGTERM", shutdown);
  process.on("SIGINT", shutdown);
  ```
  Jangan lupa `import pool from "./config/db.js"` di `server.js`.

### F-38 (Low) Wildcard `%` dan `_` tidak di-escape

- **Lokasi:** `Alumni.js:86-89`.
- **Masalah:** Query sudah berparameter (tidak ada SQL injection), tetapi tanda `%` dan `_` yang diketik user tetap dianggap wildcard oleh `LIKE`. Mencari `%` mengembalikan semua baris.
- **Cara menanggulangi:**
  ```js
  const esc = search.trim().replace(/[\\%_]/g, "\\$&");
  params.push(`%${esc}%`, `%${esc}%`);
  ```
  Dampaknya hanya ke akurasi hasil pencarian, bukan keamanan.

### F-39 (Info) Formula injection pada ekspor Excel

- **Lokasi:** `alumniController.js:396-418`; `surveyController.js:349-358`.
- **Penilaian:** Teks seperti `=1+1` dari form publik masuk ke sel Excel. `ExcelJS` menulisnya sebagai string, jadi umumnya tidak dieksekusi. **PERLU VERIFIKASI MANUAL:** isi nama dengan `=HYPERLINK("http://x","klik")` lalu ekspor dan buka di Excel dan LibreOffice.
- **Cara menanggulangi (opsional, murah):** awali nilai berbahaya dengan `'`:
  ```js
  const safe = (v) => (typeof v === "string" && /^[=+\-@\t\r]/.test(v) ? `'${v}` : v);
  ```
  Pakai terutama bila kelak ada ekspor CSV, karena CSV memang rentan.

---

### Urutan perbaikan yang disarankan

1. **Dasar data:** F-02 (UNIQUE alumni_id), F-01 (validasi), lalu F-33 dan F-34. Ini sekaligus menyelesaikan F-31.
2. **Autentikasi:** F-06 (rate limit login), F-32, lalu F-29.
3. **Stabilitas:** F-30, F-35, F-37.
4. **Hardening ringan:** F-36, F-38, F-39.

---

*Dokumen ini hanya mencatat apa yang bisa dibuktikan dari kode. Poin bertanda PERLU VERIFIKASI MANUAL belum diuji secara runtime.*
