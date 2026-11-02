import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../api/axios";

/* ---------- Gaya bersama (konsisten dengan ProfilAdmin) ---------- */
const card = "rounded-3xl border border-[#d9e6f5] bg-white";
const labelCls = "mb-2 block text-[15px] font-semibold font-['Poppins',sans-serif] text-[#12263f]";
const fieldCls =
  "h-[52px] w-full rounded-xl border border-[#cbd5e1] bg-white px-4 text-base text-[#12263f] placeholder:text-[#6b7f99] focus:border-[#1767a8] focus:outline-none focus:ring-4 focus:ring-[#1767a8]/15";
const btnOutline =
  "h-[52px] rounded-xl border border-[#cbd5e1] bg-white px-6 font-['Poppins',sans-serif] text-[15px] font-semibold text-[#12263f] transition-colors hover:bg-[#f1f5f9]";
const btnSolid =
  "h-[52px] rounded-xl bg-[#1767a8] px-6 font-['Poppins',sans-serif] text-[15px] font-semibold text-white transition-colors hover:bg-[#12558c] focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-[#8cc1ee]";
const btnDanger =
  "h-9 rounded-lg border border-red-200 bg-red-50 px-4 font-['Poppins',sans-serif] text-[13px] font-semibold text-red-600 transition-colors hover:bg-red-100 disabled:opacity-40";

/* ---------- Ikon ---------- */
const EyeIcon = ({ show }) => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    {show ? (
      <>
        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
        <line x1="1" y1="1" x2="23" y2="23" />
      </>
    ) : (
      <>
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
        <circle cx="12" cy="12" r="3" />
      </>
    )}
  </svg>
);

const UserPlusIcon = () => (
  <svg
    width="22"
    height="22"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <line x1="19" y1="8" x2="19" y2="14" />
    <line x1="22" y1="11" x2="16" y2="11" />
  </svg>
);

const TrashIcon = () => (
  <svg
    width="15"
    height="15"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
    <path d="M10 11v6M14 11v6" />
    <path d="M9 6V4h6v2" />
  </svg>
);

const inisial = (nama) =>
  (nama || "A")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((k) => k[0].toUpperCase())
    .join("");

