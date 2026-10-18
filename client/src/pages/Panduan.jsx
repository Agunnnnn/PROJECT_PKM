import React from "react";

/* ===================== IKON ===================== */
const svgProps = {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "1.8",
    strokeLinecap: "round",
    strokeLinejoin: "round",
    "aria-hidden": "true",
};

function IkonDataDiri({ className = "" }) {
    return (
        <svg {...svgProps} className={className}>
            <rect x="4" y="3" width="16" height="18" rx="2" />
            <circle cx="12" cy="10" r="2.5" />
            <path d="M7.5 17c.8-2 2.4-3 4.5-3s3.7 1 4.5 3" />
        </svg>
    );
}

function IkonKoper({ className = "" }) {
    return (
        <svg {...svgProps} className={className}>
            <rect x="3" y="7" width="18" height="13" rx="2" />
            <path d="M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
            <path d="M3 13h18" />
        </svg>
    );
}

function IkonPapanKlip({ className = "" }) {
    return (
        <svg {...svgProps} className={className}>
            <rect x="5" y="4" width="14" height="17" rx="2" />
            <path d="M9 4h6v2a1 1 0 0 1-1 1h-4a1 1 0 0 1-1-1V4z" />
            <path d="M9 13l2 2 4-4" />
        </svg>
    );
}

function IkonKirim({ className = "" }) {
    return (
        <svg {...svgProps} className={className}>
            <path d="M21 3L3 10.5l7 3 3 7L21 3z" />
            <path d="M10 13.5L21 3" />
        </svg>
    );
}

/* ===================== DATA LANGKAH ===================== */
const LANGKAH = [
    {
        no: "01",
        judul: "Data Diri",
        isi: "Isi nama, tahun lulus, dan jurusan.",
        Ikon: IkonDataDiri,
        warnaIkon: "bg-[#1b3a9e] text-[#7dd3fc]",
    },
    {
        no: "02",
        judul: "Status Saat Ini",
        isi: "Pilih bekerja, kuliah, wirausaha, atau belum bekerja.",
        Ikon: IkonKoper,
        warnaIkon: "bg-[#6b5546] text-[#fde68a]",
    },
    {
        no: "03",
        judul: "Relevansi Jurusan",
        isi: "Nilai kecocokan pekerjaan dan kuliahmu dengan jurusan.",
        Ikon: IkonPapanKlip,
        warnaIkon: "bg-[#6b1f7a] text-[#f5d0fe]",
    },
    {
        no: "04",
        judul: "Selesai dan Kirim",
        isi: "Tinjau data dan kirim jawabanmu.",
        Ikon: IkonKirim,
        warnaIkon: "bg-[#0b6b8f] text-[#a5f3fc]",
    },
];

/* ===================== KOMPONEN UTAMA ===================== */
export default function PanduanPengisian({
    judul = "Panduan pengisian",
    pengantar = "Ikuti empat langkah singkat berikut. Selesai dalam sekitar 3 menit.",
    langkah = LANGKAH,
}) {
    return (
        <section
            id="panduan"
            className="bg-[#f0f8ff] px-5 py-12 sm:px-8 lg:px-10 lg:py-16"
        >
            <div className="mx-auto max-w-6xl">
                <h2 className="text-3xl font-extrabold leading-tight text-[#0f1a24] sm:text-4xl lg:text-5xl">
                    {judul}
                </h2>
                <p className="mt-4 max-w-md text-base leading-relaxed text-slate-700 sm:text-lg">
                    {pengantar}
                </p>

                <ol className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                    {langkah.map(({ no, judul: j, isi, Ikon, warnaIkon }) => (
                        <li
                            key={no}
                            className="relative overflow-hidden rounded-lg bg-[#1747e6] p-5 text-white shadow-[5px_5px_0_rgba(15,26,36,0.18)]"
                        >
                            {/* Lingkaran nomor di pojok kanan atas */}
                            <span
                                aria-hidden="true"
                                className="absolute -right-10 -top-10 flex h-[120px] w-[120px] items-end justify-start rounded-full bg-[#0f3cb8]/70 pb-6 pl-7 text-4xl font-extrabold text-white/25"
                            >
                                <span className="translate-x-1 translate-y-1">{no}</span>
                            </span>

                            <span
                                className={`relative flex h-9 w-9 items-center justify-center rounded-md ${warnaIkon}`}
                            >
                                <Ikon className="h-5 w-5" />
                            </span>

                            <h3 className="relative mt-4 text-xl font-bold sm:text-2xl">{j}</h3>
                            <p className="relative mt-2 text-base leading-relaxed text-white/95">
                                {isi}
                            </p>
                        </li>
                    ))}
                </ol>
            </div>
        </section>
    );
}