import { useState } from "react";

const dataDummy = {
  2026: {
    totalAlumni: 249,
    sudahMengisi: 180,
    belumMengisi: 69,
    bekerjaKuliahPersen: 71,
    status: { bekerja: 100, kuliah: 50, wirausaha: 30, belumBekerja: 69 },
  },
  2025: {
    totalAlumni: 230,
    sudahMengisi: 170,
    belumMengisi: 60,
    bekerjaKuliahPersen: 68,
    status: { bekerja: 90, kuliah: 45, wirausaha: 35, belumBekerja: 60 },
  },
  2024: {
    totalAlumni: 215,
    sudahMengisi: 150,
    belumMengisi: 65,
    bekerjaKuliahPersen: 64,
    status: { bekerja: 80, kuliah: 40, wirausaha: 30, belumBekerja: 65 },
  },
};

const TAHUN = Object.keys(dataDummy).sort((a, b) => b - a);

const STATUS_ROWS = [
  { key: "bekerja", label: "Bekerja", warna: "#21a65b" },
  { key: "kuliah", label: "Melanjutkan Kuliah", warna: "#1767a8" },
  { key: "wirausaha", label: "Wirausaha", warna: "#f59e0b" },
  { key: "belumBekerja", label: "Belum Bekerja", warna: "#b8c5d6" },
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
      style={{ width: `${persen}%`, backgroundColor: warna }}
    />
  </div>
);

/* ---------- Halaman ---------- */
export default function Laporan() {
  const [tahun, setTahun] = useState(TAHUN[0]);
  const d = dataDummy[tahun]; // TODO: ganti dengan data dari API berdasarkan `tahun`

  const persenMengisi = (d.sudahMengisi / d.totalAlumni) * 100;
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
          Tracer Study SMK Puspita Bangsa
        </p>
      </div>

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
            className="h-11 w-30 cursor-pointer appearance-none rounded-xl border border-transparent bg-[#eef2f8] pl-4 pr-10 text-base font-semibold text-[#12263f] focus:border-[#1767a8] focus:outline-none focus:ring-4 focus:ring-[#1767a8]/15 lg:h-13 lg:w-62.5 lg:border-[#9fb3cf] lg:bg-white lg:pl-5 lg:text-xl lg:font-normal lg:text-[#5b7794]"
          >
            {TAHUN.map((t) => (
              <option key={t} value={t}>
                {t}
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
      </Card>

      {/* Kartu angka */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 lg:gap-6">
        <StatCard value={d.totalAlumni} label="Total Alumni" />
        <StatCard value={d.sudahMengisi} label="Sudah Mengisi" />
        <StatCard value={d.belumMengisi} label="Belum Mengisi" />
        <StatCard value={`${d.bekerjaKuliahPersen}%`} label="Bekerja/Kuliah" />
      </div>

      {/* Status alumni + ringkasan */}
      <div className="grid gap-5 lg:grid-cols-[1.6fr_1fr] lg:gap-6">
        <Card className="p-6 lg:p-8">
          <h2 className="mb-6 font-['Poppins',sans-serif] text-xl font-bold text-[#12263f] lg:text-2xl">
            Status Alumni
          </h2>

          <ul className="space-y-5 lg:space-y-9">
            {STATUS_ROWS.map((r) => {
              const nilai = d.status[r.key];
              return (
                <li
                  key={r.key}
                  className="grid grid-cols-[112px_1fr_36px] items-center gap-x-3 lg:grid-cols-[250px_1fr_60px] lg:gap-x-4"
                >
                  <span className="text-[14px] text-[#12263f] lg:text-[18px]">
                    {r.label}
                  </span>
                  <Track
                    persen={(nilai / d.totalAlumni) * 100}
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
            Alumni mengisi tracer study
          </p>
          <div className="mb-3 mt-1 font-['Poppins',sans-serif] text-[34px] font-bold leading-tight text-[#21a65b] lg:text-[40px]">
            {persenMengisiTeks}%
          </div>
          <Track persen={persenMengisi} warna="#21a65b" tinggi="h-3.5" />

          <p className="mt-8 text-[15px] leading-relaxed text-[#8a9bb0] lg:text-base lg:text-[#5b7794]">
            Data ini merupakan contoh tampilan.
            <br />
            Gunakan filter untuk melihat periode.
          </p>
        </Card>
      </div>
    </div>
  );
}
