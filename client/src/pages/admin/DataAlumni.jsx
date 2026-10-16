import React, { useMemo, useState } from "react";

/* ===================== DATA DUMMY ===================== */
const DATA_DUMMY = [
  {
    id: 1,
    nama: "Rina Aulia",
    nisn: "0067234512",
    jurusan: "AKL",
    tahun: 2024,
    status: "Kuliah",
    aktivitas: "S1 Akuntasi",
    kesesuaian: "Sangat Sesuai",
  },
  {
    id: 2,
    nama: "Dimas Pratama",
    nisn: "0067234513",
    jurusan: "RPL",
    tahun: 2024,
    status: "Bekerja",
    aktivitas: "Software Dev",
    kesesuaian: "Sangat Sesuai",
  },
  {
    id: 3,
    nama: "Siti Nurhaliza",
    nisn: "0067234514",
    jurusan: "AKL",
    tahun: 2025,
    status: "Bekerja",
    aktivitas: "Staff Accounting",
    kesesuaian: "Sangat Sesuai",
  },
  {
    id: 4,
    nama: "Andi Saputra",
    nisn: "0067234515",
    jurusan: "OTKP",
    tahun: 2025,
    status: "Wirausaha",
    aktivitas: "Adminstrasi",
    kesesuaian: "Cukup Sesuai",
  },
  {
    id: 5,
    nama: "Budi Santoso",
    nisn: "0067234516",
    jurusan: "BDP",
    tahun: 2025,
    status: "Belum bekerja",
    aktivitas: "Belum Bekerja",
    kesesuaian: "Tidak Sesuai",
  },
  {
    id: 6,
    nama: "Nadia Putri",
    nisn: "0067234517",
    jurusan: "RPL",
    tahun: 2023,
    status: "Kuliah",
    aktivitas: "S1 Sistem Informasi",
    kesesuaian: "Sangat Sesuai",
  },
];

const DAFTAR_JURUSAN = ["AKL", "RPL", "OTKP", "BDP"];

/* ===================== WARNA BADGE ===================== */
const WARNA_STATUS = {
  Kuliah: "bg-green-100 text-green-700",
  Bekerja: "bg-green-100 text-green-700",
  Wirausaha: "bg-amber-100 text-amber-700",
  // di mobile merah muda, di desktop kuning (sesuai desain)
  "Belum bekerja": "bg-red-100 text-red-800 lg:bg-amber-100 lg:text-amber-800",
};

const WARNA_KESESUAIAN = {
  "Sangat Sesuai": "bg-green-100 text-green-700",
  "Cukup Sesuai": "bg-amber-100 text-amber-700",
  "Tidak Sesuai": "bg-red-100 text-red-700",
};

function Badge({ warna = "", children }) {
  return (
    <span
      className={`inline-block whitespace-nowrap rounded-full px-4 py-1 text-sm font-bold ${warna}`}
    >
      {children}
    </span>
  );
}

/* ===================== KOMPONEN UTAMA ===================== */
/**
 * Konten utama halaman "Data Alumni".
 * Sidebar/navbar dan footer dipasang terpisah di layout.
 *
 * Props (opsional):
 *  - data        : array alumni (default: data dummy)
 *  - totalData   : total seluruh data di server, untuk teks "6 dari 249"
 *  - totalHalaman: jumlah halaman pada pagination
 *  - onTambah, onExport, onEdit(alumni), onHapus(alumni), onPageChange(halaman)
 */
