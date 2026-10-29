# Product Requirements Document (PRD)

## Sistem Tracer Study Berbasis Web dengan Prediksi Kesesuaian Jurusan Menggunakan Machine Learning

**Program**: Program Kreativitas Mahasiswa (PKM)
**Institusi**: Universitas Pamulang
**Mitra/Objek Studi**: SMK Puspita Bangsa
**Versi Dokumen**: 1.0

---

## 1. Latar Belakang

SMK Puspita Bangsa membutuhkan sistem untuk melacak status alumni setelah lulus (bekerja, melanjutkan kuliah, berwirausaha, atau belum bekerja), guna keperluan evaluasi kurikulum, akreditasi, dan pelaporan kinerja sekolah melalui Bursa Kerja Khusus (BKK). Proses pelacakan yang dilakukan secara manual selama ini kurang efisien dan tidak memiliki mekanisme otomatis untuk menilai kesesuaian antara jurusan alumni dengan pekerjaan/jurusan kuliah lanjutan yang mereka tempuh.

## 2. Tujuan (Goals)

1. Menyediakan platform digital bagi alumni untuk mengisi survei tracer study secara mandiri dan terstruktur.
2. Menyediakan dashboard bagi admin/BKK sekolah untuk memantau statistik keterserapan alumni.
3. Mengotomatisasi penilaian relevansi jurusan terhadap pekerjaan/jurusan kuliah alumni menggunakan pendekatan Machine Learning, menggantikan penilaian manual yang subjektif.
4. Menyediakan laporan yang dapat diunduh (PDF/Excel) sebagai bahan evaluasi dan akreditasi sekolah.

## 3. Target Pengguna (User Roles)

| Role                 | Deskripsi                                                        | Akses                                               |
| -------------------- | ---------------------------------------------------------------- | --------------------------------------------------- |
| **Alumni**           | Lulusan SMK Puspita Bangsa dari berbagai jurusan dan tahun lulus | Mengisi form survei tanpa login (publik)            |
| **Admin (BKK/Guru)** | Staf sekolah yang mengelola data tracer study                    | Login, akses dashboard, data survei, export laporan |

## 4. Ruang Lingkup (Scope)

### 4.1 Dalam Lingkup (In-Scope)

- Form survei alumni dengan pemilihan data otomatis (Jurusan → Tahun Lulus → Nama → NIS)
- Sistem autentikasi admin dan pengelolaan profil
- Dashboard visualisasi statistik (status alumni, relevansi pekerjaan/kuliah)
- Tabel data survei dengan filter berdasarkan tahun lulus
- Export laporan ke format PDF dan Excel
- Model Machine Learning untuk prediksi otomatis relevansi jurusan terhadap bidang pekerjaan maupun jurusan kuliah lanjutan
- Import data alumni dari sekolah ke dalam sistem

### 4.2 Luar Lingkup (Out of Scope)

- Prediksi relevansi untuk jalur wirausaha (karakteristik jenis dan bidang usaha terlalu dinamis di luar model klasifikasi teks kurikulum)
- Notifikasi otomatis via email/WhatsApp ke alumni (potensi pengembangan lanjutan)
- Aplikasi mobile native (sistem berbasis web responsif, bukan aplikasi Android/iOS native)
- Manajemen multi-sekolah (sistem dirancang untuk satu institusi: SMK Puspita Bangsa)

## 5. Daftar Fitur Utama

| No  | Fitur                            | Deskripsi Singkat                                                                                                     |
| --- | -------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| 1   | Form Survey Otomatis             | Alumni memilih jurusan, tahun lulus, dan nama; NIS otomatis terisi tanpa perlu diketik manual                         |
| 2   | Input Status Alumni              | Pencatatan status terkini: Bekerja, Kuliah, Wirausaha, atau Belum Bekerja, beserta detail pendukungnya                |
| 3   | Login Admin                      | Autentikasi aman menggunakan JWT untuk akses khusus admin/BKK                                                         |
| 4   | Dashboard Statistik              | Visualisasi grafik status alumni dan tingkat relevansi pekerjaan/kuliah secara real-time                              |
| 5   | Tabel Data Survey                | Daftar seluruh respons survey dengan fitur pencarian dan filter per tahun lulus                                       |
| 6   | Prediksi Relevansi Otomatis (ML) | Penilaian otomatis kesesuaian bidang kerja atau jurusan kuliah dengan jurusan SMK menggunakan Machine Learning        |
| 7   | Export Laporan PDF               | Unduh laporan data survey dalam format PDF, difilter per tahun lulus                                                  |
| 8   | Export Laporan Excel             | Unduh laporan data survey dalam format Excel, difilter per tahun lulus                                                |
| 9   | Import Data Alumni               | Mengimpor data alumni dari sekolah (NIS, nama, jurusan, tahun lulus) ke dalam sistem via Excel                        |

