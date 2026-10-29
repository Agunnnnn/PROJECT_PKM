# QA Testing - Auth & Security

## 📋 Overview
Testing untuk memverifikasi:
- Login validation & error handling
- JWT authentication & authorization
- Role-based access control
- Rate limiting untuk prevent brute force
- Database seeding (default admin)

---

## 🎯 Test Cases

### Test #2: Login dengan Body Kosong `{}`
**Objective**: Memastikan login endpoint memvalidasi input

**Endpoint**: `POST http://localhost:5000/api/auth/login`

**Request Body**:
```json
{}
```

**Expected Response**:
- Status Code: `400 Bad Request` ✅
- Error message yang jelas (bukan 500 atau SQL error)

**Possible Bug**:
- Status 500 ❌
- SQL error exposed ❌
- No validation ❌

---

### Test #3: Akses /api/survey Tanpa Token
**Objective**: Memastikan protected endpoint reject request tanpa authentication

**Endpoint**: `GET http://localhost:5000/api/survey`

**Headers**: 
- ❌ **TIDAK ADA** Authorization header

**Expected Response**:
- Status Code: `401 Unauthorized` ✅
- Message: `"Tidak ada token, akses ditolak"`

**Possible Bug**:
- Status 200 dan data terekspos ❌ (CRITICAL!)
- Status 500 ❌

---

### Test #4: Akses dengan Token Palsu
**Objective**: Memastikan sistem mendeteksi token yang tidak valid

**Endpoint**: `GET http://localhost:5000/api/survey`

**Headers**:
```
Authorization: Bearer tokenpalsuasaljadian123
```

**Expected Response**:
- Status Code: `401 Unauthorized` ✅
- Message: `"Token tidak valid atau kedaluwarsa"`

**Possible Bug**:
- Status 200 dan data terekspos ❌ (CRITICAL!)
- Status 500 ❌

---

### Test #6: Edit Profil dengan Role "Superuser"
**Objective**: Memastikan sistem tidak mengizinkan privilege escalation

**Prerequisites**: Login dulu untuk dapat token valid

**Endpoint**: `PUT http://localhost:5000/api/auth/profil`

**Headers**:
```
Authorization: Bearer <token_valid>
Content-Type: application/json
```

**Request Body**:
```json
{
  "username": "admin",
  "nama": "Admin Test",
  "role": "Superuser"
}
```

**Expected Response**:
- Status Code: `400 Bad Request` atau `403 Forbidden` ✅
- Role tidak berubah menjadi "Superuser" ✅

**Possible Bug**:
- Status 200 dan role berubah jadi "Superuser" ❌ (CRITICAL!)
- User bisa escalate privilege sendiri ❌

---

### Test #15: Spam Login 50x
**Objective**: Memastikan ada rate limiting untuk prevent brute force attack

**Endpoint**: `POST http://localhost:5000/api/auth/login`

**Request Body** (kirim 50x):
```json
{
  "username": "test",
  "password": "wrongpassword"
}
```

**Expected Response**:
- Request 1-10: `400` (username/password salah) ✅
- Request 11+: `429 Too Many Requests` ✅
- Rate limit header muncul ✅

**Possible Bug**:
- Semua 50 request ke-process tanpa rate limit ❌ (CRITICAL!)
- Brute force attack bisa dilakukan ❌

---

### Bonus: Cek Akun Default admin/admin123
**Objective**: Memastikan seeder berjalan dengan benar

**Method 1 - Via Login**:
```json
POST /api/auth/login
{
  "username": "admin",
  "password": "admin123"
}
```
Expected: `200 OK` dengan token ✅

**Method 2 - Via Database**:
```sql
SELECT * FROM admin WHERE username = 'admin';
```
Expected: Record exist dengan password hash ✅

---

## 🛠️ Cara Testing dengan Thunder Client

### Setup Awal:

1. **Pastikan server jalan**:
   ```bash
   cd /home/agun/Desktop/PROJECT/PKM/tracer-study-mysql/server
   npm run dev
   ```

2. **Buka Thunder Client** di VS Code (icon petir ⚡)

---

### Test #2: Login Empty Body

1. **New Request**
2. Method: `POST`
3. URL: `http://localhost:5000/api/auth/login`
4. Headers: `Content-Type: application/json`
5. Body (JSON): `{}`
6. **Send**
7. **Screenshot** → `Test_2_Login_Empty.png`

---

### Test #3: Survey Tanpa Token

1. **New Request**
2. Method: `GET`
3. URL: `http://localhost:5000/api/survey`
4. Headers: **JANGAN ISI Authorization** (hapus kalau ada)
5. **Send**
6. Expected: `401 Unauthorized`
7. **Screenshot** → `Test_3_No_Token.png`

