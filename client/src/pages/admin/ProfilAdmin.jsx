import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../api/axios";

const inisial = (nama) =>
  (nama || "A")
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

const API_BASE_URL = "http://localhost:5000";

const getFotoUrl = (foto) => {
  if (!foto) return null;
  if (
    foto.startsWith("http://") ||
    foto.startsWith("https://") ||
    foto.startsWith("blob:") ||
    foto.startsWith("data:")
  ) {
    return foto;
  }
  return `${API_BASE_URL}${foto.startsWith("/") ? "" : "/"}${foto}`;
};

/* ---------- Avatar ---------- */
const Avatar = ({ foto, ukuran = "h-14 w-14", children }) => {
  const [imgError, setImgError] = useState(false);
  const url = getFotoUrl(foto);

  useEffect(() => {
    setImgError(false);
  }, [foto]);

  return (
    <div
      className={`${ukuran} grid flex-none place-items-center overflow-hidden rounded-full bg-[#e0e7ff] text-[#1767a8]`}
    >
      {url && !imgError ? (
        <img
          src={url}
          alt="Foto profil"
          className="h-full w-full object-cover"
          onError={() => setImgError(true)}
        />
      ) : (
        children
      )}
    </div>
  );
};

const CameraIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
    <circle cx="12" cy="13" r="4" />
  </svg>
);

const PersonIcon = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="#1e40af" aria-hidden="true">
    <circle cx="12" cy="8" r="4.5" />
    <path d="M3.500 21c0-4 3.800-6.500 8.500-6.500s8.500 2.500 8.500 6.500c0 .6-.4 1-1 1h-15c-.6 0-1-.4-1-1z" />
  </svg>
);

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

