import React, { useState } from "react";

/**
 * Konten utama halaman "Pertanyaan umum" (FAQ).
 * Tanpa navbar dan footer (dipasang terpisah di layout).
 *
 * Props (semua opsional):
 *  - judul : judul halaman
 *  - items : daftar pertanyaan, bentuk [{ tanya, jawab }]
 */
const DAFTAR_FAQ = [
  {
    tanya: "Apakah data saya aman?",
    jawab:
      "Ya. Data yang kamu isi hanya digunakan untuk keperluan evaluasi dan peningkatan mutu pendidikan sekolah, serta tidak dibagikan kepada pihak lain di luar sekolah.",
  },
  {
    tanya: "Bagaimana jika saya belum bekerja atau kuliah?",
    jawab:
      "Tidak masalah. Kamu tetap bisa mengisi survei dengan memilih status yang sesuai, misalnya belum bekerja, mencari kerja, atau berwirausaha. Semua jawaban tetap berharga bagi sekolah.",
  },
  {
    tanya: "Bagaimana kecocokan jurusan dinilai?",
    jawab:
      "Kecocokan dinilai dari jawabanmu tentang seberapa relevan pekerjaan atau studi lanjutanmu dengan jurusan yang kamu ambil di sekolah, menggunakan skala penilaian sederhana.",
  },
  {
    tanya: "Apakah saya bisa mengubah jawaban?",
    jawab:
      "Bisa. Selama masa pengisian survei masih dibuka, kamu dapat masuk kembali dan memperbarui jawabanmu kapan saja.",
  },
];

export default function Faq({ judul = "Pertanyaan umum", items = DAFTAR_FAQ }) {
  // Hanya satu pertanyaan yang terbuka dalam satu waktu (null = semua tertutup)
  const [terbuka, setTerbuka] = useState(null);

  const toggle = (index) => setTerbuka((sekarang) => (sekarang === index ? null : index));

  return (
    <main className="bg-[#eaf3fd] px-5 py-8 sm:px-8 sm:py-10 lg:px-[135px] lg:py-12">
      {/* Judul */}
      <h1 className="mb-5 text-2xl font-extrabold leading-tight tracking-tight text-[#0f1a24] sm:text-3xl lg:mb-6 lg:text-5xl">
        {judul}
      </h1>

      <section className="rounded-xl bg-white px-5 pb-6 pt-2 shadow-[0_2px_10px_rgba(15,26,36,0.1)] sm:px-6 sm:pb-8 lg:rounded-2xl lg:px-8 lg:pb-8 lg:pt-2">
        {items.map((item, index) => {
          const aktif = terbuka === index;
          const idJawaban = `faq-jawaban-${index}`;

          return (
            <div key={item.tanya}>
              <h2>
                <button
                  type="button"
                  onClick={() => toggle(index)}
                  aria-expanded={aktif}
                  aria-controls={idJawaban}
                  className="flex w-full items-center justify-between gap-4 py-4 text-left text-base font-medium leading-snug text-slate-700 transition-colors hover:text-[#1769aa] focus:outline-none focus-visible:text-[#1769aa] sm:text-lg lg:py-4 lg:text-xl"
                >
                  <span>{item.tanya}</span>
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className={`h-5 w-5 shrink-0 text-slate-600 transition-transform duration-300 lg:h-6 lg:w-6 ${aktif ? "rotate-180" : ""
                      }`}
                    aria-hidden="true"
                  >
                    <path d="m6 9 6 6 6-6" />
                  </svg>
                </button>
              </h2>

              {/* Jawaban: dianimasikan lewat transisi tinggi baris grid */}
              <div
                id={idJawaban}
                role="region"
                className={`grid transition-[grid-template-rows] duration-300 ease-out ${aktif ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                  }`}
              >
                <div className="overflow-hidden">
                  <p className="pb-4 pr-9 text-[0.9375rem] leading-7 text-slate-500 sm:text-base lg:pb-4 lg:pr-12 lg:text-lg lg:leading-8">
                    {item.jawab}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </section>
    </main>
  );
}