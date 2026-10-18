import { useEffect, useState, useMemo } from "react";
import api from "../../api/axios";
import {
  checkMlHealth,
  batchPredictRelevance,
  predictSingleRelevance,
} from "../../api/mlService";

/* ---------- Komponen & Token Warna ---------- */
const GREEN = "#21a65b";
const ORANGE = "#e68a00";

const Card = ({ children, className = "" }) => (
  <section
    className={`rounded-3xl border border-[#d9e6f5] bg-white transition-all shadow-sm ${className}`}
  >
    {children}
  </section>
);

const StatCard = ({ value, label, subtext, icon }) => (
  <Card className="p-5 lg:p-7 relative overflow-hidden group hover:border-[#b8d4f0] transition-colors">
    <div className="flex items-start justify-between">
      <div>
        <div className="font-['Poppins',sans-serif] text-[34px] lg:text-[40px] font-bold leading-none text-[#12263f]">
          {value}
        </div>
        <div className="mt-2 font-['Poppins',sans-serif] text-[15px] lg:text-[16px] font-medium text-[#4a6180]">
          {label}
        </div>
      </div>
      {icon && (
        <span className="p-2.5 rounded-2xl bg-[#f0f6fc] text-[#2c7be5]">
          {icon}
        </span>
      )}
    </div>
    {subtext && (
      <div className="mt-2.5 text-xs text-[#718ba5] font-normal flex items-center gap-1">
        {subtext}
      </div>
    )}
  </Card>
);

// Bar indikator proporsi persentase relevan vs tidak relevan
const Bar = ({ persen }) => (
  <div
    className="h-3 w-full overflow-hidden rounded-full transition-all duration-500"
    style={{ backgroundColor: ORANGE }}
    role="img"
    aria-label={`${persen}% relevan`}
  >
    <div
      className="h-full rounded-full transition-all duration-700 ease-out"
      style={{
        width: `${Math.min(100, Math.max(0, persen))}%`,
        backgroundColor: GREEN,
      }}
    />
  </div>
);

const Legend = ({ relevan, tidak }) => (
  <div className="flex flex-wrap items-center gap-x-8 gap-y-2 text-[15px] text-[#4a6180]">
    <span className="inline-flex items-center gap-2.5 font-medium">
      <i className="h-3 w-3 rounded-full" style={{ backgroundColor: GREEN }} />
      {relevan}
    </span>
    <span className="inline-flex items-center gap-2.5 font-medium">
      <i className="h-3 w-3 rounded-full" style={{ backgroundColor: ORANGE }} />
      {tidak}
    </span>
  </div>
);

