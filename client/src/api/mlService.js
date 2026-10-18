import api from "./axios";

const ML_DIRECT_URL = "http://localhost:5001";

/**
 * Cek status kesehatan / ketersediaan ML API
 */
export async function checkMlHealth() {
  const startTime = Date.now();

  // 1. Coba lewat Flask direct (port 5001)
  try {
    const res = await fetch(`${ML_DIRECT_URL}/health`, {
      method: "GET",
      signal: AbortSignal.timeout(3000),
    });
    if (res.ok) {
      const data = await res.json();
      const latency = Date.now() - startTime;
      return {
        status: "online",
        source: "flask",
        latency,
        models: data.models || ["bekerja", "kuliah"],
      };
    }
  } catch {
    // Abaikan jika gagal, coba lewat Express backend
  }

  // 2. Coba lewat backend Express
  try {
    const res = await api.post("/survey/prediksi-relevansi", {
      jurusan: "RPL",
      statusSaatIni: "Bekerja",
      bidangKerja: "Software Engineer",
    });
    const latency = Date.now() - startTime;
    if (res.data && res.data.tersedia) {
      return {
        status: "online",
        source: "backend",
        latency,
        models: ["bekerja", "kuliah"],
      };
    }
  } catch {
    // Kedua servis belum merespons
  }

  return { status: "offline", source: null, latency: 0, models: [] };
}

/**
 * Prediksi relevansi untuk satu data alumni menggunakan model Machine Learning
 */
export async function predictSingleRelevance({
  jurusan,
  statusSaatIni,
  bidangKerja = "",
  jurusanKampus = "",
}) {
  // Hanya status Bekerja dan Kuliah yang dinilai relevansinya oleh ML
  if (statusSaatIni !== "Bekerja" && statusSaatIni !== "Kuliah") {
    return {
      relevansi: null,
      skor: 0,
      tersedia: false,
      label: statusSaatIni === "Wirausaha" ? "Wirausaha" : "Belum Bekerja",
      kategori: "netral",
    };
  }

  const teks = statusSaatIni === "Bekerja" ? bidangKerja : jurusanKampus;
  const tipe = statusSaatIni === "Bekerja" ? "bekerja" : "kuliah";

  if (!teks || !jurusan) {
    return {
      relevansi: null,
      skor: 0,
      tersedia: false,
      label: "Data Tidak Lengkap",
      kategori: "unknown",
    };
  }

  // Prioritas 1: Lewat Express backend
  try {
    const res = await api.post("/survey/prediksi-relevansi", {
      jurusan,
      statusSaatIni,
      bidangKerja,
      jurusanKampus,
    });
    if (res.data && res.data.relevansi) {
      const rel = res.data.relevansi;
      const isRelevan = rel === "Sangat Sesuai" || rel === "Cukup Sesuai";
      return {
        relevansi: rel,
        skor: res.data.skor || 0,
        tersedia: true,
        label: rel,
        kategori: isRelevan ? "relevan" : "tidak-relevan",
        source: "backend",
      };
    }
  } catch {
    // Fallback ke direct Flask jika backend belum aktif
  }

  // Prioritas 2: Lewat direct Flask ML API (port 5001)
  try {
    const res = await fetch(`${ML_DIRECT_URL}/predict`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jurusan,
        tipe,
        teks,
      }),
      signal: AbortSignal.timeout(4000),
    });

    if (res.ok) {
      const data = await res.json();
      if (data.relevansi) {
        const isRelevan =
          data.relevansi === "Sangat Sesuai" ||
          data.relevansi === "Cukup Sesuai";
        return {
          relevansi: data.relevansi,
          skor: data.skor || 0,
          tersedia: true,
          label: data.relevansi,
          kategori: isRelevan ? "relevan" : "tidak-relevan",
          source: "flask",
        };
      }
    }
  } catch {
    // ML API offline
  }

  return {
    relevansi: null,
    skor: 0,
    tersedia: false,
    label: "Tidak Diketahui",
    kategori: "unknown",
  };
}

/**
 * Gabungkan data alumni dengan hasil ML
 */
function gabungkanHasil(item, hasilMl) {
  return {
    ...item,
    mlRelevansi: hasilMl.relevansi,
    mlSkor: hasilMl.skor,
    mlLabel: hasilMl.label,
    mlKategori: hasilMl.kategori,
    mlTersedia: hasilMl.tersedia,
    relevan: hasilMl.kategori === "relevan",
  };
}

/**
 * Prediksi relevansi untuk daftar alumni.
 * Semua data yang layak diprediksi dikirim dalam 1 request ke /predict-batch.
 * Kalau batch gagal, fallback ke cara lama (1 request per alumni).
 */
export async function batchPredictRelevance(alumniList) {
  const prepared = alumniList.map((item) => {
    const bidang = item.bidangKerja || item.tempat || "";
    const kampus = item.jurusanKampus || item.tempat || "";
    const isBekerja = item.status === "Bekerja";
    const isKuliah = item.status === "Kuliah";
    const teks = isBekerja ? bidang : kampus;

    return {
      item,
      params: {
        jurusan: item.jurusan,
        statusSaatIni: item.status,
        bidangKerja: bidang,
        jurusanKampus: kampus,
      },
      tipe: isBekerja ? "bekerja" : "kuliah",
      teks,
      eligible: (isBekerja || isKuliah) && !!teks && !!item.jurusan,
      batchIndex: -1,
    };
  });

  // Susun payload batch hanya untuk data yang layak
  const batchItems = [];
  prepared.forEach((p) => {
    if (p.eligible) {
      p.batchIndex = batchItems.length;
      batchItems.push({
        jurusan: p.params.jurusan,
        tipe: p.tipe,
        teks: p.teks,
      });
    }
  });

  // Kirim 1 request untuk semuanya
  let batchResults = null;
  if (batchItems.length > 0) {
    try {
      const res = await fetch(`${ML_DIRECT_URL}/predict-batch`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: batchItems }),
        signal: AbortSignal.timeout(15000),
      });
      if (res.ok) {
        const data = await res.json();
        if (
          Array.isArray(data.hasil) &&
          data.hasil.length === batchItems.length
        ) {
          batchResults = data.hasil;
        }
      }
    } catch {
      // Batch gagal, pakai fallback per item
    }
  }

  return Promise.all(
    prepared.map(async (p) => {
      // Batch berhasil dan data ini ikut diprediksi
      if (p.eligible && batchResults) {
        const r = batchResults[p.batchIndex];
        if (r && r.relevansi) {
          const isRelevan =
            r.relevansi === "Sangat Sesuai" || r.relevansi === "Cukup Sesuai";
          return gabungkanHasil(p.item, {
            relevansi: r.relevansi,
            skor: r.skor || 0,
            tersedia: true,
            label: r.relevansi,
            kategori: isRelevan ? "relevan" : "tidak-relevan",
          });
        }
        return gabungkanHasil(p.item, {
          relevansi: null,
          skor: 0,
          tersedia: false,
          label: "Tidak Diketahui",
          kategori: "unknown",
        });
      }

      // Tidak layak (Wirausaha, data kosong, dll) atau batch gagal:
      // pakai fungsi lama (yang tidak layak langsung return tanpa request)
      const hasilMl = await predictSingleRelevance(p.params);
      return gabungkanHasil(p.item, hasilMl);
    }),
  );
}
