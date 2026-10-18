import { useEffect, useState } from "react";
import api from "../../api/axios";

const STATUS_ROWS = [
  { key: "bekerja", label: "Bekerja", warna: "#21a65b" },
  { key: "kuliah", label: "Melanjutkan Kuliah", warna: "#1767a8" },
  { key: "wirausaha", label: "Wirausaha", warna: "#f59e0b" },
  { key: "belumBekerja", label: "Belum Bekerja / Belum Terdata", warna: "#b8c5d6" },
];

/* ---------- Komponen kecil ---------- */
const Card = ({ children, className = "" }) => (
  <section
    className={`rounded-3xl border border-[#d9e6f5] bg-white ${className}`}
  >
    {children}
  </section>
);

const StatCard = ({ value, label }) => (
  <Card className="px-5 pb-6 pt-4 lg:px-7 lg:py-7">
    <div className="font-['Poppins',sans-serif] text-[34px] font-bold leading-tight text-[#12263f] lg:text-[40px]">
      {value}
    </div>
    <div className="mt-1 text-[15px] text-[#5b7794] lg:text-[17px]">
      {label}
    </div>
  </Card>
);

const Track = ({ persen, warna, tinggi = "h-3" }) => (
  <div className={`${tinggi} w-full overflow-hidden rounded-full bg-[#eef2f6]`}>
    <div
      className="h-full rounded-full transition-[width] duration-500"
      style={{ width: `${Math.min(100, Math.max(0, persen))}%`, backgroundColor: warna }}
    />
  </div>
);

