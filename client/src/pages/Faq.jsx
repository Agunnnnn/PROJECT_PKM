import React, { useState } from "react";

const JAWABAN_DEFAULT =
  "Data alumni dijaga kerahasiaannya dan digunakan untuk keperluan tracer study serta peningkatan mutu pendidikan sesuai kebijakan privasi sekolah.";

const DAFTAR_FAQ = [
  { tanya: "Apakah data saya aman?", jawab: JAWABAN_DEFAULT },
  { tanya: "Bagaimana jika saya belum bekerja atau kuliah?", jawab: JAWABAN_DEFAULT },
  { tanya: "Bagaimana kecocokan jurusan dinilai?", jawab: JAWABAN_DEFAULT },
  { tanya: "Apakah saya bisa mengubah jawaban?", jawab: JAWABAN_DEFAULT },
];

/**
 * Konten utama halaman FAQ ("Pertanyaan umum").
 * Navbar dan footer dipasang terpisah di layout.
 *
 * Props (opsional):
 *  - judul       : judul halaman
 *  - items       : array { tanya, jawab }
 *  - defaultOpen : "all" untuk membuka semua jawaban saat awal,
 *                  atau array index, mis. [0, 2]. Default: semua tertutup.
 */
export default function Faq({
  judul = "Pertanyaan umum",
  items = DAFTAR_FAQ,
  defaultOpen = [],
}) {
  const [terbuka, setTerbuka] = useState(() =>
    defaultOpen === "all" ? items.map((_, i) => i) : defaultOpen
  );

  const toggle = (index) =>
    setTerbuka((sekarang) =>
      sekarang.includes(index)
        ? sekarang.filter((i) => i !== index)
        : [...sekarang, index]
    );

  return (
    <main className="bg-[#eaf3fd] px-5 py-10 sm:px-8 lg:px-[125px] lg:py-[72px]">
      <h1 className="mb-6 text-[2rem] font-extrabold leading-tight text-[#0f1a24] sm:text-5xl lg:mb-10 lg:text-[4.2rem]">
        {judul}
      </h1>

      <section className="rounded-3xl bg-white px-3 py-4 shadow-[0_4px_14px_rgba(15,26,36,0.12)] sm:px-6 lg:rounded-2xl lg:px-[60px] lg:py-[60px]">
        {items.map((item, index) => {
          const buka = terbuka.includes(index);
          const idJawaban = `faq-jawaban-${index}`;

          return (
            <div key={item.tanya} className="px-3 py-3 lg:py-5">
              {/* Pertanyaan */}
              <button
                type="button"
                onClick={() => toggle(index)}
                aria-expanded={buka}
                aria-controls={idJawaban}
                className="flex w-full items-center justify-between gap-4 rounded-md px-3 py-1 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1769aa] lg:px-0"
              >
                <span className="text-base font-medium leading-snug text-slate-600 sm:text-lg lg:text-[2rem]">
                  {item.tanya}
                </span>
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                  className={`h-7 w-7 shrink-0 text-slate-600 transition-transform duration-300 lg:h-10 lg:w-10 ${buka ? "rotate-180" : ""
                    }`}
                >
                  <path d="M5 9l7 7 7-7" />
                </svg>
              </button>

              {/* Jawaban (dropdown) */}
              <div
                id={idJawaban}
                role="region"
                className={`grid transition-[grid-template-rows] duration-300 ease-out ${buka ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                  }`}
              >
                <div className="overflow-hidden">
                  <p className="px-0 pb-1 pt-5 text-xs leading-relaxed text-slate-700 sm:text-sm lg:text-base">
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