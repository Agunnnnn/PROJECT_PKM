import React, { useEffect, useRef, useState } from "react";
import api from "../api/axios";

/* ─── Tab yang tersedia ─────────────────────────────────────── */
const TABS = [
  { id: "excel", label: "Import Excel (.xlsx)" },
  { id: "sql",   label: "Import SQL (.sql)"   },
];

/* ─── Komponen ──────────────────────────────────────────────── */
export default function ImportDataModal({ onTutup, onBerhasil }) {
  const [tab, setTab]           = useState("excel");
  const [file, setFile]         = useState(null);
  const [drag, setDrag]         = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");
  const [hasil, setHasil]       = useState(null);
  const inputRef                = useRef(null);

  /* tutup dengan Escape */
  useEffect(() => {
    const h = (e) => { if (e.key === "Escape") onTutup(); };
    document.addEventListener("keydown", h);
    return () => document.removeEventListener("keydown", h);
  }, [onTutup]);

  const resetFile = () => { setFile(null); setError(""); setHasil(null); };

  const gantiTab = (id) => { setTab(id); resetFile(); };

  const validasiFile = (f) => {
    if (!f) return "Pilih file terlebih dahulu.";
    const ext = f.name.split(".").pop().toLowerCase();
    if (tab === "excel" && !["xlsx", "xls"].includes(ext))
      return "Format file harus .xlsx atau .xls";
    if (tab === "sql" && ext !== "sql")
      return "Format file harus .sql";
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

    try {
      setLoading(true);
      setError("");
      setHasil(null);
      const endpoint = tab === "excel" ? "/alumni/import-excel" : "/alumni/import-sql";
      const res = await api.post(endpoint, formData, {
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

  /* ── Template download contoh SQL ── */
  const unduhContohSQL = () => {
    const sql = `-- Contoh file SQL untuk import alumni
-- Hanya INSERT INTO alumni dan INSERT INTO survey yang diizinkan.
-- Jalankan migrate.js terlebih dahulu untuk memastikan struktur tabel sudah benar.

INSERT INTO alumni (nis, nama, jurusan, tahun_lulus, email, no_hp)
VALUES ('0011234567', 'Ahmad Fauzi', 'Teknik Komputer dan Jaringan', 2023, 'ahmad@email.com', '081234567890');

INSERT INTO alumni (nis, nama, jurusan, tahun_lulus, email, no_hp)
VALUES ('0011234568', 'Siti Rahayu', 'Rekayasa Perangkat Lunak', 2023, 'siti@email.com', '081234567891');
`;
    const blob = new Blob([sql], { type: "text/plain" });
    const url  = URL.createObjectURL(blob);
    const a    = Object.assign(document.createElement("a"), { href: url, download: "contoh-import-alumni.sql" });
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
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-7 py-5">
          <h2 id="import-judul" className="text-xl font-bold text-[#12294d]">
            Import Data Alumni
          </h2>
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

        <div className="px-7 py-6 space-y-5">
          {/* Tab */}
          <div className="flex rounded-xl border border-slate-200 p-1 gap-1">
            {TABS.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => gantiTab(t.id)}
                className={`flex-1 rounded-lg py-2 text-sm font-semibold transition ${
                  tab === t.id
                    ? "bg-[#1769aa] text-white shadow-sm"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Petunjuk */}
          <div className="rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-800 space-y-1">
            {tab === "excel" ? (
              <>
                <p className="font-semibold">Format Excel yang didukung:</p>
                <p>Baris pertama harus berisi header: <code className="rounded bg-blue-100 px-1">NIS</code>, <code className="rounded bg-blue-100 px-1">Nama</code>, <code className="rounded bg-blue-100 px-1">Jurusan</code>, <code className="rounded bg-blue-100 px-1">Tahun Lulus</code>, <code className="rounded bg-blue-100 px-1">Email</code>, <code className="rounded bg-blue-100 px-1">No HP</code></p>
                <p>NIS yang sudah ada akan dilewati (tidak duplikat).</p>
              </>
            ) : (
              <>
                <p className="font-semibold">Format SQL yang didukung:</p>
                <p>Hanya pernyataan <code className="rounded bg-blue-100 px-1">INSERT INTO alumni</code> yang diizinkan. DROP, DELETE, UPDATE akan diblokir otomatis.</p>
              </>
            )}
            <button
              type="button"
              onClick={tab === "excel" ? unduhContohExcel : unduhContohSQL}
              className="mt-1 inline-flex items-center gap-1.5 text-xs font-bold text-blue-700 underline underline-offset-2 hover:text-blue-900"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5" aria-hidden="true">
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              Unduh contoh file {tab === "excel" ? "CSV/Excel" : "SQL"}
            </button>
          </div>

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
                accept={tab === "excel" ? ".xlsx,.xls" : ".sql"}
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
                    Klik atau seret file ke sini
                  </p>
                  <p className="text-xs text-slate-400">
                    {tab === "excel" ? ".xlsx atau .xls" : ".sql"} · Maks 10 MB
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
                  <ul className="mt-2 space-y-1">
                    {hasil.errors.map((e, i) => (
                      <li key={i} className="rounded bg-amber-50 px-3 py-1 text-xs text-amber-800">{e}</li>
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
