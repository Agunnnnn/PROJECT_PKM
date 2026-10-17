import React from "react";

/* ===================== DATA KARTU ===================== */
const KARTU = [
    {
        nomor: "01",
        judul: "Relevan",
        deskripsi:
            "Pekerjaan atau program studimu sejalan dengan jurusan di SMK. Contoh: lulusan RPL bekerja sebagai programmer.",
        ikon: "link",
        warnaIkon: "bg-[#1b5f9a] text-sky-300",
    },
    {
        nomor: "02",
        judul: "Tidak relevan",
        deskripsi:
            "Pekerjaan atau program studimu berbeda bidang dengan jurusan di SMK. Contoh: lulusan RPL bekerja sebagai kasir.",
        ikon: "shuffle",
        warnaIkon: "bg-[#2a8f8f] text-emerald-300",
    },
    {
        nomor: "03",
        judul: "Untuk apa?",
        deskripsi:
            "Hasilnya dipakai sekolah untuk memperbarui kurikulum dan kerja sama dengan dunia usaha.",
        ikon: "book",
        warnaIkon: "bg-[#8a8a3a] text-amber-300",
    },
];

/* ===================== IKON ===================== */
function Ikon({ nama, className = "" }) {
    const umum = {
        viewBox: "0 0 24 24",
        fill: "none",
        stroke: "currentColor",
        strokeWidth: 2,
        strokeLinecap: "round",
        strokeLinejoin: "round",
        className,
        "aria-hidden": true,
    };

    if (nama === "link") {
        return (
            <svg {...umum}>
                <path d="M10 13a5 5 0 0 0 7.07 0l3-3a5 5 0 0 0-7.07-7.07l-1.5 1.5" />
                <path d="M14 11a5 5 0 0 0-7.07 0l-3 3a5 5 0 0 0 7.07 7.07l1.5-1.5" />
            </svg>
        );
    }
    if (nama === "shuffle") {
        return (
            <svg {...umum}>
                <path d="M16 3h5v5" />
                <path d="M4 20 21 3" />
                <path d="M21 16v5h-5" />
                <path d="M15 15l6 6" />
                <path d="M4 4l5 5" />
            </svg>
        );
    }
    return (
        <svg {...umum}>
            <path d="M2 4h6a4 4 0 0 1 4 4v13a3 3 0 0 0-3-3H2z" />
            <path d="M22 4h-6a4 4 0 0 0-4 4v13a3 3 0 0 1 3-3h7z" />
        </svg>
    );
}

/* ===================== KOMPONEN UTAMA ===================== */
export default function TentangTracerStudy() {
    return (
        <section
            id="tentang"
            className="bg-[#eaf3fd] px-5 py-12 sm:px-8 lg:px-10 lg:py-16"
        >
            <div className="mx-auto max-w-6xl">
                {/* Judul */}
                <header className="max-w-3xl">
                    <h2 className="text-3xl font-extrabold leading-tight text-[#0f1a24] sm:text-4xl lg:text-5xl">
                        Tentang Tracer Study
                    </h2>
                    <p className="mt-4 text-base leading-relaxed text-slate-600 sm:text-lg">
                        Survey ini mengumpulkan informasi tentang kegiatan Anda setelah
                        lulus untuk meningkatkan kualitas pendidikan kejuruan.
                    </p>
                </header>

                {/* Kartu */}
                <ul className="mt-8 grid gap-6 sm:grid-cols-2 lg:mt-10 lg:grid-cols-3">
                    {KARTU.map((k) => (
                        <li
                            key={k.nomor}
                            className="relative overflow-hidden rounded-xl bg-[#1769aa] p-6 text-white shadow-[4px_4px_0_rgba(15,26,36,0.25)]"
                        >
                            {/* Nomor besar sebagai dekorasi */}
                            <span
                                aria-hidden="true"
                                className="pointer-events-none absolute -right-2 -top-1 flex h-24 w-24 select-none items-center justify-center rounded-full bg-black/10 text-5xl font-extrabold text-white/20"
                            >
                                {k.nomor}
                            </span>

                            {/* Ikon */}
                            <div
                                className={`relative flex h-10 w-10 items-center justify-center rounded-lg ${k.warnaIkon}`}
                            >
                                <Ikon nama={k.ikon} className="h-5 w-5" />
                            </div>

                            {/* Teks */}
                            <h3 className="relative mt-4 text-2xl font-bold">{k.judul}</h3>
                            <p className="relative mt-3 text-sm leading-relaxed text-white/90">
                                {k.deskripsi}
                            </p>
                        </li>
                    ))}
                </ul>
            </div>
        </section>
    );
}