const MlBadge = ({ label, skor, isEvaluating }) => {
  if (isEvaluating) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[13px] font-medium bg-slate-100 text-slate-600 animate-pulse">
        <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-ping" />
        Memproses ML...
      </span>
    );
  }

  if (label === "Sangat Sesuai") {
    return (
      <div className="inline-flex flex-col items-start gap-0.5">
        <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 font-['Poppins',sans-serif] text-[13px] font-bold bg-[#dcf5e6] text-[#0d7a3e] border border-[#a3e4bd]">
          <span className="w-2 h-2 rounded-full bg-[#0d7a3e]" />
          Sangat Sesuai
        </span>
        {skor > 0 && (
          <span className="text-[11px] text-[#2b7e52] pl-1 font-mono">
            Skor: {skor.toFixed(3)}
          </span>
        )}
      </div>
    );
  }

  if (label === "Cukup Sesuai") {
    return (
      <div className="inline-flex flex-col items-start gap-0.5">
        <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 font-['Poppins',sans-serif] text-[13px] font-bold bg-[#e0f2fe] text-[#0369a1] border border-[#bae6fd]">
          <span className="w-2 h-2 rounded-full bg-[#0284c7]" />
          Cukup Sesuai
        </span>
        {skor > 0 && (
          <span className="text-[11px] text-[#0369a1] pl-1 font-mono">
            Skor: {skor.toFixed(3)}
          </span>
        )}
      </div>
    );
  }

  if (label === "Tidak Sesuai") {
    return (
      <div className="inline-flex flex-col items-start gap-0.5">
        <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 font-['Poppins',sans-serif] text-[13px] font-bold bg-[#fdebc8] text-[#8a5300] border border-[#fcd58e]">
          <span className="w-2 h-2 rounded-full bg-[#e68a00]" />
          Tidak Sesuai
        </span>
        {skor !== undefined && skor > 0 && (
          <span className="text-[11px] text-[#8a5300] pl-1 font-mono">
            Skor: {skor.toFixed(3)}
          </span>
        )}
      </div>
    );
  }

  return (
    <span className="inline-block rounded-full px-3 py-1 font-['Poppins',sans-serif] text-[13px] font-medium bg-[#f1f5f9] text-[#475569]">
      {label || "Tidak Dinilai"}
    </span>
  );
};

/* ---------- Komponen Utama Dashboard ---------- */
export default function Dashboard() {
  const [alumniList, setAlumniList] = useState([]);
  const [totalAlumniDb, setTotalAlumniDb] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [mlStatus, setMlStatus] = useState({
    status: "checking", // 'checking' | 'online' | 'offline'
    source: null,
    latency: 0,
    models: [],
  });
  const [isEvaluating, setIsEvaluating] = useState(false);

  // State untuk Interactive ML Tester (Playground)
  const [simJurusan, setSimJurusan] = useState("RPL");
  const [simStatus, setSimStatus] = useState("Bekerja");
  const [simTeks, setSimTeks] = useState("Web Developer React & Node.js");
  const [simLoading, setSimLoading] = useState(false);
  const [simResult, setSimResult] = useState(null);

  // Format record dari tabel survey & alumni MySQL
  const formatSurveyList = (surveyData) => {
    return (surveyData || []).map((item) => {
      let tempat = "-";
      if (item.status_saat_ini === "Bekerja") {
        tempat =
          [item.nama_perusahaan, item.bidang_kerja].filter(Boolean).join(" - ") ||
          "Bekerja";
      } else if (item.status_saat_ini === "Kuliah") {
        tempat =
          [item.nama_kampus, item.jurusan_kampus].filter(Boolean).join(" - ") ||
          "Kuliah";
      } else if (item.status_saat_ini === "Wirausaha") {
        tempat = item.nama_perusahaan || item.bidang_kerja || "Wirausaha";
      } else if (item.status_saat_ini === "Belum Bekerja") {
        tempat = "Belum Bekerja";
      }

      const isRelevan =
        item.relevansi_jurusan === "Sangat Sesuai" ||
        item.relevansi_jurusan === "Cukup Sesuai";

      return {
        id: item.id,
        alumniId: item.alumni_id,
        nama: item.nama || "-",
        nisn: item.nis || "-",
        jurusan: item.jurusan || "-",
        status: item.status_saat_ini || "-",
        tempat,
        bidangKerja: item.bidang_kerja || "",
        jurusanKampus: item.jurusan_kampus || "",
        mlLabel: item.relevansi_jurusan || "Belum Dihitung",
        relevan: isRelevan,
        relevansi: item.relevansi_jurusan,
        tahunLulus: item.tahun_lulus,
      };
    });
  };

  // Muat data awal dari MySQL
  const muatData = async () => {
    try {
      setLoading(true);
      setError("");

      const [resSurvey, resStats] = await Promise.all([
        api.get("/survey"),
        api.get("/survey/stats").catch(() => ({ data: { totalAlumni: 0 } })),
      ]);

      if (resStats.data?.totalAlumni) {
        setTotalAlumniDb(resStats.data.totalAlumni);
      }

      const formatted = formatSurveyList(resSurvey.data || []);
      setAlumniList(formatted);

      // Cek koneksi ML API
      const health = await checkMlHealth();
      setMlStatus(health);
    } catch (err) {
      console.error("Gagal memuat data dashboard dari MySQL:", err);
      setError("Gagal memuat data dari database MySQL. Pastikan Anda sudah login.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    muatData();
  }, []);

  // Fungsi untuk memanggil ML API dan memprediksi/hitung ulang data
  const jalankanPrediksiMl = async () => {
    setIsEvaluating(true);
    try {
      const health = await checkMlHealth();
      setMlStatus(health);

      // 1. Panggil endpoint backend untuk memperbarui relevansi yang masih NULL di database
      try {
        await api.post("/survey/hitung-ulang-relevansi");
      } catch (e) {
        console.warn("Backend hitung ulang:", e);
      }

      // 2. Ambil data terbaru dari database
      const res = await api.get("/survey");
      const formatted = formatSurveyList(res.data || []);

      // 3. Batch predict dengan ML API untuk live score
      const hasilPrediksi = await batchPredictRelevance(formatted);
      setAlumniList(hasilPrediksi);
    } catch (err) {
      console.error("Gagal menjalankan batch ML prediksi:", err);
    } finally {
      setIsEvaluating(false);
    }
  };

  // Perhitungan statistik dinamis berbasis data MySQL dan Machine Learning
  const stats = useMemo(() => {
    const totalResponden = alumniList.length;
    const totalAlumni = totalAlumniDb || totalResponden;

    const sudahBekerjaKuliah = alumniList.filter(
      (a) => a.status === "Bekerja" || a.status === "Kuliah",
    ).length;

    // Filter yang dievaluasi relevansinya (Bekerja & Kuliah)
    const dinilaiMl = alumniList.filter(
      (a) => a.status === "Bekerja" || a.status === "Kuliah",
    );
    const relevanCount = dinilaiMl.filter(
      (a) =>
        a.mlLabel === "Sangat Sesuai" ||
        a.mlLabel === "Cukup Sesuai" ||
        a.relevan === true,
    ).length;
    const tidakRelevanCount = dinilaiMl.filter(
      (a) => a.mlLabel === "Tidak Sesuai",
    ).length;

    const totalJawabanDinilai = relevanCount + tidakRelevanCount;
    const persenRelevan =
      totalJawabanDinilai > 0
        ? Math.round((relevanCount / totalJawabanDinilai) * 100)
        : 0;
    const persenTidak =
      totalJawabanDinilai > 0
        ? Math.round((tidakRelevanCount / totalJawabanDinilai) * 100)
        : 0;
    const persenBekerjaKuliah =
      totalResponden > 0
        ? Math.round((sudahBekerjaKuliah / totalResponden) * 100)
        : 0;

    // Rata-rata skor kemiripan ML (cosine similarity)
    const skorValid = dinilaiMl
      .map((a) => a.mlSkor || 0)
      .filter((s) => s > 0);
    const avgScore =
      skorValid.length > 0
        ? (skorValid.reduce((a, b) => a + b, 0) / skorValid.length).toFixed(3)
        : "0.000";

    // Hitung persentase kecocokan ML per jurusan SMK
    const daftarJurusan = [
      { key: "RPL", aliases: ["RPL", "Rekayasa Perangkat Lunak"] },
      { key: "AKL", aliases: ["AKL", "Akuntansi"] },
      { key: "OTKP", aliases: ["OTKP", "Otomatisasi Tata Kelola Perkantoran"] },
      { key: "BDP", aliases: ["BDP", "Bisnis Daring dan Pemasaran"] },
      { key: "Perhotelan", aliases: ["Perhotelan"] },
    ];

    const perJurusan = daftarJurusan.map((j) => {
      const siswaJurusan = dinilaiMl.filter((a) =>
        j.aliases.includes(a.jurusan),
      );
      if (siswaJurusan.length === 0) {
        return { jurusan: j.key, persen: 0, total: 0 };
      }
      const cocok = siswaJurusan.filter(
        (a) =>
          a.mlLabel === "Sangat Sesuai" ||
          a.mlLabel === "Cukup Sesuai" ||
          a.relevan === true,
      ).length;
      const persen = Math.round((cocok / siswaJurusan.length) * 100);
      return { jurusan: j.key, persen, total: siswaJurusan.length };
    });

    return {
      totalAlumni,
      totalResponden,
      sudahBekerjaKuliah,
      relevanCount,
      tidakRelevanCount,
      persenRelevan,
      persenTidak,
      persenBekerjaKuliah,
      avgScore,
      perJurusan,
    };
  }, [alumniList, totalAlumniDb]);

  // Handler uji prediksi simulasi ML secara langsung
  const handleTestSimulation = async (e) => {
    e.preventDefault();
    if (!simTeks.trim()) return;

    setSimLoading(true);
    setSimResult(null);
    try {
      const res = await predictSingleRelevance({
        jurusan: simJurusan,
        statusSaatIni: simStatus,
        bidangKerja: simStatus === "Bekerja" ? simTeks : "",
        jurusanKampus: simStatus === "Kuliah" ? simTeks : "",
      });
      setSimResult(res);
    } catch (err) {
      console.error("Gagal uji coba ML:", err);
      setSimResult({
        label: "Gagal Menguji",
        skor: 0,
        tersedia: false,
      });
    } finally {
      setSimLoading(false);
    }
  };

  // Handler menambahkan hasil simulasi ke daftar sementara
  const handleAddSimulationToDashboard = () => {
    if (!simResult || !simResult.tersedia) return;
    const newEntry = {
      id: Date.now(),
      nama: `Simulasi Alumni #${alumniList.length + 1}`,
      baru: true,
      jurusan: simJurusan,
      status: simStatus,
      tempat: simTeks,
      bidangKerja: simStatus === "Bekerja" ? simTeks : "",
      jurusanKampus: simStatus === "Kuliah" ? simTeks : "",
      mlLabel: simResult.label,
      mlSkor: simResult.skor,
      relevan: simResult.kategori === "relevan",
    };
    setAlumniList([newEntry, ...alumniList]);
  };

  return (
    <div className="space-y-6 font-['Inter',sans-serif] pb-10">
      {/* Header Dashboard & Status Bar ML */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#e8f3ff] text-[#1a66cc] text-xs font-semibold uppercase tracking-wider mb-2">
            <span className="w-2 h-2 rounded-full bg-[#1a66cc] animate-ping" />
            Machine Learning Active Mode
          </div>
          <h1 className="font-['Poppins',sans-serif] text-[28px] font-bold leading-tight text-[#12263f] lg:text-[38px]">
            Dashboard Tracer Study
          </h1>
          <p className="mt-1 text-[15px] text-[#4a6180] lg:text-[17px]">
            Analisis kesesuaian kompetensi lulusan berbasis Model Machine
            Learning (Cosine Similarity) & Data MySQL.
          </p>
        </div>

        {/* Status Koneksi ML Widget */}
        <div className="flex flex-wrap items-center gap-3">
          <div
            className={`flex items-center gap-2.5 px-4 py-2.5 rounded-2xl border text-sm font-medium transition-all ${
              mlStatus.status === "online"
                ? "bg-[#ecfdf5] border-[#a7f3d0] text-[#065f46]"
                : mlStatus.status === "checking"
                  ? "bg-[#fffbeb] border-[#fde68a] text-[#92400e]"
                  : "bg-[#fef2f2] border-[#fecaca] text-[#991b1b]"
            }`}
          >
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                mlStatus.status === "online"
                  ? "bg-[#10b981]"
                  : mlStatus.status === "checking"
                    ? "bg-[#f59e0b] animate-bounce"
                    : "bg-[#ef4444]"
              }`}
            />
            <span>
              {mlStatus.status === "online"
                ? `ML API Terhubung (${mlStatus.source === "flask" ? "Flask Port 5001" : "Express Gateway"}${
                    mlStatus.latency ? ` • ${mlStatus.latency}ms` : ""
                  })`
                : mlStatus.status === "checking"
                  ? "Menghubungkan ke Model ML..."
                  : "ML API Offline (Jalankan Flask Port 5001)"}
            </span>
          </div>

          <button
            onClick={() => jalankanPrediksiMl()}
            disabled={isEvaluating}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-[#12263f] hover:bg-[#1e3a5f] text-white text-sm font-semibold transition-all shadow-sm disabled:opacity-50 cursor-pointer"
            title="Hitung ulang evaluasi Machine Learning untuk data di database"
          >
            <svg
              className={`w-4 h-4 ${isEvaluating ? "animate-spin" : ""}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            {isEvaluating ? "Menganalisis ML..." : "Hitung Ulang ML"}
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Info Notice Koneksi Database */}
      <div className="rounded-2xl border border-sky-200 bg-sky-50/80 p-4 text-sm text-sky-800 flex items-start gap-3">
        <svg
          className="w-5 h-5 text-sky-600 shrink-0 mt-0.5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <div>
          <span className="font-bold">Status Integrasi:</span> Dashboard ini sudah terhubung langsung ke database <strong>MySQL</strong> (Tabel Alumni & Survey) dan model <strong>Machine Learning NLP</strong>. Seluruh metrik di bawah mencerminkan data aktual.
        </div>
      </div>

      {/* Kartu Statistik Utama */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 lg:gap-6">
        <StatCard
          value={stats.totalAlumni}
          label="Total Alumni"
          subtext={`${stats.totalResponden} alumni telah mengisi survei`}
        />
        <StatCard
          value={`${stats.persenRelevan}%`}
          label="Relevansi ML"
          subtext={`${stats.relevanCount} alumni dinilai sesuai model`}
        />
        <StatCard
          value={`${stats.persenTidak}%`}
          label="Tidak Relevan"
          subtext={`${stats.tidakRelevanCount} alumni di luar rumpun`}
        />
        <StatCard
          value={`${stats.persenBekerjaKuliah}%`}
          label="Bekerja / Kuliah"
          subtext={`Avg Cosine Score: ${stats.avgScore}`}
        />
      </div>

      {/* Proporsi kecocokan - hanya tampil di layar Mobile */}
      <Card className="p-5 lg:hidden">
        <h2 className="mb-4 font-['Poppins',sans-serif] text-lg font-bold text-[#12263f]">
          Proporsi Kesesuaian Model ML
        </h2>
        <Bar persen={stats.persenRelevan} />
        <div className="mt-5">
          <Legend
            relevan={`Relevan (${stats.persenRelevan}%)`}
            tidak={`Tidak relevan (${stats.persenTidak}%)`}
          />
        </div>
      </Card>

      {/* Grid: Kecocokan per jurusan & Model Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Kecocokan per jurusan (dihitung dinamis dari ML) */}
        <Card className="p-5 lg:p-8 lg:col-span-2">
          <div className="flex items-center justify-between mb-5 lg:mb-6">
            <div>
              <h2 className="font-['Poppins',sans-serif] text-xl font-bold text-[#12263f] lg:text-2xl">
                Kecocokan per Jurusan (Hasil ML)
              </h2>
              <p className="text-xs text-[#5b7794] mt-0.5">
                Persentase lulusan yang relevan dihitung dinamis dari prediksi
                model untuk setiap jurusan
              </p>
            </div>
          </div>

          <ul className="space-y-6 lg:space-y-4">
            {stats.perJurusan.map((j) => (
              <li
                key={j.jurusan}
                className="grid grid-cols-[1fr_auto] items-center gap-x-4 gap-y-2 lg:grid-cols-[170px_1fr_56px] lg:gap-x-6"
              >
                <div className="flex items-center gap-2">
                  <span className="text-[17px] font-medium text-[#12263f]">
                    {j.jurusan}
                  </span>
                  <span className="text-xs text-[#718ba5]">
                    ({j.total} responden)
                  </span>
                </div>
                <span className="text-right font-['Poppins',sans-serif] text-[17px] font-bold text-[#12263f] lg:order-3">
                  {j.persen}%
                </span>
                <div className="col-span-2 lg:order-2 lg:col-span-1">
                  <Bar persen={j.persen} />
                </div>
              </li>
            ))}
          </ul>

          <div className="mt-6 pt-4 border-t border-[#eef4fb] hidden lg:flex items-center justify-between">
            <Legend relevan="Sesuai / Relevan (ML)" tidak="Tidak Sesuai (ML)" />
            <span className="text-xs text-[#718ba5]">
              Threshold Cosine Similarity: 0.05 - 0.15
            </span>
          </div>
        </Card>

        {/* Info Detail Model Machine Learning */}
        <Card className="p-5 lg:p-7 flex flex-col justify-between bg-gradient-to-br from-white to-[#f8fbfe]">
          <div>
            <div className="flex items-center gap-2 text-indigo-700 font-semibold text-sm mb-2">
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
              <span>Spesifikasi Model NLP</span>
            </div>
            <h3 className="font-['Poppins',sans-serif] text-xl font-bold text-[#12263f]">
              Cosine Similarity Engine
            </h3>
            <p className="mt-2 text-sm text-[#4a6180] leading-relaxed">
              Model mengubah teks bidang kerja / nama program studi menjadi
              vektor TF-IDF dan membandingkannya dengan profil kompetensi
              jurusan SMK.
            </p>

            <div className="mt-5 space-y-3">
              <div className="flex justify-between items-center text-sm py-2 border-b border-[#eef4fb]">
                <span className="text-[#5b7794]">Arsitektur:</span>
                <span className="font-semibold text-[#12263f]">
                  TF-IDF + Cosine Sim
                </span>
              </div>
              <div className="flex justify-between items-center text-sm py-2 border-b border-[#eef4fb]">
                <span className="text-[#5b7794]">Tipe Model:</span>
                <span className="font-semibold text-[#12263f]">
                  Bekerja & Kuliah
                </span>
              </div>
              <div className="flex justify-between items-center text-sm py-2 border-b border-[#eef4fb]">
                <span className="text-[#5b7794]">Rata-rata Skor:</span>
                <span className="font-semibold text-[#21a65b] font-mono">
                  {stats.avgScore}
                </span>
              </div>
              <div className="flex justify-between items-center text-sm py-2">
                <span className="text-[#5b7794]">Port Layanan:</span>
                <span className="font-mono text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                  5001 (Flask)
                </span>
              </div>
            </div>
          </div>

          <div className="mt-6 p-3 rounded-2xl bg-[#eff6ff] text-xs text-[#1e40af] border border-[#dbeafe]">
            💡 Klik tombol <strong>Hitung Ulang ML</strong> di kanan atas untuk
            memverifikasi respon real-time saat Flask ML berjalan.
          </div>
        </Card>
      </div>

      {/* Fitur Interaktif: Uji Prediksi Cepat Machine Learning (Playground Tester) */}
      <Card className="p-5 lg:p-8 border-[#bfdbfe] bg-[#fbfdff]">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-2 mb-5">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#2563eb] uppercase tracking-wider mb-1">
              <span>⚡ Interactive ML Playground</span>
            </div>
            <h2 className="font-['Poppins',sans-serif] text-xl lg:text-2xl font-bold text-[#12263f]">
              Uji Coba Prediksi Model Machine Learning Langsung
            </h2>
            <p className="text-sm text-[#4a6180]">
              Coba masukkan jurusan dan deskripsi pekerjaan untuk menguji respon
              klasifikasi model secara langsung.
            </p>
          </div>
        </div>

        <form
          onSubmit={handleTestSimulation}
          className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end"
        >
          <div className="md:col-span-3">
            <label className="block text-xs font-semibold text-[#334e68] mb-1.5">
              Jurusan SMK
            </label>
            <select
              value={simJurusan}
              onChange={(e) => setSimJurusan(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#cbd5e1] bg-white text-sm text-[#1e293b] focus:ring-2 focus:ring-[#2563eb] focus:outline-none"
            >
              <option value="RPL">RPL (Rekayasa Perangkat Lunak)</option>
              <option value="AKL">AKL (Akuntansi)</option>
              <option value="OTKP">OTKP (Perkantoran)</option>
              <option value="BDP">BDP (Bisnis Pemasaran)</option>
              <option value="Perhotelan">Perhotelan</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-[#334e68] mb-1.5">
              Status Responden
            </label>
            <select
              value={simStatus}
              onChange={(e) => setSimStatus(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#cbd5e1] bg-white text-sm text-[#1e293b] focus:ring-2 focus:ring-[#2563eb] focus:outline-none"
            >
              <option value="Bekerja">Bekerja</option>
              <option value="Kuliah">Kuliah</option>
            </select>
          </div>

          <div className="md:col-span-5">
            <label className="block text-xs font-semibold text-[#334e68] mb-1.5">
              {simStatus === "Bekerja"
                ? "Posisi / Bidang Pekerjaan"
                : "Program Studi Kampus"}
            </label>
            <input
              type="text"
              value={simTeks}
              onChange={(e) => setSimTeks(e.target.value)}
              placeholder={
                simStatus === "Bekerja"
                  ? "contoh: Frontend Web Developer, Staff Accounting..."
                  : "contoh: Teknik Informatika, Ilmu Komunikasi..."
              }
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#cbd5e1] bg-white text-sm text-[#1e293b] focus:ring-2 focus:ring-[#2563eb] focus:outline-none"
            />
          </div>

          <div className="md:col-span-2">
            <button
              type="submit"
              disabled={simLoading || !simTeks.trim()}
              className="w-full py-2.5 px-4 rounded-xl bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-sm font-semibold transition-all shadow-sm disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
            >
              {simLoading ? (
                <>
                  <svg
                    className="w-4 h-4 animate-spin"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v8H4z"
                    />
                  </svg>
                  <span>Menguji...</span>
                </>
              ) : (
                <>
                  <span>Uji ML</span>
                  <span>⚡</span>
                </>
              )}
            </button>
          </div>
        </form>

        {/* Hasil Uji Prediksi */}
        {simResult && (
          <div className="mt-5 p-4 rounded-2xl border border-[#bfdbfe] bg-white flex flex-col md:flex-row md:items-center justify-between gap-4 animate-fadeIn">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-[#eff6ff] flex items-center justify-center text-xl shrink-0">
                🎯
              </div>
              <div>
                <div className="text-xs text-[#5b7794]">
                  Hasil Analisis Machine Learning:
                </div>
                <div className="flex items-center gap-2.5 mt-0.5">
                  <MlBadge label={simResult.label} skor={simResult.skor} />
                  <span className="text-xs text-[#64748b]">
                    Sumber:{" "}
                    {simResult.source === "flask"
                      ? "Flask Port 5001"
                      : "Express ML Route"}
                  </span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={handleAddSimulationToDashboard}
              className="px-4 py-2 rounded-xl border border-[#cbd5e1] hover:bg-[#f1f5f9] text-[#1e293b] text-xs font-semibold transition-colors cursor-pointer"
            >
              ➕ Tambah ke Sampel Sementara
            </button>
          </div>
        )}
      </Card>

      {/* Tabel Jawaban Terbaru Terklasifikasi ML */}
      <Card className="p-5 lg:p-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-5 lg:mb-6">
          <div>
            <h2 className="font-['Poppins',sans-serif] text-xl font-bold text-[#12263f] lg:text-2xl">
              Jawaban Terbaru & Klasifikasi Relevansi ML
            </h2>
            <p className="text-xs text-[#5b7794] mt-0.5">
              Setiap baris bersumber dari database MySQL dan dianalisis oleh
              model machine learning
            </p>
          </div>
          <div className="text-xs text-[#718ba5]">
            Menampilkan {alumniList.length} data responden survei
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-180 border-collapse text-left text-[16px]">
            <thead>
              <tr className="border-b border-[#d9e6f5] text-[14px] font-medium text-[#4a6180]">
                <th className="pb-4 pr-6 font-semibold">Nama Responden</th>
                <th className="pb-4 pr-6 font-semibold">Jurusan</th>
                <th className="pb-4 pr-6 font-semibold">Status</th>
                <th className="pb-4 pr-6 font-semibold">Tempat / Aktivitas</th>
                <th className="pb-4 font-semibold">Klasifikasi Model ML</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-[#5b7794] animate-pulse">
                    Memuat data responden dari database MySQL...
                  </td>
                </tr>
              ) : alumniList.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-[#5b7794]">
                    Belum ada alumni yang mengisi kuesioner tracer study di database MySQL.
                  </td>
                </tr>
              ) : (
                alumniList.map((r) => (
                  <tr
                    key={r.id}
                    className="border-b border-[#d9e6f5] text-[#12263f] last:border-b-0 hover:bg-[#f8fbfe] transition-colors"
                  >
                    <td className="whitespace-nowrap py-4 pr-6 font-medium">
                      {r.nama}
                      {r.baru && (
                        <span className="ml-2.5 rounded-full bg-[#f5a623] px-2.5 py-0.5 align-middle text-[11px] font-bold text-[#6b3f00]">
                          SIMULASI
                        </span>
                      )}
                    </td>
                    <td className="py-4 pr-6 font-medium text-[#334e68]">
                      <span className="px-2.5 py-1 rounded-lg bg-[#f0f4f8] text-xs font-bold text-[#1e3a5f]">
                        {r.jurusan}
                      </span>
                    </td>
                    <td className="py-4 pr-6">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          r.status === "Bekerja"
                            ? "bg-emerald-50 text-emerald-700"
                            : r.status === "Kuliah"
                              ? "bg-sky-50 text-sky-700"
                              : "bg-amber-50 text-amber-700"
                        }`}
                      >
                        {r.status}
                      </span>
                    </td>
                    <td className="py-4 pr-6 text-[15px] text-[#243b53]">
                      {r.bidangKerja || r.jurusanKampus || r.tempat}
                    </td>
                    <td className="py-4">
                      <MlBadge
                        label={r.mlLabel}
                        skor={r.mlSkor}
                        isEvaluating={isEvaluating}
                      />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