/* ---------- Halaman Laporan ---------- */
export default function Laporan() {
  const [tahunList, setTahunList] = useState([]);
  const [tahun, setTahun] = useState("");
  const [laporan, setLaporan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Muat daftar tahun dari database MySQL
  useEffect(() => {
    api
      .get("/survey/tahun-list")
      .then((res) => {
        const list = res.data || [];
        setTahunList(list);
        if (list.length > 0) {
          setTahun(list[0]);
        } else {
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error("Gagal memuat tahun:", err);
        setError("Gagal memuat periode tahun dari server.");
        setLoading(false);
      });
  }, []);

  // Muat data laporan spesifik untuk tahun yang dipilih dari MySQL
  useEffect(() => {
    if (!tahun) return;
    setLoading(true);
    setError("");

    api
      .get(`/survey/laporan/${tahun}`)
      .then((res) => {
        setLaporan(res.data);
      })
      .catch((err) => {
        console.error("Gagal memuat laporan:", err);
        setError("Gagal memuat data laporan untuk tahun " + tahun);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [tahun]);

  const totalAlumni = laporan?.totalAlumni || 0;
  const sudahMengisi = laporan?.sudahMengisi || 0;
  const belumMengisi = laporan?.belumMengisi || 0;
  const bekerjaKuliahPersen = laporan?.bekerjaKuliahPersen || 0;
  const status = laporan?.status || {
    bekerja: 0,
    kuliah: 0,
    wirausaha: 0,
    belumBekerja: 0,
  };

  const persenMengisi = totalAlumni > 0 ? (sudahMengisi / totalAlumni) * 100 : 0;
  const persenMengisiTeks = persenMengisi.toLocaleString("id-ID", {
    maximumFractionDigits: 1,
  });

  return (
    <div className="space-y-5 font-['Inter',sans-serif] lg:space-y-6">
      {/* Judul */}
      <div>
        <h1 className="font-['Poppins',sans-serif] text-[28px] font-bold leading-tight text-[#12263f] lg:text-[40px]">
          Laporan Tracer Study
        </h1>
        <p className="mt-1 text-[15px] text-[#5b7794] lg:text-lg">
          Tracer Study SMK Puspita Bangsa (Data Terintegrasi MySQL)
        </p>
      </div>

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Filter periode */}
      <Card className="flex items-center justify-between gap-4 px-5 py-4 lg:justify-start lg:gap-8 lg:px-9 lg:py-5">
        <label
          htmlFor="periode"
          className="text-base text-[#5b7794] lg:font-['Poppins',sans-serif] lg:text-lg lg:font-semibold lg:text-[#12263f]"
        >
          Periode Laporan
        </label>
        <div className="relative">
          <select
            id="periode"
            value={tahun}
            onChange={(e) => setTahun(e.target.value)}
            disabled={tahunList.length === 0}
            className="h-11 w-36 cursor-pointer appearance-none rounded-xl border border-transparent bg-[#eef2f8] pl-4 pr-10 text-base font-semibold text-[#12263f] focus:border-[#1767a8] focus:outline-none focus:ring-4 focus:ring-[#1767a8]/15 lg:h-13 lg:w-62.5 lg:border-[#9fb3cf] lg:bg-white lg:pl-5 lg:text-xl lg:font-normal lg:text-[#5b7794]"
          >
            {tahunList.map((t) => (
              <option key={t} value={t}>
                Tahun Lulus {t}
              </option>
            ))}
          </select>
          <svg
            className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-[#5b7794]"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.500"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M6 9l6 6 6-6" />
          </svg>
        </div>
        {loading && (
          <span className="text-xs text-[#5b7794] animate-pulse">
            Memuat data...
          </span>
        )}
      </Card>

      {/* Kartu angka */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 lg:gap-6">
        <StatCard value={totalAlumni} label="Total Alumni" />
        <StatCard value={sudahMengisi} label="Sudah Mengisi" />
        <StatCard value={belumMengisi} label="Belum Mengisi" />
        <StatCard value={`${bekerjaKuliahPersen}%`} label="Bekerja/Kuliah" />
      </div>

      {/* Status alumni + ringkasan */}
      <div className="grid gap-5 lg:grid-cols-[1.6fr_1fr] lg:gap-6">
        <Card className="p-6 lg:p-8">
          <h2 className="mb-6 font-['Poppins',sans-serif] text-xl font-bold text-[#12263f] lg:text-2xl">
            Status Alumni ({tahun ? `Tahun ${tahun}` : "Semua"})
          </h2>

          <ul className="space-y-5 lg:space-y-9">
            {STATUS_ROWS.map((r) => {
              const nilai = status[r.key] || 0;
              const persenBar = totalAlumni > 0 ? (nilai / totalAlumni) * 100 : 0;
              return (
                <li
                  key={r.key}
                  className="grid grid-cols-[112px_1fr_36px] items-center gap-x-3 lg:grid-cols-[250px_1fr_60px] lg:gap-x-4"
                >
                  <span className="text-[14px] text-[#12263f] lg:text-[18px]">
                    {r.label}
                  </span>
                  <Track
                    persen={persenBar}
                    warna={r.warna}
                  />
                  <span className="text-right font-['Poppins',sans-serif] text-base font-bold text-[#12263f] lg:text-[17px]">
                    {nilai}
                  </span>
                </li>
              );
            })}
          </ul>
        </Card>

        <Card className="self-start p-6 lg:self-stretch lg:p-8">
          <h2 className="mb-4 font-['Poppins',sans-serif] text-xl font-bold text-[#12263f] lg:text-2xl">
            Ringkasan
          </h2>
          <p className="text-base text-[#5b7794] lg:text-lg">
            Partisipasi Alumni Mengisi Tracer Study
          </p>
          <div className="mb-3 mt-1 font-['Poppins',sans-serif] text-[34px] font-bold leading-tight text-[#21a65b] lg:text-[40px]">
            {persenMengisiTeks}%
          </div>
          <Track persen={persenMengisi} warna="#21a65b" tinggi="h-3.5" />

          <p className="mt-8 text-[15px] leading-relaxed text-[#8a9bb0] lg:text-base lg:text-[#5b7794]">
            Data ini dihitung langsung dari data riil alumni dan jawaban survei yang tersimpan di MySQL.
            <br />
            Gunakan pilihan periode untuk melihat perbandingan tiap angkatan.
          </p>
        </Card>
      </div>
    </div>
  );
}
