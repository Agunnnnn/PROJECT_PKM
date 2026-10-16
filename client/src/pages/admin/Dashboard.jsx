const dataDummy = {
  totalAlumni: 249,
  relevan: 169,
  tidakRelevan: 80,
  sudahBekerjaKuliah: 177,
  perJurusan: [
    { jurusan: "AKL", persen: 79 },
    { jurusan: "BDP", persen: 73 },
    { jurusan: "OTKP", persen: 68 },
    { jurusan: "Perhotelan", persen: 61 },
    { jurusan: "RPL", persen: 60 },
  ],
  terbaru: [
    {
      id: 1,
      nama: "Rina Aulia",
      baru: true,
      jurusan: "AKL",
      status: "Kuliah",
      tempat: "PT Teknologi Nusantara",
      relevan: true,
    },
    {
      id: 2,
      nama: "Rina Aprilia",
      jurusan: "RPL",
      status: "Bekerja",
      tempat: "PT Teknologi Nusantara",
      relevan: true,
    },
    {
      id: 3,
      nama: "Dimas Pratama",
      jurusan: "RPL",
      status: "Kuliah",
      tempat: "Univ. Pamulang, Sistem Informasi",
      relevan: true,
    },
    {
      id: 4,
      nama: "Siti Nurhaliza",
      jurusan: "AKL",
      status: "Bekerja",
      tempat: "KJKS Barokah Mandiri",
      relevan: true,
    },
    {
      id: 5,
      nama: "Andi Saputra",
      jurusan: "OTKP",
      status: "Wirausaha",
      tempat: "Toko Kelontong Sendiri",
      relevan: false,
    },
  ],
};

/* ---------- Komponen kecil ---------- */
const GREEN = "#21a65b";
const ORANGE = "#e68a00";

const Card = ({ children, className = "" }) => (
  <section
    className={`rounded-3xl border border-[#d9e6f5] bg-white ${className}`}
  >
    {children}
  </section>
);

const StatCard = ({ value, label }) => (
  <Card className="px-5 py-5 lg:px-7 lg:py-7">
    <div className="font-['Poppins',sans-serif] text-[40px] font-bold leading-none text-[#12263f]">
      {value}
    </div>
    <div className="mt-2 font-['Poppins',sans-serif] text-[15px] text-[#4a6180] lg:text-[17px]">
      {label}
    </div>
  </Card>
);

// Bar hijau (relevan) di atas dasar oranye (tidak relevan)
const Bar = ({ persen }) => (
  <div
    className="h-3 w-full overflow-hidden rounded-full"
    style={{ backgroundColor: ORANGE }}
    role="img"
    aria-label={`${persen}% relevan`}
  >
    <div
      className="h-full rounded-full"
      style={{ width: `${persen}%`, backgroundColor: GREEN }}
    />
  </div>
);

const Legend = ({ relevan, tidak }) => (
  <div className="flex flex-wrap items-center gap-x-8 gap-y-2 text-[15px] text-[#4a6180]">
    <span className="inline-flex items-center gap-2.5">
      <i className="h-3 w-3 rounded-full" style={{ backgroundColor: GREEN }} />
      {relevan}
    </span>
    <span className="inline-flex items-center gap-2.5">
      <i className="h-3 w-3 rounded-full" style={{ backgroundColor: ORANGE }} />
      {tidak}
    </span>
  </div>
);

const Badge = ({ relevan }) => (
  <span
    className={`inline-block rounded-full px-4 py-1.5 font-['Poppins',sans-serif] text-[15px] font-bold ${
      relevan ? "bg-[#dcf5e6] text-[#0d7a3e]" : "bg-[#fdebc8] text-[#8a5300]"
    }`}
  >
    {relevan ? "Relevan" : "Tidak relevan"}
  </span>
);

