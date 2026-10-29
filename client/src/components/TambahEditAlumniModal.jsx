import React, { useEffect, useRef, useState } from "react";
import api from "../api/axios";

/* ─── Konstanta ─────────────────────────────────────────────── */
const JURUSAN_DEFAULT = [
  "Teknik Komputer dan Jaringan",
  "Rekayasa Perangkat Lunak",
  "Multimedia",
  "Akuntansi",
  "Administrasi Perkantoran",
  "Pemasaran",
];

const KOSONG = {
  nis: "",
  nama: "",
  jurusan: "",
  tahunLulus: "",
  email: "",
  noHp: "",
};

/* ─── Komponen ──────────────────────────────────────────────── */
export default function TambahEditAlumniModal({ mode, dataAwal, onTutup, onBerhasil }) {
  const [form, setForm] = useState(KOSONG);
  const [jurusanList, setJurusanList] = useState(JURUSAN_DEFAULT);
  const [tahunList, setTahunList]     = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const inputPertama = useRef(null);

  const isEdit = mode === "edit";

  /* isi form saat edit */
  useEffect(() => {
    if (isEdit && dataAwal) {
      setForm({
        nis: dataAwal.nisn ?? dataAwal.nis ?? "",
        nama: dataAwal.nama ?? "",
        jurusan: dataAwal.jurusan ?? "",
        tahunLulus: String(dataAwal.tahun ?? dataAwal.tahun_lulus ?? ""),
        email: dataAwal.raw?.email ?? dataAwal.email ?? "",
        noHp: dataAwal.raw?.no_hp ?? dataAwal.no_hp ?? "",
      });
    } else {
      setForm(KOSONG);
    }
    setError("");
    setTimeout(() => inputPertama.current?.focus(), 80);
  }, [isEdit, dataAwal]);

  /* muat daftar jurusan dan tahun lulus dari server */
  useEffect(() => {
    api.get("/alumni/jurusan-list")
      .then((r) => {
        const gabung = Array.from(new Set([...JURUSAN_DEFAULT, ...(r.data || [])])).sort();
        setJurusanList(gabung);
      })
      .catch(() => {});

    api.get("/alumni/tahun-list")
      .then((r) => setTahunList(r.data || []))
      .catch(() => {});
  }, []);

  /* tutup dengan Escape */
  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") onTutup(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onTutup]);

  const ubah = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
    setError("");
  };

  const kirim = async (e) => {
    e.preventDefault();
    const { nis, nama, jurusan, tahunLulus } = form;
    if (!nis.trim() || !nama.trim() || !jurusan || !tahunLulus) {
      setError("NIS, nama, jurusan, dan tahun lulus wajib diisi.");
      return;
    }
    try {
      setLoading(true);
      setError("");
      if (isEdit) {
        const alumniId = dataAwal?.alumniId ?? dataAwal?.id;
        await api.put(`/alumni/${alumniId}`, form);
      } else {
        await api.post("/alumni/tambah", form);
      }
      onBerhasil(isEdit ? "Data alumni berhasil diperbarui." : "Alumni baru berhasil ditambahkan.");
    } catch (err) {
      setError(err.response?.data?.message || "Terjadi kesalahan. Coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-judul"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onTutup(); }}
    >
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-7 py-5">
          <h2 id="modal-judul" className="text-xl font-bold text-[#12294d]">
            {isEdit ? "Edit Data Alumni" : "Tambah Alumni Baru"}
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

        {/* Body */}
        <form onSubmit={kirim} noValidate>
          <div className="space-y-4 px-7 py-6">
            {error && (
              <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            {/* NIS */}
            <div>
              <label htmlFor="nis" className="mb-1.5 block text-sm font-semibold text-slate-700">
                NIS <span className="text-red-500">*</span>
              </label>
              <input
                ref={inputPertama}
                id="nis"
                name="nis"
                type="text"
                value={form.nis}
                onChange={ubah}
                placeholder="Contoh: 0012345678"
                required
                className="h-11 w-full rounded-xl border border-slate-200 px-4 text-sm text-slate-800 placeholder:text-slate-400 focus:border-[#1769aa] focus:outline-none focus:ring-2 focus:ring-[#1769aa]/20"
              />
            </div>

            {/* Nama */}
            <div>
              <label htmlFor="nama" className="mb-1.5 block text-sm font-semibold text-slate-700">
                Nama Lengkap <span className="text-red-500">*</span>
              </label>
              <input
                id="nama"
                name="nama"
                type="text"
                value={form.nama}
                onChange={ubah}
                placeholder="Nama lengkap alumni"
                required
                className="h-11 w-full rounded-xl border border-slate-200 px-4 text-sm text-slate-800 placeholder:text-slate-400 focus:border-[#1769aa] focus:outline-none focus:ring-2 focus:ring-[#1769aa]/20"
              />
            </div>

            {/* Jurusan + Tahun Lulus (sejajar) */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="jurusan" className="mb-1.5 block text-sm font-semibold text-slate-700">
                  Jurusan <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <select
                    id="jurusan"
                    name="jurusan"
                    value={form.jurusan}
                    onChange={ubah}
                    required
                    className="h-11 w-full appearance-none rounded-xl border border-slate-200 bg-white pl-4 pr-9 text-sm text-slate-800 focus:border-[#1769aa] focus:outline-none focus:ring-2 focus:ring-[#1769aa]/20"
                  >
                    <option value="">Pilih jurusan</option>
                    {jurusanList.map((j) => (
                      <option key={j} value={j}>{j}</option>
                    ))}
                  </select>
                  <ChevronIcon className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                </div>
              </div>

              <div>
                <label htmlFor="tahunLulus" className="mb-1.5 block text-sm font-semibold text-slate-700">
                  Tahun Lulus <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <select
                    id="tahunLulus"
                    name="tahunLulus"
                    value={form.tahunLulus}
                    onChange={ubah}
                    required
                    className="h-11 w-full appearance-none rounded-xl border border-slate-200 bg-white pl-4 pr-9 text-sm text-slate-800 focus:border-[#1769aa] focus:outline-none focus:ring-2 focus:ring-[#1769aa]/20"
                  >
                    <option value="">Pilih tahun</option>
                    {tahunList.length > 0
                      ? tahunList.map((t) => (
                          <option key={t} value={t}>{t}</option>
                        ))
                      : <option disabled>Memuat...</option>
                    }
                  </select>
                  <ChevronIcon className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                </div>
              </div>
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="mb-1.5 block text-sm font-semibold text-slate-700">
                Email <span className="text-slate-400 font-normal">(opsional)</span>
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={form.email}
                onChange={ubah}
                placeholder="email@contoh.com"
                className="h-11 w-full rounded-xl border border-slate-200 px-4 text-sm text-slate-800 placeholder:text-slate-400 focus:border-[#1769aa] focus:outline-none focus:ring-2 focus:ring-[#1769aa]/20"
              />
            </div>

            {/* No HP */}
            <div>
              <label htmlFor="noHp" className="mb-1.5 block text-sm font-semibold text-slate-700">
                No. HP / WhatsApp <span className="text-slate-400 font-normal">(opsional)</span>
              </label>
              <input
                id="noHp"
                name="noHp"
                type="text"
                value={form.noHp}
                onChange={ubah}
                placeholder="08xxxxxxxxxx"
                className="h-11 w-full rounded-xl border border-slate-200 px-4 text-sm text-slate-800 placeholder:text-slate-400 focus:border-[#1769aa] focus:outline-none focus:ring-2 focus:ring-[#1769aa]/20"
              />
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 border-t border-slate-100 px-7 py-5">
            <button
              type="button"
              onClick={onTutup}
              disabled={loading}
              className="h-10 rounded-xl border border-slate-200 px-5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="h-10 rounded-xl bg-[#1769aa] px-6 text-sm font-bold text-white transition hover:bg-[#125687] disabled:opacity-60"
            >
              {loading ? "Menyimpan..." : isEdit ? "Simpan Perubahan" : "Tambah Alumni"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ChevronIcon({ className = "" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"
      strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="M5 9l7 7 7-7" />
    </svg>
  );
}