---

### Test #4: Survey Token Palsu

1. **New Request**
2. Method: `GET`
3. URL: `http://localhost:5000/api/survey`
4. Headers:
   - Key: `Authorization`
   - Value: `Bearer tokenpalsuasaljadian123`
5. **Send**
6. Expected: `401 Unauthorized`
7. **Screenshot** → `Test_4_Fake_Token.png`

---

### Test #6: Edit Profil Role Escalation

**Step 1: Login dulu untuk dapat token**

1. **New Request**
2. Method: `POST`
3. URL: `http://localhost:5000/api/auth/login`
4. Body (JSON):
```json
{
  "username": "admin",
  "password": "admin123"
}
```
5. **Send**
6. **Copy token** dari response

**Step 2: Edit profil dengan role "Superuser"**

1. **New Request**
2. Method: `PUT`
3. URL: `http://localhost:5000/api/auth/profil`
4. Headers:
   - Key: `Authorization`
   - Value: `Bearer <paste_token_dari_step_1>`
   - Key: `Content-Type`
   - Value: `application/json`
5. Body (JSON):
```json
{
  "username": "admin",
  "nama": "Admin Test",
  "role": "Superuser"
}
```
6. **Send**
7. Expected: Request ditolak atau role tetap "Administrator"
8. **Screenshot** → `Test_6_Role_Escalation.png`

**Step 3: Cek profil apakah role berubah**

1. Method: `GET`
2. URL: `http://localhost:5000/api/auth/profil`
3. Headers: `Authorization: Bearer <token>`
4. **Send**
5. Cek field `role` di response
6. **Screenshot** → `Test_6_Check_Role.png`

---

### Test #15: Spam Login 50x

**Opsi A: Manual (Thunder Client)**
- Kirim request login yang sama **50 kali** (klik Send berulang-ulang)
- Catat kapan muncul `429 Too Many Requests`

**Opsi B: Automated Script** (Recommended)
Jalankan script yang sudah aku buatkan:

```bash
cd /home/agun/Desktop/PROJECT/PKM/tracer-study-mysql
node test-spam-login.js
```

Script akan otomatis:
- Kirim 50 request login
- Catat response setiap request
- Deteksi kapan rate limit aktif
- Generate report

---

### Bonus: Cek Admin Default

**Via Thunder Client:**

1. Method: `POST`
2. URL: `http://localhost:5000/api/auth/login`
3. Body:
```json
{
  "username": "admin",
  "password": "admin123"
}
```
4. **Send**
5. Expected: `200 OK` dengan token
6. **Screenshot** → `Test_Bonus_Admin_Default.png`

**Via MySQL:**
```bash
# Login ke MySQL
mysql -u root -p

# Pilih database
USE tracer_study;

# Cek admin
SELECT * FROM admin WHERE username = 'admin';
```

---

## 📸 Screenshot Checklist

- [ ] Test_2_Login_Empty.png
- [ ] Test_3_No_Token.png
- [ ] Test_4_Fake_Token.png
- [ ] Test_6_Role_Escalation.png
- [ ] Test_6_Check_Role.png
- [ ] Test_15_Spam_Login.png (atau output script)
- [ ] Test_Bonus_Admin_Default.png

---

## 🐛 Bug Report Template

**Bug ID**: [Auth/Security - Test #X]

**Severity**: Critical / High / Medium / Low

**Description**: 
[Deskripsi singkat masalah]

**Steps to Reproduce**:
1. [Step 1]
2. [Step 2]

**Expected Result**:
[Yang seharusnya terjadi]

**Actual Result**:
[Yang sebenarnya terjadi]

**Evidence**:
- Screenshot: [attach]
- Request/Response: [copy paste]

**Security Impact**:
[Jelaskan dampak keamanan jika bug ini di-exploit]

---

## 📊 Summary Report Template

```
=== QA Test Summary - Auth & Security ===

Test #2 (Login Empty): ✅ PASS / ❌ FAIL
Test #3 (No Token): ✅ PASS / ❌ FAIL
Test #4 (Fake Token): ✅ PASS / ❌ FAIL
Test #6 (Role Escalation): ✅ PASS / ❌ FAIL
Test #15 (Rate Limiting): ✅ PASS / ❌ FAIL
Bonus (Admin Default): ✅ PASS / ❌ FAIL

Total Bugs Found: [X]
Critical: [X]
High: [X]
Medium: [X]
Low: [X]

Critical Security Issues:
[List kalau ada]
```

---

**Prepared by**: Kiro AI Assistant
**Date**: 2026-10-20
**Version**: 1.0
