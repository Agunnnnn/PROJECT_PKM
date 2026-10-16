import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

// ============================================================
// DATA CONTOH - nanti ganti dengan data dari backend
// Contoh: GET /api/admin/profil  |  PUT /api/admin/profil
// ============================================================
const profilAwal = {
  nama: "Admin Tracer Study",
  username: "admin_tracer",
  email: "admin@sekolah.sch.id",
  telepon: "",
  role: "Administrator",
  status: "Aktif",
  terakhirLogin: "10 Okt 2026, 08.30 WIB",
  foto: null, // URL foto, atau null untuk memakai ikon/inisial
};

const inisial = (nama) =>
  nama
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((k) => k[0].toUpperCase())
    .join("");

/* ---------- Gaya bersama ---------- */
const card = "rounded-3xl border border-[#d9e6f5] bg-white";
const labelCls = "mb-2 block text-[15px] text-[#4a5b73]";
const fieldCls =
  "h-[52px] w-full rounded-xl border border-[#cbd5e1] bg-white px-4 text-base text-[#12263f] placeholder:text-[#6b7f99] focus:border-[#1767a8] focus:outline-none focus:ring-4 focus:ring-[#1767a8]/15";
const btnOutline =
  "h-[52px] rounded-xl border border-[#cbd5e1] bg-white px-6 font-['Poppins',sans-serif] text-[15px] font-semibold text-[#12263f] transition-colors hover:bg-[#f1f5f9]";
const btnSolid =
  "h-[52px] rounded-xl bg-[#1767a8] px-6 font-['Poppins',sans-serif] text-[15px] font-semibold text-white transition-colors hover:bg-[#12558c] focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-[#8cc1ee]";

/* ---------- Avatar ---------- */
const Avatar = ({ foto, ukuran = "h-14 w-14", children }) => (
  <div
    className={`${ukuran} grid flex-none place-items-center overflow-hidden rounded-full bg-[#e0e7ff]`}
  >
    {foto ? (
      <img
        src={foto}
        alt="Foto profil"
        className="h-full w-full object-cover"
      />
    ) : (
      children
    )}
  </div>
);

const PersonIcon = () => (
  <svg
    width="32"
    height="32"
    viewBox="0 0 24 24"
    fill="#1e40af"
    aria-hidden="true"
  >
    <circle cx="12" cy="8" r="4.5" />
    <path d="M3.500 21c0-4 3.800-6.500 8.500-6.500s8.500 2.500 8.500 6.500c0 .6-.4 1-1 1h-15c-.6 0-1-.4-1-1z" />
  </svg>
);

