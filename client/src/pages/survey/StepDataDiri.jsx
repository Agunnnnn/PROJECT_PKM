import { useState } from "react";
import api from "../../api/axios";
import { fieldCls, labelCls } from "./SurveyUi";

// ─── Ikon kunci ───────────────────────────────────────────────────────────────
const LockIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
    aria-hidden="true">
    <rect x="3" y="11" width="18" height="11" rx="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

const UnlockIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
    aria-hidden="true">
    <rect x="3" y="11" width="18" height="11" rx="2" />
    <path d="M7 11V7a5 5 0 0 1 9.9-1" />
  </svg>
);

// ─── Langkah 1: Verifikasi identitas dulu, baru lanjut ke step berikutnya ─────
export default function StepDataDiri({ form, setForm, onVerifikasi }) {
  const [nisInput, setNisInput] = useState("");
  const [tglLahirInput, setTglLahirInput] = useState("");
  const [verifikasi, setVerifikasi] = useState(null);
  const [loadingVerif, setLoadingVerif] = useState(false);
  const [errorVerif, setErrorVerif] = useState("");

  const sudahVerifikasi = verifikasi?.valid === true;

  const handleTglInput = (e) => {
    const val = e.target.value.replace(/\D/g, "").slice(0, 6);
    setTglLahirInput(val);
    setErrorVerif("");
  };

  const handleNisInput = (e) => {
    setNisInput(e.target.value.trim());
    setErrorVerif("");
  };

  const handleVerifikasi = async (e) => {
    e.preventDefault();
    if (!nisInput || !tglLahirInput) {
      return setErrorVerif("NISN dan tanggal lahir wajib diisi.");
    }
    if (tglLahirInput.length !== 6) {
      return setErrorVerif("Tanggal lahir harus 6 digit (contoh: 150106 untuk 15 Jan 2006).");
    }

    setLoadingVerif(true);
    setErrorVerif("");
    try {
      const res = await api.post("/alumni/verifikasi", {
        nis: nisInput,
        tanggalLahir: tglLahirInput,
      });
      setVerifikasi(res.data);
      const a = res.data.alumni;
      setForm((prev) => ({
        ...prev,
        nis: a.nis,
        nama: a.nama,
        jurusan: a.jurusan,
        tahunLulus: String(a.tahunLulus),
      }));
      onVerifikasi?.(true); // BUG-001 fix: beritahu FormSurvey bahwa verifikasi sukses
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        "NISN atau tanggal lahir tidak sesuai. Periksa kembali.";
      setErrorVerif(msg);
      setVerifikasi(null);
      onVerifikasi?.(false);
    } finally {
      setLoadingVerif(false);
    }
  };

  const handleReset = () => {
    setVerifikasi(null);
    setNisInput("");
    setTglLahirInput("");
    setErrorVerif("");
    setForm((prev) => ({ ...prev, jurusan: "", tahunLulus: "", nama: "", nis: "" }));
    onVerifikasi?.(false); // BUG-001 fix: reset flag verifikasi di FormSurvey
  };

  return (
    <div className="space-y-6">
      {/* ── Blok Verifikasi Identitas ── */}
      <div className={`rounded-2xl border p-5 transition-colors ${
        sudahVerifikasi
          ? "border-green-200 bg-green-50"
          : "border-[#d9e6f5] bg-[#f8fafc]"
      }`}>
        <div className="mb-4 flex items-center gap-2">
          <span className={sudahVerifikasi ? "text-green-600" : "text-[#1767a8]"}>
            {sudahVerifikasi ? <UnlockIcon /> : <LockIcon />}
          </span>
          <h3 className="font-['Poppins',sans-serif] text-[15px] font-semibold text-[#12263f]">
            {sudahVerifikasi ? "Identitas Terverifikasi ✓" : "Verifikasi Identitas"}
          </h3>
        </div>

        {sudahVerifikasi ? (
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[14px] text-[#5b7794]">Masuk sebagai</p>
              <p className="font-['Poppins',sans-serif] text-base font-bold text-[#12263f]">
                {verifikasi.alumni.nama}
              </p>
              <p className="text-[13px] text-[#8a9bb0]">NISN: {verifikasi.alumni.nis}</p>
            </div>
            <button
              type="button"
              onClick={handleReset}
              className="text-[13px] font-semibold text-[#1767a8] hover:underline"
            >
              Ganti
            </button>
          </div>
        ) : (
          <form onSubmit={handleVerifikasi} noValidate>
            <p className="mb-4 text-[14px] text-[#5b7794]">
              Masukkan NISN dan tanggal lahir kamu untuk melanjutkan.
            </p>

            {errorVerif && (
              <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-[14px] text-red-700">
                {errorVerif}
              </div>
            )}

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="nis-verif" className={labelCls}>
                  NISN
                </label>
                <input
                  id="nis-verif"
                  type="text"
                  inputMode="numeric"
                  placeholder="Contoh: 0113122701"
                  value={nisInput}
                  onChange={handleNisInput}
                  className={fieldCls}
                  autoComplete="off"
                />
              </div>
              <div>
                <label htmlFor="tgl-lahir-verif" className={labelCls}>
                  Tanggal Lahir <span className="font-normal text-[#5b7794]">(format DDMMYY)</span>
                </label>
                <input
                  id="tgl-lahir-verif"
                  type="text"
                  inputMode="numeric"
                  placeholder="Contoh: 150106"
                  value={tglLahirInput}
                  onChange={handleTglInput}
                  maxLength={6}
                  className={fieldCls}
                  autoComplete="off"
                />
                <p className="mt-1 text-[12px] text-[#8a9bb0]">
                  15 Januari 2006 → <strong>150106</strong>
                </p>
              </div>
            </div>

            <button
              type="submit"
              disabled={loadingVerif || !nisInput || tglLahirInput.length !== 6}
              className="mt-4 h-12 w-full rounded-xl bg-[#1767a8] font-['Poppins',sans-serif] text-[15px] font-semibold text-white transition-colors hover:bg-[#12558c] disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto sm:px-10"
            >
              {loadingVerif ? "Memverifikasi..." : "Verifikasi"}
            </button>
          </form>
        )}
      </div>

      {/* ── Ringkasan data alumni setelah verifikasi ── */}
      {sudahVerifikasi && (
        <div className="rounded-2xl border border-[#d9e6f5] bg-[#f8fafc] p-5">
          <h3 className="mb-3 font-['Poppins',sans-serif] text-[15px] font-semibold text-[#12263f]">
            Data Diri Alumni
          </h3>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <p className="text-[13px] text-[#8a9bb0]">Nama Lengkap</p>
              <p className="font-semibold text-[#12263f]">{verifikasi.alumni.nama}</p>
            </div>
            <div>
              <p className="text-[13px] text-[#8a9bb0]">NISN</p>
              <p className="font-semibold text-[#12263f]">{verifikasi.alumni.nis}</p>
            </div>
            <div>
              <p className="text-[13px] text-[#8a9bb0]">Jurusan</p>
              <p className="font-semibold text-[#12263f]">{verifikasi.alumni.jurusan}</p>
            </div>
            <div>
              <p className="text-[13px] text-[#8a9bb0]">Tahun Lulus</p>
              <p className="font-semibold text-[#12263f]">{verifikasi.alumni.tahunLulus}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
