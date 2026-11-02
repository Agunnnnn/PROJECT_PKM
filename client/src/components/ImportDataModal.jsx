import React, { useEffect, useRef, useState } from "react";
import api from "../api/axios";

export default function ImportDataModal({ onTutup, onBerhasil }) {
  const [file, setFile]               = useState(null);
  const [drag, setDrag]               = useState(false);
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState("");
  const [hasil, setHasil]             = useState(null);
  const [tahunLulus, setTahunLulus]   = useState(new Date().getFullYear());
  const [filterKelas, setFilterKelas] = useState("XII");
  const inputRef                      = useRef(null);

  /* tutup dengan Escape */
  useEffect(() => {
    const h = (e) => { if (e.key === "Escape") onTutup(); };
    document.addEventListener("keydown", h);
    return () => document.removeEventListener("keydown", h);
  }, [onTutup]);

  const resetFile = () => { setFile(null); setError(""); setHasil(null); };

  const validasiFile = (f) => {
    if (!f) return "Pilih file terlebih dahulu.";
    const ext = f.name.split(".").pop().toLowerCase();
    if (!["xlsx", "xls"].includes(ext))
      return "Format file harus .xlsx atau .xls";
    if (f.size > 10 * 1024 * 1024)
      return "Ukuran file maksimal 10 MB.";
    return null;
  };

  const pilihFile = (f) => {
    const err = validasiFile(f);
    if (err) { setError(err); return; }
    setFile(f);
    setError("");
    setHasil(null);
  };

  /* drag & drop */
  const onDrop = (e) => {
    e.preventDefault();
    setDrag(false);
    const f = e.dataTransfer.files[0];
    if (f) pilihFile(f);
  };

  const kirim = async () => {
    const err = validasiFile(file);
    if (err) { setError(err); return; }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("tahunLulus", tahunLulus);
    formData.append("filterKelas", filterKelas);

    try {
      setLoading(true);
      setError("");
      setHasil(null);
      const res = await api.post("/alumni/import-excel", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setHasil(res.data);
    } catch (e) {
      setError(e.response?.data?.message || "Gagal mengimpor data. Coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  const selesai = () => {
    if (hasil) onBerhasil(hasil.message);
    else onTutup();
  };

  /* ── Template download contoh Excel ── */
  const unduhContohExcel = () => {
    const header = "NIS,Nama,Jurusan,Tahun Lulus,Email,No HP\n";
    const contoh = [
      "0011234567,Ahmad Fauzi,Teknik Komputer dan Jaringan,2023,ahmad@email.com,081234567890",
      "0011234568,Siti Rahayu,Rekayasa Perangkat Lunak,2023,siti@email.com,081234567891",
    ].join("\n");
    const blob = new Blob([header + contoh], { type: "text/csv" });
    const url  = URL.createObjectURL(blob);
    const a    = Object.assign(document.createElement("a"), { href: url, download: "contoh-import-alumni.csv" });
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="import-judul"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onTutup(); }}
    >
      <div className="w-full max-w-xl rounded-2xl bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-7 py-5">
          <div className="flex items-center gap-2">
            <h2 id="import-judul" className="text-xl font-bold text-[#12294d]">
              Import Data Alumni / Dapodik
            </h2>
          </div>
          <button
            type="button"
            onClick={onTutup}
            aria-label="Tutup modal"
            className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
              strokeLinecap="round" className="h-5 w-5" aria-hidden="true">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="px-7 py-6 space-y-4">
          {/* Badge Dukungan Dapodik */}
          <div className="flex items-start gap-2.5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs text-emerald-800">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600">
              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p className="font-bold text-emerald-900">Mendukung Ekspor Mentah Dapodik Sekolah!</p>
              <p className="text-emerald-700 mt-0.5">
                Operator tidak perlu merapikan Excel. File langsung dari Dapodik (Daftar Peserta Didik) akan otomatis dideteksi, dipetakan kodenya, dan disaring.
              </p>
            </div>
          </div>

          {/* Opsi Pengaturan Import */}
          {!hasil && (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 rounded-xl border border-slate-100 bg-slate-50/70 p-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Tahun Kelulusan Alumni:
                </label>
                <input
                  type="number"
                  min="1990"
                  max="2100"
                  value={tahunLulus}
                  onChange={(e) => setTahunLulus(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-800 focus:border-[#1769aa] focus:outline-none"
                  placeholder="2024"
                />
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Digunakan untuk data yang tidak memuat tahun lulus.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Filter Kelas (Dapodik):
                </label>
                <select
                  value={filterKelas}
                  onChange={(e) => setFilterKelas(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-800 focus:border-[#1769aa] focus:outline-none"
                >
                  <option value="XII">Hanya Kelas XII (Calon Alumni)</option>
                  <option value="ALL">Semua Kelas (X, XI, XII)</option>
                  <option value="XI">Hanya Kelas XI</option>
                  <option value="X">Hanya Kelas X</option>
                </select>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Otomatis menyaring dari kode Rombel.
                </p>
              </div>
            </div>
          )}

          {/* Area upload */}
          {!hasil && (
            <div
              onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
              onDragLeave={() => setDrag(false)}
              onDrop={onDrop}
              onClick={() => inputRef.current?.click()}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") inputRef.current?.click(); }}
              aria-label="Area upload file, klik atau seret file ke sini"
              className={`flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed px-6 py-8 transition ${
                drag
                  ? "border-[#1769aa] bg-blue-50"
                  : "border-slate-200 bg-slate-50 hover:border-[#1769aa]/60 hover:bg-blue-50/40"
              }`}
            >
              <input
                ref={inputRef}
                type="file"
                accept=".xlsx,.xls"
                className="hidden"
                onChange={(e) => { const f = e.target.files?.[0]; if (f) pilihFile(f); e.target.value = ""; }}
              />
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#1769aa]/10 text-[#1769aa]">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
                  strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6" aria-hidden="true">
                  <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                  <polyline points="17 8 12 3 7 8" />
                  <line x1="12" y1="3" x2="12" y2="15" />
                </svg>
              </div>
              {file ? (
                <div className="text-center">
                  <p className="text-sm font-semibold text-slate-700">{file.name}</p>
                  <p className="text-xs text-slate-400">{(file.size / 1024).toFixed(1)} KB</p>
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); resetFile(); }}
                    className="mt-1 text-xs text-red-500 underline hover:text-red-700"
                  >
                    Ganti file
                  </button>
                </div>
              ) : (
                <div className="text-center">
                  <p className="text-sm font-semibold text-slate-600">
                    Klik atau seret file Excel ke sini
                  </p>
                  <p className="text-xs text-slate-400">
                    .xlsx atau .xls · Maks 10 MB
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Error */}
          {error && (
            <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {/* Hasil import */}
          {hasil && (
            <div className="rounded-xl border border-green-200 bg-green-50 px-5 py-4 space-y-2">
              <div className="flex items-center gap-2">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"
                  strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 text-green-600 shrink-0" aria-hidden="true">
                  <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
                <p className="text-sm font-bold text-green-800">Import Berhasil!</p>
              </div>
              <p className="text-sm text-green-700">{hasil.message}</p>
              {hasil.errors?.length > 0 && (
                <details className="mt-1">
                  <summary className="cursor-pointer text-xs font-semibold text-amber-700">
                    {hasil.errors.length} baris gagal/dilewati — lihat detail
                  </summary>
                  <ul className="mt-2 max-h-40 overflow-y-auto space-y-1">
                    {hasil.errors.map((e, i) => (
                      <li key={i} className="rounded bg-amber-50 px-3 py-1 text-xs text-amber-800">
                        {typeof e === "object" && e.baris ? `Baris ${e.baris}: ${e.error}` : String(e)}
                      </li>
                    ))}
                  </ul>
                </details>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 border-t border-slate-100 px-7 py-5">
          {!hasil ? (
            <>
              <button
                type="button"
                onClick={onTutup}
                disabled={loading}
                className="h-10 rounded-xl border border-slate-200 px-5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={kirim}
                disabled={loading || !file}
                className="h-10 rounded-xl bg-[#1769aa] px-6 text-sm font-bold text-white transition hover:bg-[#125687] disabled:opacity-60"
              >
                {loading ? "Mengimpor..." : "Import Sekarang"}
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={selesai}
              className="h-10 rounded-xl bg-[#1769aa] px-6 text-sm font-bold text-white transition hover:bg-[#125687]"
            >
              Selesai & Refresh Data
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