/* ---------- Modal Edit Profil ---------- */
function ModalEdit({ profil, onClose, onSimpan }) {
  const [form, setForm] = useState({
    nama: profil.nama,
    username: profil.username,
    email: "",
    telepon: "",
  });
  const [foto, setFoto] = useState(profil.foto);
  const inputFoto = useRef(null);

  // Tutup dengan Esc + kunci scroll
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  const ubah = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const pilihFoto = (e) => {
    const file = e.target.files?.[0];
    if (file) setFoto(URL.createObjectURL(file)); // TODO: simpan `file` untuk diunggah ke backend
  };

  const submit = (e) => {
    e.preventDefault();
    onSimpan({
      ...profil,
      nama: form.nama.trim() || profil.nama,
      username: form.username.trim() || profil.username,
      // Kolom yang dikosongkan = tidak diubah
      email: form.email.trim() || profil.email,
      telepon: form.telepon.trim() || profil.telepon,
      foto,
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="judul-edit"
    >
      <div
        onClick={onClose}
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm"
      />

      <div className="relative flex min-h-full items-start justify-center p-4 lg:items-center">
        <form
          onSubmit={submit}
          className={`${card} relative w-full max-w-3xl p-6 shadow-2xl lg:p-8`}
        >
          <h2
            id="judul-edit"
            className="font-['Poppins',sans-serif] text-[26px] font-bold text-[#12263f]"
          >
            Edit Profil Admin
          </h2>
          <p className="mt-1 text-base text-[#5b7794]">
            Perbarui informasi akun administrator.
          </p>

          {/* Foto */}
          <div className="mt-7 flex items-center gap-5">
            <Avatar foto={foto} ukuran="h-[84px] w-[84px]">
              <span className="font-['Poppins',sans-serif] text-[28px] font-bold text-[#1767a8]">
                {inisial(form.nama || profil.nama)}
              </span>
            </Avatar>
            <div>
              <div className="font-['Poppins',sans-serif] text-lg font-semibold text-[#12263f]">
                Foto Profil
              </div>
              <div className="text-[15px] text-[#5b7794]">
                Unggah foto baru (opsional)
              </div>
              <input
                ref={inputFoto}
                type="file"
                accept="image/*"
                onChange={pilihFoto}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => inputFoto.current?.click()}
                className="mt-2 h-10 rounded-xl border border-[#cbd5e1] bg-white px-6 text-[15px] text-[#1767a8] hover:bg-[#f1f5f9]"
              >
                Pilih Foto
              </button>
            </div>
          </div>

          {/* Field */}
          <div className="mt-7 grid gap-5 lg:grid-cols-2">
            <div>
              <label
                htmlFor="nama"
                className={`${labelCls} font-['Poppins',sans-serif] font-semibold text-[#12263f]`}
              >
                Nama Lengkap
              </label>
              <input
                id="nama"
                value={form.nama}
                onChange={ubah("nama")}
                className={fieldCls}
              />
            </div>
            <div>
              <label
                htmlFor="username"
                className={`${labelCls} font-['Poppins',sans-serif] font-semibold text-[#12263f]`}
              >
                Username
              </label>
              <input
                id="username"
                value={form.username}
                onChange={ubah("username")}
                className={fieldCls}
              />
            </div>
          </div>

          <div className="mt-5">
            <label
              htmlFor="gmail"
              className={`${labelCls} font-['Poppins',sans-serif] font-semibold text-[#12263f]`}
            >
              Gmail
            </label>
            <input
              id="gmail"
              type="email"
              placeholder="Masukkan gmail baru"
              value={form.email}
              onChange={ubah("email")}
              className={fieldCls}
            />
          </div>

          <div className="mt-5">
            <label
              htmlFor="telepon"
              className={`${labelCls} font-['Poppins',sans-serif] font-semibold text-[#12263f]`}
            >
              Nomor Telepon (opsional)
            </label>
            <input
              id="telepon"
              type="tel"
              placeholder="Masukkan nomor telepon"
              value={form.telepon}
              onChange={ubah("telepon")}
              className={fieldCls}
            />
          </div>

          <div className="mt-8 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className={`${btnOutline} flex-1 sm:flex-none sm:px-9`}
            >
              Batal
            </button>
            <button
              type="submit"
              className={`${btnSolid} flex-1 sm:flex-none sm:px-10`}
            >
              Simpan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ---------- Halaman ---------- */
export default function Profil() {
  const [profil, setProfil] = useState(profilAwal); // TODO: ambil dari API
  const [edit, setEdit] = useState(false);
  const [pesan, setPesan] = useState("");

  const simpan = (dataBaru) => {
    // TODO: kirim ke backend (PUT /api/admin/profil), lalu perbarui state
    setProfil(dataBaru);
    setEdit(false);
    setPesan("Profil berhasil diperbarui.");
    setTimeout(() => setPesan(""), 3000);
  };

  const ubahPassword = () => {
    // TODO: arahkan ke halaman / modal ubah password
    alert("Fitur ubah password belum tersedia.");
  };

  const fields = [
    { label: "Nama", value: profil.nama, id: "f-nama" },
    { label: "Username", value: profil.username, id: "f-username" },
    { label: "Email", value: profil.email, id: "f-email" },
    {
      label: "Role / Hak Akses",
      value: profil.role,
      id: "f-role",
      redup: true,
    },
  ];

  return (
    <div className="mx-auto max-w-3xl space-y-5 font-['Inter',sans-serif]">
      {/* Judul */}
      <div>
        <nav
          aria-label="Breadcrumb"
          className="mb-3 text-[15px] text-[#7b8da6]"
        >
          <Link to="/admin/dashboard" className="hover:text-[#1767a8]">
            Dashboard
          </Link>{" "}
          / <span>Profil Admin</span>
        </nav>
        <h1 className="font-['Poppins',sans-serif] text-[28px] font-bold leading-tight text-[#12263f] lg:text-[36px]">
          Profil Admin
        </h1>
        <p className="mt-1 text-base text-[#5b7794] lg:text-lg">
          Kelola informasi akun administrator Tracer Study.
        </p>
      </div>

      {pesan && (
        <div
          role="status"
          className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-[15px] text-green-800"
        >
          {pesan}
        </div>
      )}

      {/* Informasi akun */}
      <section className={`${card} p-6 lg:p-8`}>
        <h2 className="font-['Poppins',sans-serif] text-xl font-bold text-[#12263f]">
          Informasi Akun
        </h2>

        <div className="mt-5 flex items-center gap-5">
          <Avatar foto={profil.foto} ukuran="h-14 w-14 lg:h-[72px] lg:w-[72px]">
            <PersonIcon />
          </Avatar>
          <div>
            <div className="font-['Poppins',sans-serif] text-xl font-bold text-[#12263f]">
              {profil.nama}
            </div>
            <div className="text-base text-[#5b7794]">{profil.role}</div>
            <span className="mt-2 inline-block rounded-full bg-[#dcfce7] px-4 py-1 font-['Poppins',sans-serif] text-[14px] font-semibold text-[#166534]">
              Akun Aktif
            </span>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-4 border-t border-[#e6edf5] pt-4">
          <div>
            <div className="text-[13px] uppercase tracking-wide text-[#8a9bb0]">
              Status Akun
            </div>
            <div className="font-['Poppins',sans-serif] text-lg font-bold text-[#166534]">
              {profil.status}
            </div>
          </div>
          <div>
            <div className="text-[13px] uppercase tracking-wide text-[#8a9bb0]">
              Terakhir Login
            </div>
            <div className="text-base text-[#12263f]">
              {profil.terakhirLogin}
            </div>
          </div>
        </div>
      </section>

      {/* Detail profil */}
      <section className={`${card} p-6 lg:p-8`}>
        <h2 className="font-['Poppins',sans-serif] text-xl font-bold text-[#12263f]">
          Detail Profil
        </h2>
        <p className="mt-1 text-base text-[#5b7794]">
          Informasi akun yang terdaftar pada sistem.
        </p>

        <div className="mt-5 grid gap-4 lg:grid-cols-2">
          {fields.map((f) => (
            <div key={f.id}>
              <label htmlFor={f.id} className={labelCls}>
                {f.label}
              </label>
              <input
                id={f.id}
                value={f.value}
                readOnly
                className={`${fieldCls} ${f.redup ? "text-[#4a5b73]" : ""} cursor-default focus:ring-0`}
              />
            </div>
          ))}
        </div>

        <div className="mt-6 grid grid-cols-[1fr_1.4fr] gap-4 border-t border-[#e6edf5] pt-6 lg:ml-auto lg:max-w-md">
          <button type="button" onClick={ubahPassword} className={btnOutline}>
            Ubah Password
          </button>
          <button
            type="button"
            onClick={() => setEdit(true)}
            className={btnSolid}
          >
            Edit Profil
          </button>
        </div>
      </section>

      {edit && (
        <ModalEdit
          profil={profil}
          onClose={() => setEdit(false)}
          onSimpan={simpan}
        />
      )}
    </div>
  );
}
