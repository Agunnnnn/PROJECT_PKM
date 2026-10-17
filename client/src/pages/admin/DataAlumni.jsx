import React, { useEffect, useMemo, useState } from "react";
import api from "../../api/axios";

/* ===================== WARNA BADGE ===================== */
const WARNA_STATUS = {
  Kuliah: "bg-blue-100 text-blue-700",
  Bekerja: "bg-green-100 text-green-700",
  Wirausaha: "bg-amber-100 text-amber-700",
  "Belum Bekerja":
    "bg-slate-100 text-slate-700 lg:bg-slate-100 lg:text-slate-700",
  "Belum bekerja":
    "bg-slate-100 text-slate-700 lg:bg-slate-100 lg:text-slate-700",
};

const WARNA_KESESUAIAN = {
  "Sangat Sesuai": "bg-green-100 text-green-700",
  "Cukup Sesuai": "bg-amber-100 text-amber-700",
  "Tidak Sesuai": "bg-red-100 text-red-700",
  "Belum dihitung": "bg-slate-100 text-slate-600",
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
export default function DataAlumni({ onTambah, onExport, onEdit, onHapus }) {
  const [daftar, setDaftar] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cari, setCari] = useState("");
  const [jurusan, setJurusan] = useState("Semua");
  const [halaman, setHalaman] = useState(1);
  const [sedangHitung, setSedangHitung] = useState(false);
  const [pesanHitung, setPesanHitung] = useState("");

  const perHalaman = 10;

  const muatData = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await api.get("/survey");
      // Map data backend ke format tabel DataAlumni
      const formatData = (res.data || []).map((item) => {
        let aktivitas = "-";
        if (item.status_saat_ini === "Bekerja") {
          aktivitas = item.bidang_kerja || item.nama_perusahaan || "Bekerja";
        } else if (item.status_saat_ini === "Kuliah") {
          aktivitas =
            [item.nama_kampus, item.jurusan_kampus]
              .filter(Boolean)
              .join(" - ") || "Kuliah";
        } else if (item.status_saat_ini === "Wirausaha") {
          aktivitas = item.bidang_kerja || item.nama_perusahaan || "Wirausaha";
        } else if (item.status_saat_ini === "Belum Bekerja") {
          aktivitas = "Belum Bekerja";
        }

        return {
          id: item.id,
          alumniId: item.alumni_id,
          nama: item.nama || "-",
          nisn: item.nis || "-",
          jurusan: item.jurusan || "-",
          tahun: item.tahun_lulus || "-",
          status: item.status_saat_ini || "-",
          aktivitas,
          kesesuaian: item.relevansi_jurusan || "Belum dihitung",
          raw: item,
        };
      });
      setDaftar(formatData);
    } catch (err) {
      console.error("Gagal memuat data alumni:", err);
      setError(
        "Gagal memuat data dari server. Pastikan sudah login sebagai admin.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    muatData();
  }, []);

  // Hitung ulang relevansi ML untuk baris yang masih belum memiliki relevansi
  const handleHitungUlang = async () => {
    try {
      setSedangHitung(true);
      setPesanHitung("");
      const res = await api.post("/survey/hitung-ulang-relevansi");
      const { diproses, berhasil, gagal } = res.data;
      setPesanHitung(
        `Hitung ulang selesai: ${diproses} data diproses, ${berhasil} berhasil diperbarui, ${gagal} gagal/belum ada model.`,
      );
      await muatData();
    } catch (err) {
      console.error(err);
      setPesanHitung(
        "Gagal menghitung ulang relevansi. Pastikan layanan ML API aktif.",
      );
    } finally {
      setSedangHitung(false);
    }
  };

  // Daftar jurusan unik dari data yang tersedia
  const daftarJurusan = useMemo(() => {
    const list = Array.from(
      new Set(daftar.map((a) => a.jurusan).filter(Boolean)),
    );
    return list.sort();
  }, [daftar]);

  const tampil = useMemo(
    () =>
      daftar.filter(
        (a) =>
          a.nama.toLowerCase().includes(cari.trim().toLowerCase()) &&
          (jurusan === "Semua" || a.jurusan === jurusan),
      ),
    [daftar, cari, jurusan],
  );

  const totalHalaman = Math.max(1, Math.ceil(tampil.length / perHalaman));
  const dataHalaman = useMemo(() => {
    const mulai = (halaman - 1) * perHalaman;
    return tampil.slice(mulai, mulai + perHalaman);
  }, [tampil, halaman, perHalaman]);

  const hapus = (alumni) => {
    if (window.confirm(`Hapus data ${alumni.nama}?`)) {
      setDaftar((d) => d.filter((x) => x.id !== alumni.id));
      onHapus?.(alumni);
    }
  };

  const gantiHalaman = (h) => {
    setHalaman(h);
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

      {/* Banner pesan sukses hitung ulang / error */}
      {pesanHitung && (
        <div
          role="status"
          className="mb-5 flex items-center justify-between rounded-xl border border-blue-200 bg-blue-50 px-5 py-3 text-sm font-medium text-blue-900"
        >
          <span>{pesanHitung}</span>
          <button
            type="button"
            onClick={() => setPesanHitung("")}
            className="ml-4 font-bold text-blue-700 hover:text-blue-900"
          >
            ✕
          </button>
        </div>
      )}

      {error && (
        <div
          role="alert"
          className="mb-5 rounded-xl border border-red-200 bg-red-50 px-5 py-3 text-sm text-red-700"
        >
          {error}
        </div>
      )}

      {/* Toolbar */}
      <section className="mb-5 lg:mb-6 lg:flex lg:flex-col lg:gap-5 lg:rounded-2xl lg:border lg:border-slate-200 lg:bg-white lg:px-8 lg:py-6">
        {/* Baris atas (desktop): judul + tombol Tambah */}
        <div className="hidden lg:flex lg:items-center lg:justify-between lg:gap-6">
          <div>
            <h2 className="text-2xl font-bold text-[#12294d]">Data Alumni</h2>
            <p className="mt-1 text-slate-500">
              Kelola informasi dan status alumni.
            </p>
          </div>
          <button
            type="button"
            onClick={onTambah}
            className="h-12 shrink-0 rounded-xl bg-[#1769aa] px-6 text-base font-bold text-white transition hover:bg-[#125687]"
          >
            + Tambah Data
          </button>
        </div>

        {/* Baris bawah (desktop): filter, cari, aksi */}
        <div className="flex flex-wrap items-center gap-3 lg:flex-nowrap">
          {/* Cari */}
          <label className="relative order-1 min-w-0 flex-1 lg:order-2">
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
              onChange={(e) => {
                setCari(e.target.value);
                setHalaman(1);
              }}
              placeholder="Cari nama alumni..."
              className="h-12 w-full rounded-xl border border-slate-200 bg-white px-5 text-base text-slate-700 placeholder:text-slate-400 focus:border-[#1769aa] focus:outline-none focus:ring-2 focus:ring-[#1769aa]/20 lg:h-12 lg:pl-11"
            />
          </label>

          {/* Tambah (mobile saja) */}
          <button
            type="button"
            onClick={onTambah}
            className="order-2 h-12 shrink-0 rounded-xl bg-[#1769aa] px-6 text-base font-bold text-white transition hover:bg-[#125687] lg:hidden"
          >
            + Tambah Data
          </button>

          {/* Hitung Ulang Relevansi */}
          <button
            type="button"
            onClick={handleHitungUlang}
            disabled={sedangHitung || loading}
            title="Hitung ulang prediksi ML untuk baris data yang belum memiliki kesesuaian"
            className="order-3 h-11 shrink-0 whitespace-nowrap rounded-xl border border-[#1769aa] bg-blue-50 px-4 text-sm font-semibold text-[#1769aa] transition hover:bg-blue-100 disabled:opacity-50 lg:order-3 lg:h-12 lg:px-5"
          >
            {sedangHitung ? "Menghitung..." : "⚡ Hitung Ulang Relevansi"}
          </button>

          {/* Filter jurusan */}
          <div className="relative order-4 shrink-0 lg:order-1">
            <select
              value={jurusan}
              onChange={(e) => {
                setJurusan(e.target.value);
                setHalaman(1);
              }}
              aria-label="Filter jurusan"
              className="h-11 w-full appearance-none rounded-xl border border-slate-200 bg-white pl-4 pr-10 text-base text-slate-700 focus:border-[#1769aa] focus:outline-none focus:ring-2 focus:ring-[#1769aa]/20 lg:h-12 lg:w-56 lg:border-[#1769aa]/40"
            >
              <option value="Semua">Semua Jurusan</option>
              {daftarJurusan.map((j) => (
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
            className="order-5 h-11 shrink-0 whitespace-nowrap rounded-xl border border-slate-200 bg-white px-5 text-base text-slate-700 transition hover:bg-slate-50 lg:order-4 lg:h-12 lg:px-6"
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
                <th className="px-3 py-5">NIS</th>
                <th className="px-3 py-5">Jurusan</th>
                <th className="px-3 py-5">Tahun Lulus</th>
                <th className="px-3 py-5">Status</th>
                <th className="px-3 py-5">Aktifitas Saat Ini</th>
                <th className="px-3 py-5">Kesesuaian Jurusan</th>
                <th className="py-5 pl-3 pr-10">Aksi</th>
              </tr>
            </thead>
            <tbody className="text-base text-slate-800">
              {loading && (
                <tr className="border-t border-slate-200">
                  <td colSpan={9} className="py-12 text-center text-slate-500">
                    Memuat data alumni...
                  </td>
                </tr>
              )}
              {!loading &&
                dataHalaman.map((a, i) => (
                  <tr key={a.id} className="border-t border-slate-200">
                    <td className="py-6 pl-10 pr-3">
                      {(halaman - 1) * perHalaman + i + 1}
                    </td>
                    <td className="px-3 py-6 font-medium text-slate-900">
                      {a.nama}
                    </td>
                    <td className="px-3 py-6 text-slate-600">{a.nisn}</td>
                    <td className="px-3 py-6">{a.jurusan}</td>
                    <td className="px-3 py-6">{a.tahun}</td>
                    <td className="px-3 py-6">
                      <Badge
                        warna={
                          WARNA_STATUS[a.status] ||
                          "bg-slate-100 text-slate-700"
                        }
                      >
                        {a.status}
                      </Badge>
                    </td>
                    <td className="px-3 py-6 text-sm">{a.aktivitas}</td>
                    <td className="px-3 py-6">
                      <Badge
                        warna={
                          WARNA_KESESUAIAN[a.kesesuaian] ||
                          "bg-slate-100 text-slate-600"
                        }
                      >
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
              {!loading && tampil.length === 0 && (
                <tr className="border-t border-slate-200">
                  <td colSpan={9} className="py-12 text-center text-slate-500">
                    Data alumni tidak ditemukan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between border-t border-slate-200 px-10 py-5 text-slate-500">
          <p>
            Menampilkan {tampil.length > 0 ? (halaman - 1) * perHalaman + 1 : 0}{" "}
            - {Math.min(halaman * perHalaman, tampil.length)} dari{" "}
            {tampil.length} data alumni
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
        {loading && (
          <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-slate-500">
            Memuat data alumni...
          </div>
        )}
        {!loading && (
          <ul className="space-y-4">
            {dataHalaman.map((a) => (
              <li
                key={a.id}
                className="rounded-2xl border border-slate-200 bg-white p-5"
              >
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-lg font-bold text-[#0f1a24]">{a.nama}</h3>
                  <Badge
                    warna={
                      WARNA_KESESUAIAN[a.kesesuaian] ||
                      "bg-slate-100 text-slate-600"
                    }
                  >
                    {a.kesesuaian}
                  </Badge>
                </div>
                <p className="mt-0.5 text-sm text-slate-500">
                  NIS: {a.nisn} • {a.jurusan} ({a.tahun})
                </p>
                <p className="mt-2 text-sm text-slate-700">
                  <span className="font-semibold text-slate-500">
                    Aktivitas:{" "}
                  </span>
                  {a.aktivitas}
                </p>
                <div className="mt-3 border-t border-slate-100 pt-3">
                  <div className="flex items-center justify-between">
                    <Badge
                      warna={
                        WARNA_STATUS[a.status] || "bg-slate-100 text-slate-700"
                      }
                    >
                      {a.status}
                    </Badge>
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
        )}

        <div className="mt-6 flex items-center justify-between gap-3 text-sm text-slate-500">
          <p>
            {tampil.length > 0 ? (halaman - 1) * perHalaman + 1 : 0} -{" "}
            {Math.min(halaman * perHalaman, tampil.length)} dari {tampil.length}{" "}
            data
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
        disabled={halaman <= 1}
        aria-label="Halaman sebelumnya"
        className="px-2 py-1 hover:text-slate-800 disabled:opacity-40"
      >
        ‹
      </button>
      {nomor.map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n)}
          aria-current={n === halaman ? "page" : undefined}
          className={`min-w-8 rounded-lg px-2.5 py-1 font-semibold ${n === halaman ? "bg-[#1769aa] text-white" : "hover:text-slate-800"
            }`}
        >
          {n}
        </button>
      ))}
      <button
        type="button"
        onClick={() => onChange(Math.min(total, halaman + 1))}
        disabled={halaman >= total}
        aria-label="Halaman berikutnya"
        className="px-2 py-1 hover:text-slate-800 disabled:opacity-40"
      >
        ›
      </button>
    </nav>
  );
}