/* ---------- Modal Edit Profil ---------- */
function ModalEdit({ profil, onClose, onSimpan }) {
  const [form, setForm] = useState({
    nama: profil.nama || "",
    username: profil.username || "",
    email: profil.email || "",
    telepon: profil.telepon || "",
  });
  const [fotoPreview, setFotoPreview] = useState(profil.foto || null);
  const [fotoFile, setFotoFile] = useState(null);
  const [hapusFoto, setHapusFoto] = useState(false);
  const inputFoto = useRef(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  const ubah = (k) => (e) => {
    setForm({ ...form, [k]: e.target.value });
    setError("");
  };

  const pilihFoto = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("File yang dipilih harus berupa gambar (JPG, PNG, GIF, WEBP).");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Ukuran gambar maksimal 5MB.");
      return;
    }

    setError("");
    setFotoFile(file);
    setFotoPreview(URL.createObjectURL(file));
    setHapusFoto(false);
  };

  const handleHapusFoto = () => {
    setFotoFile(null);
    setFotoPreview(null);
    setHapusFoto(true);
    if (inputFoto.current) {
      inputFoto.current.value = "";
    }
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!form.username.trim()) {
      return setError("Username tidak boleh kosong.");
    }
    setLoading(true);
    try {
      await onSimpan({
        ...profil,
        nama: form.nama.trim() || profil.nama,
        username: form.username.trim(),
        email: form.email.trim(),
        telepon: form.telepon.trim(),
        fotoFile,
        hapusFoto,
      });
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || "Gagal menyimpan perubahan.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="judul-edit"
    >
      <div onClick={onClose} className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm" />
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

          {error && (
            <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {/* Foto */}
          <div className="mt-7 flex flex-wrap items-center gap-5">
            <Avatar foto={fotoPreview} ukuran="h-[84px] w-[84px]">
              <span className="font-['Poppins',sans-serif] text-[28px] font-bold text-[#1767a8]">
                {inisial(form.nama || profil.nama)}
              </span>
            </Avatar>
            <div>
              <div className="font-['Poppins',sans-serif] text-lg font-semibold text-[#12263f]">
                Foto Profil
              </div>
              <div className="text-[15px] text-[#5b7794]">
                Unggah foto baru (maks. 5MB, format JPG/PNG/WEBP)
              </div>
              <input
                ref={inputFoto}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                onChange={pilihFoto}
                className="hidden"
              />
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => inputFoto.current?.click()}
                  className="h-10 rounded-xl border border-[#cbd5e1] bg-white px-5 text-[15px] font-medium text-[#1767a8] transition-colors hover:bg-[#f1f5f9]"
                >
                  {fotoPreview ? "Ganti Foto" : "Pilih Foto"}
                </button>
                {fotoPreview && (
                  <button
                    type="button"
                    onClick={handleHapusFoto}
                    className="h-10 rounded-xl border border-red-200 bg-red-50 px-4 text-[15px] font-medium text-red-600 transition-colors hover:bg-red-100"
                  >
                    Hapus Foto
                  </button>
                )}
              </div>
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
              placeholder="Masukkan gmail"
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
              disabled={loading}
              className={`${btnOutline} flex-1 sm:flex-none sm:px-9`}
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`${btnSolid} flex-1 sm:flex-none sm:px-10`}
            >
              {loading ? "Menyimpan..." : "Simpan"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ---------- Modal Ubah Password ---------- */
function ModalUbahPassword({ onClose, onSukses }) {
  const [form, setForm] = useState({
    passwordLama: "",
    passwordBaru: "",
    konfirmasiPassword: "",
  });
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  const ubah = (k) => (e) => {
    setForm({ ...form, [k]: e.target.value });
    setError("");
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!form.passwordLama || !form.passwordBaru || !form.konfirmasiPassword) {
      return setError("Semua kolom password wajib diisi.");
    }
    if (form.passwordBaru.length < 6) {
      return setError("Password baru minimal 6 karakter.");
    }
    if (form.passwordBaru !== form.konfirmasiPassword) {
      return setError("Konfirmasi password baru tidak cocok.");
    }

    try {
      setLoading(true);
      setError("");
      const res = await api.put("/auth/ubah-password", {
        passwordLama: form.passwordLama,
        passwordBaru: form.passwordBaru,
        konfirmasiPassword: form.konfirmasiPassword,
      });
      onSukses(
        res.data?.message ||
          "Password berhasil diperbarui! Gunakan password baru ini saat login berikutnya."
      );
      onClose();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Gagal mengubah password. Pastikan password lama benar."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="judul-ubah-password"
    >
      <div onClick={onClose} className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm" />
      <div className="relative flex min-h-full items-start justify-center p-4 lg:items-center">
        <form
          onSubmit={submit}
          className={`${card} relative w-full max-w-lg p-6 shadow-2xl lg:p-8`}
        >
          <h2
            id="judul-ubah-password"
            className="font-['Poppins',sans-serif] text-[24px] font-bold text-[#12263f]"
          >
            Ubah Password Admin
          </h2>
          <p className="mt-1 text-sm text-[#5b7794]">
            Pastikan password baru Anda aman dan mudah diingat.
          </p>

          {error && (
            <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="mt-5 space-y-4">
            {/* Password Lama */}
            <div>
              <label
                htmlFor="passwordLama"
                className={`${labelCls} font-['Poppins',sans-serif] font-semibold text-[#12263f]`}
              >
                Password Lama
              </label>
              <div className="relative">
                <input
                  id="passwordLama"
                  type={showOld ? "text" : "password"}
                  placeholder="Masukkan password saat ini"
                  value={form.passwordLama}
                  onChange={ubah("passwordLama")}
                  className={`${fieldCls} pr-12`}
                />
                <button
                  type="button"
                  onClick={() => setShowOld(!showOld)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  aria-label="Toggle password lama"
                >
                  <EyeIcon show={showOld} />
                </button>
              </div>
            </div>

            {/* Password Baru */}
            <div>
              <label
                htmlFor="passwordBaru"
                className={`${labelCls} font-['Poppins',sans-serif] font-semibold text-[#12263f]`}
              >
                Password Baru
              </label>
              <div className="relative">
                <input
                  id="passwordBaru"
                  type={showNew ? "text" : "password"}
                  placeholder="Minimal 6 karakter"
                  value={form.passwordBaru}
                  onChange={ubah("passwordBaru")}
                  className={`${fieldCls} pr-12`}
                />
                <button
                  type="button"
                  onClick={() => setShowNew(!showNew)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  aria-label="Toggle password baru"
                >
                  <EyeIcon show={showNew} />
                </button>
              </div>
            </div>

            {/* Konfirmasi Password */}
            <div>
              <label
                htmlFor="konfirmasiPassword"
                className={`${labelCls} font-['Poppins',sans-serif] font-semibold text-[#12263f]`}
              >
                Konfirmasi Password Baru
              </label>
              <div className="relative">
                <input
                  id="konfirmasiPassword"
                  type={showConfirm ? "text" : "password"}
                  placeholder="Ulangi password baru"
                  value={form.konfirmasiPassword}
                  onChange={ubah("konfirmasiPassword")}
                  className={`${fieldCls} pr-12`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  aria-label="Toggle konfirmasi password"
                >
                  <EyeIcon show={showConfirm} />
                </button>
              </div>
            </div>
          </div>

          <div className="mt-8 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className={`${btnOutline} flex-1 sm:flex-none sm:px-8`}
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`${btnSolid} flex-1 sm:flex-none sm:px-9`}
            >
              {loading ? "Menyimpan..." : "Simpan Password"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ---------- Halaman Utama ---------- */
export default function Profil() {
  const [profil, setProfil] = useState({
    nama: "",
    username: "",
    email: "",
    telepon: "",
    role: "Administrator",
    status: "Aktif",
    terakhirLogin: "-",
    foto: null,
  });
  const [loading, setLoading] = useState(true);
  const [edit, setEdit] = useState(false);
  const [modalPassword, setModalPassword] = useState(false);
  const [pesan, setPesan] = useState("");
  const [tipePesan, setTipePesan] = useState("sukses"); // "sukses" | "error"

  // Load profil dari API saat halaman dibuka
  useEffect(() => {
    const fetchProfil = async () => {
      try {
        setLoading(true);
        const res = await api.get("/auth/profil");
        setProfil((prev) => ({
          ...prev,
          ...res.data,
          status: "Aktif",
          terakhirLogin: prev.terakhirLogin,
          foto: res.data?.foto || null,
        }));
      } catch (err) {
        tampilPesan(
          err.response?.data?.message || "Gagal memuat data profil.",
          "error"
        );
      } finally {
        setLoading(false);
      }
    };
    fetchProfil();
  }, []);

  const tampilPesan = (msg, tipe = "sukses") => {
    setTipePesan(tipe);
    setPesan(msg);
    setTimeout(() => setPesan(""), 4000);
  };

  const quickInputFoto = useRef(null);

  // Quick upload foto langsung dari avatar di halaman profil
  const handleQuickUploadFoto = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      return tampilPesan("File harus berupa gambar (JPG, PNG, GIF, WEBP).", "error");
    }

    if (file.size > 5 * 1024 * 1024) {
      return tampilPesan("Ukuran gambar maksimal 5MB.", "error");
    }

    try {
      const formData = new FormData();
      formData.append("foto", file);
      const res = await api.post("/auth/profil/foto", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const fotoUrl = res.data?.foto || res.data?.profil?.foto;
      setProfil((prev) => ({
        ...prev,
        foto: fotoUrl,
      }));
      tampilPesan("Foto profil berhasil diperbarui!");
    } catch (err) {
      tampilPesan(
        err.response?.data?.message || "Gagal mengunggah foto profil.",
        "error"
      );
    } finally {
      if (quickInputFoto.current) quickInputFoto.current.value = "";
    }
  };

  // Quick hapus foto langsung dari halaman profil
  const handleQuickHapusFoto = async () => {
    if (!window.confirm("Apakah Anda yakin ingin menghapus foto profil?")) return;
    try {
      await api.delete("/auth/profil/foto");
      setProfil((prev) => ({
        ...prev,
        foto: null,
      }));
      tampilPesan("Foto profil berhasil dihapus.");
    } catch (err) {
      tampilPesan(
        err.response?.data?.message || "Gagal menghapus foto profil.",
        "error"
      );
    }
  };

  // Simpan perubahan profil ke API
  const simpan = async (dataBaru) => {
    try {
      const formData = new FormData();
      formData.append("nama", dataBaru.nama);
      formData.append("username", dataBaru.username);
      formData.append("email", dataBaru.email);
      formData.append("telepon", dataBaru.telepon);
      formData.append("role", dataBaru.role || "Administrator");

      if (dataBaru.fotoFile) {
        formData.append("foto", dataBaru.fotoFile);
      } else if (dataBaru.hapusFoto) {
        formData.append("hapusFoto", "true");
      }

      const res = await api.put("/auth/profil", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const profilTerbaru = res.data?.profil || dataBaru;
      setProfil((prev) => ({
        ...prev,
        ...profilTerbaru,
        status: "Aktif",
        terakhirLogin: prev.terakhirLogin,
        foto: profilTerbaru.foto !== undefined ? profilTerbaru.foto : prev.foto,
      }));

      // Update localStorage agar konsisten dengan username baru
      if (profilTerbaru.username) {
        localStorage.setItem("admin_user", profilTerbaru.username);
      }

      setEdit(false);
      tampilPesan("Profil berhasil diperbarui.");
    } catch (err) {
      setEdit(false);
      tampilPesan(
        err.response?.data?.message || "Gagal menyimpan profil.",
        "error"
      );
    }
  };

  const fields = [
    { label: "Nama", value: profil.nama || "-", id: "f-nama" },
    { label: "Username", value: profil.username || "-", id: "f-username" },
    { label: "Email", value: profil.email || "-", id: "f-email" },
    { label: "Role / Hak Akses", value: profil.role || "Administrator", id: "f-role", redup: true },
  ];

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl py-20 text-center font-['Inter',sans-serif] text-[#5b7794]">
        <div className="text-lg">Memuat data profil...</div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-5 font-['Inter',sans-serif]">
      {/* Judul */}
      <div>
        <nav aria-label="Breadcrumb" className="mb-3 text-[15px] text-[#7b8da6]">
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

      {/* Notifikasi */}
      {pesan && (
        <div
          role="status"
          className={`rounded-xl border px-4 py-3 text-[15px] ${
            tipePesan === "error"
              ? "border-red-200 bg-red-50 text-red-800"
              : "border-green-200 bg-green-50 text-green-800"
          }`}
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
          <div className="relative group">
            <Avatar foto={profil.foto} ukuran="h-16 w-16 lg:h-20 lg:w-20">
              <span className="font-['Poppins',sans-serif] text-2xl lg:text-3xl font-bold text-[#1767a8]">
                {inisial(profil.nama || profil.username)}
              </span>
            </Avatar>
            <input
              ref={quickInputFoto}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              onChange={handleQuickUploadFoto}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => quickInputFoto.current?.click()}
              title="Ganti foto profil"
              aria-label="Ganti foto profil"
              className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-[#1767a8] text-white shadow-md transition-transform hover:scale-110 hover:bg-[#12558c]"
            >
              <CameraIcon />
            </button>
          </div>
          <div>
            <div className="font-['Poppins',sans-serif] text-xl font-bold text-[#12263f]">
              {profil.nama || profil.username}
            </div>
            <div className="text-base text-[#5b7794]">{profil.role}</div>
            <div className="mt-2 flex flex-wrap items-center gap-2.5">
              <span className="inline-block rounded-full bg-[#dcfce7] px-4 py-1 font-['Poppins',sans-serif] text-[14px] font-semibold text-[#166534]">
                Akun Aktif
              </span>
              <button
                type="button"
                onClick={() => quickInputFoto.current?.click()}
                className="text-xs font-semibold text-[#1767a8] hover:underline"
              >
                Ubah Foto
              </button>
              {profil.foto && (
                <button
                  type="button"
                  onClick={handleQuickHapusFoto}
                  className="text-xs font-semibold text-red-500 hover:underline"
                >
                  Hapus Foto
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-4 border-t border-[#e6edf5] pt-4">
          <div>
            <div className="text-[13px] uppercase tracking-wide text-[#8a9bb0]">Status Akun</div>
            <div className="font-['Poppins',sans-serif] text-lg font-bold text-[#166534]">
              {profil.status}
            </div>
          </div>
          <div>
            <div className="text-[13px] uppercase tracking-wide text-[#8a9bb0]">Terakhir Login</div>
            <div className="text-base text-[#12263f]">{profil.terakhirLogin}</div>
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
          <button
            type="button"
            onClick={() => setModalPassword(true)}
            className={btnOutline}
          >
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

      {modalPassword && (
        <ModalUbahPassword
          onClose={() => setModalPassword(false)}
          onSukses={(msg) => tampilPesan(msg)}
        />
      )}
    </div>
  );
}