export default function DataAlumni({
  data = DATA_DUMMY,
  totalData = 249,
  totalHalaman = 3,
  onTambah,
  onExport,
  onEdit,
  onHapus,
  onPageChange,
}) {
  const [daftar, setDaftar] = useState(data);
  const [cari, setCari] = useState("");
  const [jurusan, setJurusan] = useState("Semua");
  const [halaman, setHalaman] = useState(1);

  const tampil = useMemo(
    () =>
      daftar.filter(
        (a) =>
          a.nama.toLowerCase().includes(cari.trim().toLowerCase()) &&
          (jurusan === "Semua" || a.jurusan === jurusan),
      ),
    [daftar, cari, jurusan],
  );

  const hapus = (alumni) => {
    if (window.confirm(`Hapus data ${alumni.nama}?`)) {
      setDaftar((d) => d.filter((x) => x.id !== alumni.id));
      onHapus?.(alumni);
    }
  };

  const gantiHalaman = (h) => {
    setHalaman(h);
    onPageChange?.(h);
  };

  return (
    <main className="bg-slate-50 px-5 pb-10 pt-6 lg:bg-[#eaf3fd] lg:px-10 lg:py-8">
      {/* Judul halaman */}
      <header className="mb-5 lg:mb-8">
        <h1 className="text-3xl font-extrabold leading-tight text-[#12294d] lg:text-5xl">
          Data Alumni
        </h1>
        <p className="mt-1 text-base text-slate-500 lg:mt-2 lg:text-xl">
          Tracer Study SMK Puspita Bangsa
        </p>
      </header>

      {/* Toolbar: di desktop berupa kartu, di mobile hanya kontrol */}
      <section className="mb-5 lg:mb-6 lg:flex lg:items-center lg:justify-between lg:gap-6 lg:rounded-2xl lg:border lg:border-slate-200 lg:bg-white lg:px-8 lg:py-6">
        <div className="hidden lg:block lg:shrink-0">
          <h2 className="text-2xl font-bold text-[#12294d]">Data Alumni</h2>
          <p className="mt-1 text-slate-500">
            Kelola informasi dan status alumni.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 lg:min-w-0 lg:flex-1 lg:justify-end">
          {/* Cari */}
          <label className="relative order-1 min-w-0 flex-1 lg:order-2 lg:min-w-40 lg:max-w-xs">
            <span className="sr-only">Cari nama alumni</span>
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              className="pointer-events-none absolute left-4 top-1/2 hidden h-4 w-4 -translate-y-1/2 text-slate-400 lg:block"
              aria-hidden="true"
            >
              <circle cx="11" cy="11" r="7" />
              <path d="M20 20l-3.5-3.5" />
            </svg>
            <input
              type="text"
              value={cari}
              onChange={(e) => setCari(e.target.value)}
              placeholder="Cari nama alumni..."
              className="h-12 w-full rounded-xl border border-slate-200 bg-white px-5 text-base text-slate-700 placeholder:text-slate-400 focus:border-[#1769aa] focus:outline-none focus:ring-2 focus:ring-[#1769aa]/20 lg:h-14 lg:pl-11"
            />
          </label>

          {/* Tambah */}
          <button
            type="button"
            onClick={onTambah}
            className="order-2 h-12 shrink-0 rounded-xl bg-[#1769aa] px-6 text-base font-bold text-white transition hover:bg-[#125687] lg:order-4 lg:h-14"
          >
            + Tambah Data
          </button>

          {/* Filter jurusan */}
          <div className="relative order-3 shrink-0 lg:order-1">
            <select
              value={jurusan}
              onChange={(e) => setJurusan(e.target.value)}
              aria-label="Filter jurusan"
              className="h-11 w-full appearance-none rounded-xl border border-slate-200 bg-white pl-4 pr-10 text-base text-slate-700 focus:border-[#1769aa] focus:outline-none focus:ring-2 focus:ring-[#1769aa]/20 lg:h-14 lg:w-48 lg:border-[#1769aa]/40"
            >
              <option value="Semua">Semua Jurusan</option>
              {DAFTAR_JURUSAN.map((j) => (
                <option key={j} value={j}>
                  {j}
                </option>
              ))}
            </select>
            <Chevron className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-600 lg:h-5 lg:w-5" />
          </div>

          {/* Export */}
          <button
            type="button"
            onClick={onExport}
            className="order-4 h-11 shrink-0 rounded-xl border border-slate-200 bg-white px-5 text-base text-slate-700 transition hover:bg-slate-50 lg:order-3 lg:h-14 lg:px-7"
          >
            Export Data
          </button>
        </div>
      </section>

      {/* ============ DESKTOP: TABEL ============ */}
      <section className="hidden overflow-hidden rounded-2xl border border-slate-200 bg-white lg:block">
        <div className="overflow-x-auto">
          <table className="w-full min-w-225 text-left">
            <thead>
              <tr className="bg-slate-50 text-sm font-bold text-slate-500">
                <th className="py-5 pl-10 pr-3">No.</th>
                <th className="px-3 py-5">Nama Alumni</th>
                <th className="px-3 py-5">NISN</th>
                <th className="px-3 py-5">Jurusan</th>
                <th className="px-3 py-5">Tahun Lulus</th>
                <th className="px-3 py-5">Status</th>
                <th className="px-3 py-5">Aktifitas Saat Ini</th>
                <th className="px-3 py-5">Kesesuaian Jurusan</th>
                <th className="py-5 pl-3 pr-10">Aksi</th>
              </tr>
            </thead>
            <tbody className="text-base text-slate-800">
              {tampil.map((a, i) => (
                <tr key={a.id} className="border-t border-slate-200">
                  <td className="py-6 pl-10 pr-3">{i + 1}</td>
                  <td className="px-3 py-6">{a.nama}</td>
                  <td className="px-3 py-6">{a.nisn}</td>
                  <td className="px-3 py-6">{a.jurusan}</td>
                  <td className="px-3 py-6">{a.tahun}</td>
                  <td className="px-3 py-6">
                    <Badge warna={WARNA_STATUS[a.status]}>{a.status}</Badge>
                  </td>
                  <td className="px-3 py-6">{a.aktivitas}</td>
                  <td className="px-3 py-6">
                    <Badge warna={WARNA_KESESUAIAN[a.kesesuaian]}>
                      {a.kesesuaian}
                    </Badge>
                  </td>
                  <td className="whitespace-nowrap py-6 pl-3 pr-10">
                    <button
                      type="button"
                      onClick={() => onEdit?.(a)}
                      className="mr-6 text-[#1769aa] hover:underline"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => hapus(a)}
                      className="text-red-600 hover:underline"
                    >
                      Hapus
                    </button>
                  </td>
                </tr>
              ))}
              {tampil.length === 0 && (
                <tr className="border-t border-slate-200">
                  <td colSpan={9} className="py-10 text-center text-slate-500">
                    Data alumni tidak ditemukan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between border-t border-slate-200 px-10 py-5 text-slate-500">
          <p>
            Menampilkan {tampil.length} dari {totalData} data alumni (contoh)
          </p>
          <Pagination
            halaman={halaman}
            total={totalHalaman}
            onChange={gantiHalaman}
          />
        </div>
      </section>

      {/* ============ MOBILE: KARTU ============ */}
      <section className="lg:hidden">
        <ul className="space-y-4">
          {tampil.map((a) => (
            <li
              key={a.id}
              className="rounded-2xl border border-slate-200 bg-white p-5"
            >
              <h3 className="text-lg font-bold text-[#0f1a24]">{a.nama}</h3>
              <p className="mt-0.5 text-sm text-slate-500">
                NISN: {a.nisn} • {a.jurusan} ({a.tahun})
              </p>
              <div className="mt-3 border-t border-slate-100 pt-3">
                <div className="flex items-center justify-between">
                  <Badge warna={WARNA_STATUS[a.status]}>{a.status}</Badge>
                  <div className="flex gap-4 text-sm font-bold">
                    <button
                      type="button"
                      onClick={() => onEdit?.(a)}
                      className="text-blue-600"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => hapus(a)}
                      className="text-red-600"
                    >
                      Hapus
                    </button>
                  </div>
                </div>
              </div>
            </li>
          ))}
          {tampil.length === 0 && (
            <li className="rounded-2xl border border-slate-200 bg-white p-6 text-center text-slate-500">
              Data alumni tidak ditemukan.
            </li>
          )}
        </ul>

        <div className="mt-6 flex items-center justify-between gap-3 text-sm text-slate-500">
          <p>
            Menampilkan {tampil.length} dari {totalData} data alumni
          </p>
          <Pagination
            halaman={halaman}
            total={totalHalaman}
            onChange={gantiHalaman}
          />
        </div>
      </section>
    </main>
  );
}

/* ===================== KOMPONEN KECIL ===================== */
function Chevron({ className = "" }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M5 9l7 7 7-7" />
    </svg>
  );
}

function Pagination({ halaman, total, onChange }) {
  const nomor = Array.from({ length: total }, (_, i) => i + 1);
  return (
    <nav className="flex items-center gap-1" aria-label="Pagination">
      <button
        type="button"
        onClick={() => onChange(Math.max(1, halaman - 1))}
        aria-label="Halaman sebelumnya"
        className="px-2 py-1 hover:text-slate-800"
      >
        ‹
      </button>
      {nomor.map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n)}
          aria-current={n === halaman ? "page" : undefined}
          className={`min-w-8 rounded-lg px-2.5 py-1 font-semibold ${
            n === halaman ? "bg-[#1769aa] text-white" : "hover:text-slate-800"
          }`}
        >
          {n}
        </button>
      ))}
      <button
        type="button"
        onClick={() => onChange(Math.min(total, halaman + 1))}
        aria-label="Halaman berikutnya"
        className="px-2 py-1 hover:text-slate-800"
      >
        ›
      </button>
    </nav>
  );
}