## 6. Kebutuhan Fungsional (Functional Requirements)

### 6.1 Modul Alumni (Publik)

| ID   | Kebutuhan                                                                                               |
| ---- | ------------------------------------------------------------------------------------------------------- |
| F-01 | Alumni dapat memilih Jurusan, Tahun Lulus, dan Nama dari data yang sudah terdaftar; NIS otomatis terisi |
| F-02 | Alumni dapat mengisi status terkini: Bekerja, Kuliah, Wirausaha, atau Belum Bekerja                     |
| F-03 | Jika status "Bekerja": alumni mengisi nama perusahaan, bidang kerja, lama menunggu kerja                |
| F-04 | Jika status "Kuliah": alumni mengisi nama kampus dan jurusan kuliah                                     |
| F-05 | Alumni dapat memberikan saran untuk sekolah                                                             |
| F-06 | Sistem menyimpan data survei ke database setelah validasi                                               |

### 6.2 Modul Admin

| ID   | Kebutuhan                                                                                      |
| ---- | ---------------------------------------------------------------------------------------------- |
| F-07 | Admin dapat login menggunakan username dan password (autentikasi JWT)                          |
| F-08 | Admin dapat melihat dashboard statistik (status alumni, tingkat relevansi) dalam bentuk grafik |
| F-09 | Admin dapat melihat tabel seluruh respons survei                                               |
| F-10 | Admin dapat memfilter data survei berdasarkan tahun lulus                                      |
| F-11 | Admin dapat mengunduh laporan dalam format PDF                                                 |
| F-12 | Admin dapat mengunduh laporan dalam format Excel                                               |

### 6.3 Modul Machine Learning

| ID   | Kebutuhan                                                                                                                                                |
| ---- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| F-13 | Sistem secara otomatis menghitung skor kesesuaian jurusan SMK dengan bidang kerja (Bekerja) atau jurusan kuliah (Kuliah) menggunakan TF-IDF dan Cosine Similarity |
| F-14 | Hasil prediksi dikategorikan menjadi tiga label: Sangat Sesuai, Cukup Sesuai, Tidak Sesuai                                                               |
| F-15 | Prediksi relevansi dijalankan ketika status alumni adalah "Bekerja" atau "Kuliah"                                                                        |
| F-16 | Apabila layanan ML API tidak dapat diakses, data survei tetap tersimpan tanpa nilai relevansi (fail-safe)                                                |

## 7. Kebutuhan Non-Fungsional (Non-Functional Requirements)

| Kategori            | Deskripsi                                                                                                             |
| ------------------- | --------------------------------------------------------------------------------------------------------------------- |
| **Keamanan**        | Password admin disimpan dalam bentuk hash (bcrypt); autentikasi menggunakan JWT dengan masa berlaku terbatas          |
| **Usability**       | Form alumni dapat diisi tanpa pelatihan khusus; alur pengisian data dipandu melalui dropdown bertingkat               |
| **Reliabilitas**    | Sistem tetap dapat menerima data survei meskipun layanan ML sedang tidak aktif                                        |
| **Maintainability** | Kata kunci referensi jurusan untuk model ML dapat diperbarui tanpa mengubah kode program (melalui file data terpisah) |
| **Portabilitas**    | Dapat dijalankan secara lokal (development) maupun di-deploy ke layanan hosting                                       |

## 8. Arsitektur Sistem

```
┌─────────────┐       ┌──────────────────┐       ┌─────────────────┐
│   React     │──────▶│  Node.js/Express  │──────▶│      MySQL       │
│  (Frontend) │◀──────│    (Backend API)  │◀──────│    (Database)    │
└─────────────┘       └────────┬──────────┘       └──────────────────┘
                                │
                                ▼
                       ┌──────────────────┐
                       │   Flask (Python)  │
                       │   ML API Service   │
                       │ (TF-IDF + Cosine)  │
                       └──────────────────┘
```

## 9. Teknologi yang Digunakan

