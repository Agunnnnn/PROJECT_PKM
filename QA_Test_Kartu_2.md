# QA Testing - Kartu 2: Verifikasi Validasi & Survei Ganda

## 📋 Overview
Testing untuk memverifikasi:
- Validasi input pada endpoint survey
- Pencegahan duplicate survey (survei ganda)
- Error handling yang proper
- Response codes yang sesuai

## 🎯 Test Cases

### Test #7: Kirim Survey Valid (Harus 201)
**Objective**: Memastikan survey dengan data valid berhasil tersimpan

**Endpoint**: `POST http://localhost:5000/api/survey`

**Request Body**:
```json
{
  "nis": "12345",
  "nama": "Test Alumni",
  "jurusan": "Rekayasa Perangkat Lunak",
  "tahunLulus": 2023,
  "email": "test@alumni.com",
  "noHp": "081234567890",
  "statusSaatIni": "Bekerja",
  "namaPerusahaan": "PT. Test Company",
  "bidangKerja": "Software Developer",
  "lamaTungguKerja": "3 bulan",
  "saranUntukSekolah": "Tambah praktikum"
}
```

**Expected Response**:
- Status Code: `201 Created`
- Body berisi: `id`, `relevansiJurusan`

---

### Test #8: Kirim Payload Sama 2x (Cek Duplicate)
**Objective**: Mengidentifikasi apakah sistem mengizinkan survei ganda untuk alumni yang sama

**Steps**:
1. Kirim request yang sama dengan Test #7
2. Kirim ulang request yang persis sama
3. Catat response kedua request

**Skenario yang BENAR**:
- Request pertama: `201 Created`
- Request kedua: `400 Bad Request` atau `409 Conflict` dengan pesan error jelas

**Skenario BUG** (yang perlu diperbaiki):
- Request pertama: `201 Created`
- Request kedua: `201 Created` ← **INI BUG!** (survei ganda tercipta)

---

### Test #9: Kirim Body Kosong `{}` 
**Objective**: Memverifikasi error handling untuk input yang tidak valid

**Request Body**:
```json
{}
```

**Skenario yang BENAR**:
- Status Code: `400 Bad Request`
- Error message yang informatif (bukan SQL mentah)
- Contoh: `{ "message": "Field 'nis' is required" }`

**Skenario BUG** (yang perlu diperbaiki):
- Status Code: `500 Internal Server Error`
- Error message menampilkan SQL mentah
- Contoh: `Cannot read property 'nis' of undefined` atau SQL error mentah

---

### Test #10: Kirim Status Invalid `"Hacker"`
**Objective**: Memverifikasi validasi enum untuk field `statusSaatIni`

**Request Body**:
```json
{
  "nis": "12345",
  "nama": "Test Alumni",
  "jurusan": "Rekayasa Perangkat Lunak",
  "tahunLulus": 2023,
  "email": "test@alumni.com",
  "noHp": "081234567890",
  "statusSaatIni": "Hacker",
  "saranUntukSekolah": "Test"
}
```

**Expected Response**:
- Status Code: `400 Bad Request`
- Error message: `"Status harus salah satu dari: Bekerja, Kuliah, Wirausaha, Belum Bekerja"`

---

## 🛠️ Cara Testing

### Opsi 1: Manual Testing dengan Postman/Thunder Client

1. **Install Extension** (jika belum):
   - VS Code: Install "Thunder Client" atau "REST Client"
   - Atau gunakan Postman desktop

2. **Jalankan Server**:
   ```bash
   cd /home/agun/Desktop/PROJECT/PKM/tracer-study-mysql/server
   npm run dev
   ```

3. **Execute Tests**: Gunakan collection yang sudah saya buatkan (lihat file `QA_Tests_Collection.json`)

### Opsi 2: Automated Testing dengan Script

Jalankan automated test script:
```bash
cd /home/agun/Desktop/PROJECT/PKM/tracer-study-mysql
node test-kartu-2.js
```

---

## 📸 Cara Capture Screenshot untuk Bukti

### Menggunakan Thunder Client (Recommended)
1. Buka VS Code
2. Install "Thunder Client" extension
3. Jalankan request
4. **Capture screenshot** dengan:
   - Linux: `Print Screen` atau `Shift + Print Screen` (area selection)
   - Atau gunakan tool: `Flameshot`, `Spectacle`, `GNOME Screenshot`
5. Save dengan nama: `Test_7_Valid_Survey.png`, `Test_8_Duplicate.png`, dll

### Menggunakan Terminal + curl
```bash
# Test #7
curl -X POST http://localhost:5000/api/survey \
  -H "Content-Type: application/json" \
  -d '{
    "nis": "12345",
    "nama": "Test Alumni",
    "jurusan": "Rekayasa Perangkat Lunak",
    "tahunLulus": 2023,
    "email": "test@alumni.com",
    "noHp": "081234567890",
    "statusSaatIni": "Bekerja",
    "namaPerusahaan": "PT. Test Company",
    "bidangKerja": "Software Developer",
    "lamaTungguKerja": "3 bulan",
    "saranUntukSekolah": "Tambah praktikum"
  }' | jq

# Screenshot terminal dengan `gnome-screenshot` atau screenshot tool
```

---

## ✅ Checklist Bukti yang Perlu Dikumpulkan

- [ ] Screenshot Test #7 - Response 201 dengan body lengkap
- [ ] Screenshot Test #8 - Request pertama (201)
- [ ] Screenshot Test #8 - Request kedua (harusnya error, catat jika 201 = bug!)
- [ ] Screenshot Test #9 - Response error dari body kosong
- [ ] Screenshot Test #10 - Response 400 dari status invalid
- [ ] Log konsol server (jika ada error)
- [ ] Screenshot database setelah test (opsional, untuk verifikasi data)

---

## 🐛 Bug Report Template

Jika menemukan bug, dokumentasikan dengan format ini:

**Bug ID**: [Kartu 2 - Test #X]

**Severity**: Critical / High / Medium / Low

**Description**: 
[Deskripsi singkat masalah]

**Steps to Reproduce**:
1. [Step 1]
2. [Step 2]
3. [Step 3]

**Expected Result**:
[Apa yang seharusnya terjadi]

**Actual Result**:
[Apa yang sebenarnya terjadi]

**Evidence**:
- Screenshot: [attach file]
- Request/Response: [copy paste]

**Environment**:
- OS: Linux
- Node Version: [jalankan `node -v`]
- Database: MySQL

---

## 📊 Summary Report Template

```
=== QA Test Summary - Kartu 2 ===

Test #7 (Valid Survey): ✅ PASS / ❌ FAIL
Test #8 (Duplicate): ✅ PASS / ❌ FAIL
Test #9 (Empty Body): ✅ PASS / ❌ FAIL
Test #10 (Invalid Status): ✅ PASS / ❌ FAIL

Total Bugs Found: [X]
Critical: [X]
High: [X]
Medium: [X]
Low: [X]

Notes:
[Catatan tambahan]
```

---

## 📝 Notes untuk Tester

1. **Jalankan test secara berurutan** (Test #7 → #8 → #9 → #10)
2. **Clear database** sebelum testing untuk hasil yang konsisten:
   ```sql
   DELETE FROM survey;
   DELETE FROM alumni;
   ```
3. **Pastikan ML API jalan** (opsional, tidak wajib untuk test ini)
4. **Catat semua response** dengan detail
5. **Jangan edit request** di tengah test untuk menjaga konsistensi

---

**Prepared by**: Kiro AI Assistant
**Date**: 2026-10-20
**Version**: 1.0
