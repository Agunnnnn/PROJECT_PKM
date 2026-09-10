## Prasyarat

- Node.js sudah terinstall (cek dengan `node -v`)
- MySQL sudah terinstall & jalan (XAMPP/Laragon juga bisa dipakai, tinggal aktifkan MySQL-nya)

## Cara Menjalankan — Backend

```bash
cd server
npm install


npm run seed   # buat akun admin pertama (admin / admin123)
npm run dev    # jalankan server di http://localhost:5000
```

## Cara Menjalankan — Frontend

Buka terminal baru:

```bash
cd client
npm install
npm run dev    # jalankan di http://localhost:5173
```

## Alur Pemakaian

1. Buka `http://localhost:5173` → halaman publik untuk alumni mengisi form survey.
2. Buka `http://localhost:5173/login` → login pakai
3. Setelah login, buka menu **Dashboard** untuk grafik statistik, atau **Data Survey** untuk tabel semua respons.

## Struktur Database (lihat)

- `alumni` — data diri alumni (nis, nama, jurusan, tahun_lulus, email, no_hp)
- `survey` — respons survey, relasi ke `alumni` lewat `alumni_id`
- `admin` — akun login untuk dashboard

## Yang Bisa Dikembangkan Lagi (nilai plus)

- Tambah filter tahun lulus / jurusan di halaman Data Survey
- Export data ke Excel (pakai library `exceljs`) atau PDF
- Kirim link survey otomatis ke alumni lewat email/WhatsApp API
- Deploy backend ke Railway/Render, frontend ke Vercel/Netlify, database MySQL bisa pakai layanan seperti Railway MySQL atau Clever Cloud

## Troubleshooting

- **"Gagal konek ke MySQL"** → pastikan service MySQL sudah jalan, dan `DB_USER`/`DB_PASSWORD`/`DB_NAME` di `.env` sudah benar.
- **Error saat `npm run seed` / server start karena tabel belum ada** → pastikan sudah menjalankan `schema.sql` di database MySQL.
- **Dashboard/Data Survey kosong** → isi dulu form survey minimal 1-2 kali dari halaman utama.
- **CORS error di browser** → pastikan backend (`npm run dev` di folder `server`) sudah jalan duluan di port 5000.