| Kategori         | Teknologi                                   |
| ---------------- | ------------------------------------------- |
| Frontend         | React, Vite                                 |
| Backend          | Node.js, Express.js                         |
| Database         | MySQL                                       |
| Machine Learning | Python, Flask, scikit-learn, pandas, joblib |
| Autentikasi      | JWT (JSON Web Token), bcrypt                |
| Export Laporan   | PDFKit, ExcelJS                             |
| Visualisasi Data | Recharts                                    |
| Version Control  | Git, GitHub                                 |

## 10. Model Data (Entitas Utama)

**Alumni**: `id, nis (UNIQUE), nama, jurusan, tahun_lulus, email, no_hp, created_at`

**Survey**: `id, alumni_id (FK, UNIQUE), status_saat_ini, nama_perusahaan, bidang_kerja, relevansi_jurusan, lama_tunggu_kerja, nama_kampus, jurusan_kampus, saran_untuk_sekolah, created_at`

**Admin**: `id, username (UNIQUE), password (hashed), nama, email, telepon, role, foto, created_at`

## 11. Spesifikasi Model Machine Learning

| Aspek                | Keterangan                                                                                            |
| -------------------- | ----------------------------------------------------------------------------------------------------- |
| **Algoritma**        | TF-IDF (Term Frequency-Inverse Document Frequency) + Cosine Similarity                                |
| **Input**            | Teks referensi kurikulum/kata kunci kejuruan SMK dan teks input alumni (bidang kerja / jurusan kampus) |
| **Output**           | Skor kemiripan kosinus (0–1) dan label kategori relevansi (Sangat Sesuai, Cukup Sesuai, Tidak Sesuai) |
| **Threshold Aktual** | **Bekerja:** Skor < 0.01 $\rightarrow$ Tidak Sesuai; 0.01–0.049 $\rightarrow$ Cukup Sesuai; $\ge$ 0.05 $\rightarrow$ Sangat Sesuai<br>**Kuliah:** Skor < 0.02 $\rightarrow$ Tidak Sesuai; 0.02–0.039 $\rightarrow$ Cukup Sesuai; $\ge$ 0.04 $\rightarrow$ Sangat Sesuai<br>*(Fallback kode bila model tanpa batas bawaan: < 0.05 / 0.05–0.15 / $\ge$ 0.15)* |
| **Evaluasi**         | Accuracy Score, Classification Report (Precision, Recall, F1-Score), Confusion Matrix                 |
| **Akurasi saat ini** | 80.70% (pada dataset uji internal)                                                                    |
| **Deployment**       | Model serialisasi `model_relevansi.pkl` (joblib), disajikan melalui REST API (Flask) pada endpoint `POST /predict` dan `POST /predict-batch` |

## 12. Metrik Keberhasilan (Success Metrics)

- Sistem dapat digunakan alumni untuk mengisi survei tanpa kendala teknis
- Admin dapat menghasilkan laporan PDF/Excel dalam waktu kurang dari 5 detik
- Model ML menghasilkan akurasi prediksi relevansi di atas 75%
- Seluruh data alumni dari sekolah (100 data awal) berhasil terintegrasi ke dalam sistem

## 13. Struktur Tim & Pembagian Tanggung Jawab

| Peran                 | Penanggung Jawab     | Tanggung Jawab                                                            |
| --------------------- | -------------------- | ------------------------------------------------------------------------- |
| **Backend Engineer**  | Dicky Baskara        | Pengembangan API, autentikasi, integrasi database dan ML API              |
| **Frontend Engineer** | Putra Reno Hariyanto | Pengembangan antarmuka pengguna (form, dashboard, tabel data)             |
| **ML Engineer**       | Palaguna             | Penyiapan data referensi, pelatihan model, evaluasi, dan deployment model |

## 14. Risiko dan Mitigasi

| Risiko                                                                                   | Mitigasi                                                                                      |
| ---------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| Kata kunci referensi jurusan tidak mencakup seluruh variasi pekerjaan di dunia nyata     | Proses pembaruan kata kunci dilakukan secara iteratif berdasarkan data aktual yang ditemukan  |
| Layanan ML API tidak aktif saat alumni mengisi survei                                    | Sistem tetap menyimpan data survei tanpa nilai relevansi (graceful degradation)               |
| Perubahan skema database oleh satu anggota tim tidak tersinkronisasi dengan anggota lain | Penerapan Git branching strategy dan proses Pull Request sebelum penggabungan ke branch utama |

## 15. Rencana Pengembangan Lanjutan (Future Enhancements)

- Notifikasi otomatis ke alumni melalui email/WhatsApp API
- Desain antarmuka responsif penuh dan Progressive Web App (PWA) untuk perangkat mobile
- Integrasi analitik tren kompetensi industri secara berkala