/* ---------- Halaman ---------- */
export default function Dashboard() {
  const data = dataDummy; // TODO: ganti dengan data dari API

  // Persen dihitung di frontend dari jumlah
  const totalJawaban = data.relevan + data.tidakRelevan;
  const persenRelevan = Math.round((data.relevan / totalJawaban) * 100);
  const persenTidak = 100 - persenRelevan;
  const persenBekerja = Math.round(
    (data.sudahBekerjaKuliah / data.totalAlumni) * 100,
  );

  return (
    <div className="space-y-5 font-['Inter',sans-serif] lg:space-y-6">
      {/* Judul */}
      <div>
        <h1 className="font-['Poppins',sans-serif] text-[28px] font-bold leading-tight text-[#12263f] lg:text-[40px]">
          Dashboard Tracer Study
        </h1>
        <p className="mt-2 max-w-sm text-[15px] text-[#4a6180] lg:max-w-none lg:text-lg">
          Ringkasan jawaban alumni SMK Puspita Bangsa (data contoh).
        </p>
      </div>

      {/* Kartu angka */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 lg:gap-6">
        <StatCard value={data.totalAlumni} label="Alumni mengisi" />
        <StatCard value={`${persenRelevan}%`} label="Relevan" />
        <StatCard value={`${persenTidak}%`} label="Tidak relevan" />
        <StatCard value={`${persenBekerja}%`} label="Sudah bekerja/kuliah" />
      </div>

      {/* Proporsi kecocokan - hanya tampil di HP */}
      <Card className="p-5 lg:hidden">
        <h2 className="mb-4 font-['Poppins',sans-serif] text-lg font-bold text-[#12263f]">
          Proporsi kecocokan
        </h2>
        <Bar persen={persenRelevan} />
        <div className="mt-5">
          <Legend
            relevan={`Relevan ${persenRelevan}%`}
            tidak={`Tidak relevan ${persenTidak}%`}
          />
        </div>
      </Card>

      {/* Kecocokan per jurusan */}
      <Card className="p-5 lg:p-8">
        <h2 className="mb-5 font-['Poppins',sans-serif] text-xl font-bold text-[#12263f] lg:mb-6 lg:text-2xl">
          Kecocokan per jurusan
        </h2>

        <ul className="space-y-6 lg:space-y-4">
          {data.perJurusan.map((j) => (
            <li
              key={j.jurusan}
              className="grid grid-cols-[1fr_auto] items-center gap-x-4 gap-y-2 lg:grid-cols-[170px_1fr_56px] lg:gap-x-6"
            >
              <span className="text-[17px] text-[#12263f]">{j.jurusan}</span>
              <span className="text-right font-['Poppins',sans-serif] text-[17px] font-bold text-[#12263f] lg:order-3">
                {j.persen}%
              </span>
              <div className="col-span-2 lg:order-2 lg:col-span-1">
                <Bar persen={j.persen} />
              </div>
            </li>
          ))}
        </ul>

        <div className="mt-6 hidden lg:block">
          <Legend relevan="Relevan" tidak="Tidak relevan" />
        </div>
      </Card>

      {/* Jawaban terbaru */}
      <Card className="p-5 lg:p-8">
        <h2 className="mb-5 font-['Poppins',sans-serif] text-xl font-bold text-[#12263f] lg:mb-6 lg:text-2xl">
          Jawaban terbaru
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full min-w-180 border-collapse text-left text-[17px]">
            <thead>
              <tr className="border-b border-[#d9e6f5] text-[15px] font-normal text-[#4a6180]">
                {["Nama", "Jurusan", "Status", "Tempat", "Kecocokan"].map(
                  (h) => (
                    <th key={h} className="pb-4 pr-6 font-normal last:pr-0">
                      {h}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody>
              {data.terbaru.map((r) => (
                <tr
                  key={r.id}
                  className="border-b border-[#d9e6f5] text-[#12263f] last:border-b-0"
                >
                  <td className="whitespace-nowrap py-5 pr-6">
                    {r.nama}
                    {r.baru && (
                      <span className="ml-2.5 rounded-full bg-[#f5a623] px-2.5 py-0.5 align-middle text-[11px] font-bold text-[#6b3f00]">
                        BARU
                      </span>
                    )}
                  </td>
                  <td className="py-5 pr-6">{r.jurusan}</td>
                  <td className="py-5 pr-6">{r.status}</td>
                  <td className="py-5 pr-6">{r.tempat}</td>
                  <td className="py-5">
                    <Badge relevan={r.relevan} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