/* ---------- Modal Konfirmasi Hapus ---------- */
function ModalKonfirmasiHapus({ admin, onBatal, onKonfirmasi, loading }) {
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onBatal();
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [onBatal]);

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="judul-konfirmasi-hapus"
    >
      <div onClick={onBatal} className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm" />
      <div className="relative flex min-h-full items-center justify-center p-4">
        <div className={`${card} relative w-full max-w-md p-6 shadow-2xl`}>
          <div className="flex items-start gap-4">
            <div className="grid h-12 w-12 flex-none place-items-center rounded-2xl bg-red-100 text-red-600">
              <TrashIcon />
            </div>
            <div>
              <h2
                id="judul-konfirmasi-hapus"
                className="font-['Poppins',sans-serif] text-lg font-bold text-[#12263f]"
              >
                Hapus Akun Admin
              </h2>
              <p className="mt-1 text-[15px] text-[#5b7794]">
                Akun{" "}
                <span className="font-semibold text-[#12263f]">
                  {admin.nama || admin.username}
                </span>{" "}
                (<code className="rounded bg-slate-100 px-1.5 py-0.5 text-[13px]">{admin.username}</code>)
                akan dihapus permanen. Tindakan ini tidak dapat dibatalkan.
              </p>
            </div>
          </div>
          <div className="mt-6 flex justify-end gap-3">
            <button
              type="button"
              onClick={onBatal}
              disabled={loading}
              className={btnOutline}
            >
              Batal
            </button>
            <button
              type="button"
              onClick={onKonfirmasi}
              disabled={loading}
              className="h-[52px] rounded-xl bg-red-600 px-6 font-['Poppins',sans-serif] text-[15px] font-semibold text-white transition-colors hover:bg-red-700 disabled:opacity-60"
            >
              {loading ? "Menghapus..." : "Ya, Hapus"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------- Halaman Utama ---------- */
export default function TambahAkunAdmin() {
  /* ── State form ── */
  const [form, setForm] = useState({
    nama: "",
    username: "",
    password: "",
    konfirmasiPassword: "",
  });
  const [showPass, setShowPass] = useState(false);
  const [showKonfirmasi, setShowKonfirmasi] = useState(false);
  const [loadingTambah, setLoadingTambah] = useState(false);
  const [errorForm, setErrorForm] = useState("");
  const [suksesForm, setSuksesForm] = useState("");

  /* ── State daftar admin ── */
  const [daftarAdmin, setDaftarAdmin] = useState([]);
  const [loadingList, setLoadingList] = useState(true);
  const [errorList, setErrorList] = useState("");

  /* ── State hapus ── */
  const [adminYangDihapus, setAdminYangDihapus] = useState(null);
  const [loadingHapus, setLoadingHapus] = useState(false);

  /* ── ID admin yang sedang login (untuk proteksi hapus diri sendiri) ── */
  const [myAdminId, setMyAdminId] = useState(null);

  /* ── Load daftar admin & profil diri sendiri ── */
  useEffect(() => {
    fetchDaftarAdmin();
    fetchProfilDiri();
  }, []);

  const fetchDaftarAdmin = async () => {
    try {
      setLoadingList(true);
      setErrorList("");
      const res = await api.get("/auth/admin-list");
      setDaftarAdmin(res.data || []);
    } catch (err) {
      setErrorList(
        err.response?.data?.message || "Gagal memuat daftar akun admin."
      );
    } finally {
      setLoadingList(false);
    }
  };

  const fetchProfilDiri = async () => {
    try {
      const res = await api.get("/auth/profil");
      setMyAdminId(res.data?.id);
    } catch {
      /* abaikan */
    }
  };

  /* ── Ubah field form ── */
  const ubah = (key) => (e) => {
    setForm({ ...form, [key]: e.target.value });
    setErrorForm("");
  };

  /* ── Reset form ── */
  const resetForm = () => {
    setForm({ nama: "", username: "", password: "", konfirmasiPassword: "" });
    setErrorForm("");
    setShowPass(false);
    setShowKonfirmasi(false);
  };

  /* ── Submit tambah admin ── */
  const handleTambah = async (e) => {
    e.preventDefault();
    setErrorForm("");
    setSuksesForm("");

    const username = form.username.trim();
    const nama = form.nama.trim();
    const password = form.password;
    const konfirmasi = form.konfirmasiPassword;

    // Validasi sisi client
    if (!username || !password) {
      return setErrorForm("Username dan password wajib diisi.");
    }
    if (username.length < 3) {
      return setErrorForm("Username minimal 3 karakter.");
    }
    if (!/^[a-zA-Z0-9_.]+$/.test(username)) {
      return setErrorForm(
        "Username hanya boleh mengandung huruf, angka, titik, atau underscore."
      );
    }
    if (password.length < 6) {
      return setErrorForm("Password minimal 6 karakter.");
    }
    if (konfirmasi && password !== konfirmasi) {
      return setErrorForm("Konfirmasi password tidak cocok.");
    }

    try {
      setLoadingTambah(true);
      const res = await api.post("/auth/tambah-admin", {
        username,
        nama: nama || username,
        password,
        konfirmasiPassword: konfirmasi,
      });
      setSuksesForm(res.data?.message || "Akun admin berhasil dibuat.");
      resetForm();
      // Refresh daftar
      await fetchDaftarAdmin();
      // Auto-hide pesan sukses setelah 4 detik
      setTimeout(() => setSuksesForm(""), 4000);
    } catch (err) {
      setErrorForm(
        err.response?.data?.message || "Gagal membuat akun admin baru."
      );
    } finally {
      setLoadingTambah(false);
    }
  };

  /* ── Hapus admin ── */
  const handleKonfirmasiHapus = async () => {
    if (!adminYangDihapus) return;
    try {
      setLoadingHapus(true);
      const res = await api.delete(`/auth/hapus-admin/${adminYangDihapus.id}`);
      setSuksesForm(res.data?.message || "Akun admin berhasil dihapus.");
      setAdminYangDihapus(null);
      await fetchDaftarAdmin();
      setTimeout(() => setSuksesForm(""), 4000);
    } catch (err) {
      setErrorForm(
        err.response?.data?.message || "Gagal menghapus akun admin."
      );
      setAdminYangDihapus(null);
    } finally {
      setLoadingHapus(false);
    }
  };

  /* ── Format tanggal ── */
  const formatTanggal = (iso) => {
    if (!iso) return "-";
    return new Date(iso).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6 font-['Inter',sans-serif]">
      {/* ── Judul & Breadcrumb ── */}
      <div>
        <nav aria-label="Breadcrumb" className="mb-3 text-[15px] text-[#7b8da6]">
          <Link to="/admin/dashboard" className="hover:text-[#1767a8]">
            Dashboard
          </Link>{" "}
          / <span>Kelola Admin</span>
        </nav>
        <h1 className="font-['Poppins',sans-serif] text-[28px] font-bold leading-tight text-[#12263f] lg:text-[36px]">
          Kelola Akun Admin
        </h1>
        <p className="mt-1 text-base text-[#5b7794] lg:text-lg">
          Tambah atau hapus akun administrator sistem Tracer Study.
        </p>
      </div>

      {/* ── Notifikasi global ── */}
      {suksesForm && (
        <div
          role="status"
          className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-[15px] text-green-800"
        >
          {suksesForm}
        </div>
      )}

      {/* ── Form Tambah Admin ── */}
      <section className={`${card} p-6 lg:p-8`} aria-labelledby="judul-tambah">
        <div className="flex items-center gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-2xl bg-[#e9f3fd] text-[#1767a8]">
            <UserPlusIcon />
          </div>
          <div>
            <h2
              id="judul-tambah"
              className="font-['Poppins',sans-serif] text-xl font-bold text-[#12263f]"
            >
              Tambah Akun Admin Baru
            </h2>
            <p className="text-[14px] text-[#5b7794]">
              Akun baru otomatis mendapat role <strong>Administrator</strong>.
            </p>
          </div>
        </div>

        {errorForm && (
          <div
            role="alert"
            className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-[15px] text-red-700"
          >
            {errorForm}
          </div>
        )}

        <form onSubmit={handleTambah} noValidate>
          <div className="mt-6 grid gap-5 lg:grid-cols-2">
            {/* Nama Lengkap */}
            <div>
              <label htmlFor="nama" className={labelCls}>
                Nama Lengkap <span className="font-normal text-[#8a9bb0]">(opsional)</span>
              </label>
              <input
                id="nama"
                type="text"
                placeholder="Contoh: Budi Santoso"
                value={form.nama}
                onChange={ubah("nama")}
                autoComplete="off"
                className={fieldCls}
              />
            </div>

            {/* Username */}
            <div>
              <label htmlFor="username" className={labelCls}>
                Username <span className="text-red-500">*</span>
              </label>
              <input
                id="username"
                type="text"
                placeholder="Huruf, angka, titik, underscore"
                value={form.username}
                onChange={ubah("username")}
                autoComplete="off"
                required
                className={fieldCls}
              />
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className={labelCls}>
                Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPass ? "text" : "password"}
                  placeholder="Minimal 6 karakter"
                  value={form.password}
                  onChange={ubah("password")}
                  autoComplete="new-password"
                  required
                  className={`${fieldCls} pr-12`}
                />
                <button
                  type="button"
                  onClick={() => setShowPass((v) => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  aria-label={showPass ? "Sembunyikan password" : "Tampilkan password"}
                >
                  <EyeIcon show={showPass} />
                </button>
              </div>
            </div>

            {/* Konfirmasi Password */}
            <div>
              <label htmlFor="konfirmasiPassword" className={labelCls}>
                Konfirmasi Password
              </label>
              <div className="relative">
                <input
                  id="konfirmasiPassword"
                  type={showKonfirmasi ? "text" : "password"}
                  placeholder="Ulangi password"
                  value={form.konfirmasiPassword}
                  onChange={ubah("konfirmasiPassword")}
                  autoComplete="new-password"
                  className={`${fieldCls} pr-12`}
                />
                <button
                  type="button"
                  onClick={() => setShowKonfirmasi((v) => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  aria-label={showKonfirmasi ? "Sembunyikan konfirmasi" : "Tampilkan konfirmasi"}
                >
                  <EyeIcon show={showKonfirmasi} />
                </button>
              </div>
            </div>
          </div>

          {/* Keterangan role */}
          <div className="mt-4 rounded-xl border border-[#dbeafe] bg-[#eff6ff] px-4 py-3 text-[14px] text-[#1e40af]">
            <strong>Catatan:</strong> Role akun baru dikunci sebagai{" "}
            <strong>Administrator</strong>. Tidak ada role yang lebih tinggi
            yang bisa ditetapkan melalui form ini.
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <button
              type="button"
              onClick={resetForm}
              disabled={loadingTambah}
              className={btnOutline}
            >
              Reset
            </button>
            <button
              type="submit"
              disabled={loadingTambah}
              className={`${btnSolid} flex items-center gap-2`}
            >
              {loadingTambah ? (
                "Menyimpan..."
              ) : (
                <>
                  <UserPlusIcon />
                  Tambah Admin
                </>
              )}
            </button>
          </div>
        </form>
      </section>

      {/* ── Daftar Admin ── */}
      <section className={`${card} p-6 lg:p-8`} aria-labelledby="judul-daftar">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2
              id="judul-daftar"
              className="font-['Poppins',sans-serif] text-xl font-bold text-[#12263f]"
            >
              Daftar Akun Admin
            </h2>
            <p className="text-[14px] text-[#5b7794]">
              Total {daftarAdmin.length} akun administrator terdaftar.
            </p>
          </div>
          <button
            type="button"
            onClick={fetchDaftarAdmin}
            disabled={loadingList}
            className="h-10 rounded-xl border border-[#cbd5e1] bg-white px-4 text-[14px] font-semibold text-[#1767a8] transition-colors hover:bg-[#f1f5f9] disabled:opacity-50"
          >
            {loadingList ? "Memuat..." : "Refresh"}
          </button>
        </div>

        {errorList && (
          <div
            role="alert"
            className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-[15px] text-red-700"
          >
            {errorList}
          </div>
        )}

        {loadingList ? (
          <div className="mt-8 py-10 text-center text-[#5b7794]">
            Memuat daftar akun admin...
          </div>
        ) : daftarAdmin.length === 0 ? (
          <div className="mt-8 py-10 text-center text-[#5b7794]">
            Belum ada akun admin terdaftar.
          </div>
        ) : (
          <div className="mt-5 overflow-x-auto">
            <table className="w-full min-w-[540px] border-collapse text-sm">
              <thead>
                <tr className="border-b border-[#e6edf5]">
                  <th className="py-3 pr-4 text-left font-['Poppins',sans-serif] text-[13px] font-semibold uppercase tracking-wide text-[#8a9bb0]">
                    Admin
                  </th>
                  <th className="py-3 pr-4 text-left font-['Poppins',sans-serif] text-[13px] font-semibold uppercase tracking-wide text-[#8a9bb0]">
                    Username
                  </th>
                  <th className="py-3 pr-4 text-left font-['Poppins',sans-serif] text-[13px] font-semibold uppercase tracking-wide text-[#8a9bb0]">
                    Role
                  </th>
                  <th className="py-3 pr-4 text-left font-['Poppins',sans-serif] text-[13px] font-semibold uppercase tracking-wide text-[#8a9bb0]">
                    Dibuat
                  </th>
                  <th className="py-3 text-right font-['Poppins',sans-serif] text-[13px] font-semibold uppercase tracking-wide text-[#8a9bb0]">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody>
                {daftarAdmin.map((adm) => {
                  const isSelf = adm.id === myAdminId;
                  return (
                    <tr
                      key={adm.id}
                      className="border-b border-[#f0f5fb] last:border-0 hover:bg-[#fafcff]"
                    >
                      {/* Avatar + Nama */}
                      <td className="py-3.5 pr-4">
                        <div className="flex items-center gap-3">
                          <div className="grid h-9 w-9 flex-none place-items-center rounded-full bg-[#e0e7ff] font-['Poppins',sans-serif] text-[13px] font-bold text-[#1767a8]">
                            {inisial(adm.nama || adm.username)}
                          </div>
                          <div>
                            <div className="font-semibold text-[#12263f]">
                              {adm.nama || adm.username}
                              {isSelf && (
                                <span className="ml-2 inline-block rounded-full bg-[#e0e7ff] px-2 py-0.5 text-[11px] font-semibold text-[#1767a8]">
                                  Anda
                                </span>
                              )}
                            </div>
                            {adm.email && (
                              <div className="text-[12px] text-[#8a9bb0]">
                                {adm.email}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Username */}
                      <td className="py-3.5 pr-4">
                        <code className="rounded bg-slate-100 px-2 py-0.5 text-[13px] text-[#334155]">
                          {adm.username}
                        </code>
                      </td>

                      {/* Role */}
                      <td className="py-3.5 pr-4">
                        <span className="inline-block rounded-full bg-[#eff6ff] px-3 py-0.5 text-[13px] font-semibold text-[#1e40af]">
                          {adm.role || "Administrator"}
                        </span>
                      </td>

                      {/* Tanggal dibuat */}
                      <td className="py-3.5 pr-4 text-[13px] text-[#5b7794]">
                        {formatTanggal(adm.created_at)}
                      </td>

                      {/* Tombol hapus */}
                      <td className="py-3.5 text-right">
                        {isSelf ? (
                          <span className="text-[13px] text-[#a0b0c5]">—</span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setAdminYangDihapus(adm)}
                            className={btnDanger}
                            aria-label={`Hapus akun ${adm.username}`}
                          >
                            <span className="flex items-center gap-1.5">
                              <TrashIcon />
                              Hapus
                            </span>
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* ── Modal konfirmasi hapus ── */}
      {adminYangDihapus && (
        <ModalKonfirmasiHapus
          admin={adminYangDihapus}
          onBatal={() => setAdminYangDihapus(null)}
          onKonfirmasi={handleKonfirmasiHapus}
          loading={loadingHapus}
        />
      )}
    </div>
  );
}
