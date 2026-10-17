import React from "react";

/* ===================== IKON ORANG (lingkaran biru) ===================== */
function IkonOrang({ className = "" }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <circle cx="12" cy="8" r="3.5" />
      <path d="M5 20c0-3.5 3-6 7-6s7 2.5 7 6" />
    </svg>
  );
}

/* ===================== ILUSTRASI AVATAR (pengganti foto) ===================== */
function IlustrasiAvatar() {
  return (
    <svg
      viewBox="0 0 200 200"
      className="h-full w-full"
      role="img"
      aria-label="Ilustrasi kepala sekolah"
    >
      <defs>
        <linearGradient id="gKepala" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#f9d86b" />
          <stop offset="50%" stopColor="#f4a6c8" />
          <stop offset="100%" stopColor="#b9a4f5" />
        </linearGradient>
        <linearGradient id="gBadan" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#8ee0c8" />
          <stop offset="55%" stopColor="#4fd1b0" />
          <stop offset="100%" stopColor="#8fb8f5" />
        </linearGradient>
      </defs>
      <path
        d="M30 175c0-38 31-62 70-62s70 24 70 62c0 5-4 8-9 8H39c-5 0-9-3-9-8z"
        fill="url(#gBadan)"
      />
      <circle cx="100" cy="70" r="36" fill="url(#gKepala)" />
      <ellipse cx="88" cy="58" rx="12" ry="8" fill="#ffffff" opacity="0.35" />
    </svg>
  );
}

/* ===================== KOMPONEN UTAMA ===================== */
export default function SambutanKepalaSekolah({
  nama = "Kepala Sekolah",
  sekolah = "SMK Puspita Bangsa",
  sambutan = "Setiap kabar darimu membantu adik kelasmu mendapat pendidikan yang lebih tepat sasaran. Terima kasih sudah meluangkan waktu untuk mengisi survei ini.",
  tandaTangan = "Kepala SMK Puspita Bangsa",
  foto, // opsional: URL gambar. Jika kosong, ilustrasi bawaan dipakai.
}) {
  return (
    <section
      id="sambutan"
      className="bg-[#eaf3fd] px-5 py-12 sm:px-8 lg:px-10 lg:py-16"
    >
      <div className="mx-auto max-w-6xl">
        <h2 className="text-3xl font-extrabold leading-tight text-[#0f1a24] sm:text-4xl lg:text-5xl">
          Sambutan Kepala Sekolah
        </h2>

        <article className="mt-4 grid gap-6 rounded-2xl bg-white p-6 shadow-[0_4px_14px_rgba(15,26,36,0.12)] sm:p-8 lg:grid-cols-[1fr_auto] lg:gap-x-16 lg:gap-y-6">
          {/* 1. Identitas (mobile: paling atas) */}
          <div className="flex items-center gap-4 lg:col-start-1 lg:row-start-1 lg:self-end">
            <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#1769aa] text-white sm:h-16 sm:w-16">
              <IkonOrang className="h-7 w-7 sm:h-8 sm:w-8" />
            </span>
            <div>
              <h3 className="text-xl font-bold text-[#0f1a24] sm:text-2xl">
                {nama}
              </h3>
              <p className="text-lg text-slate-500 sm:text-xl">{sekolah}</p>
            </div>
          </div>

          {/* 2. Foto (mobile: di tengah, di bawah identitas) */}
          <div className="mx-auto h-44 w-44 overflow-hidden rounded-lg border border-slate-200 bg-white p-2 shadow-[0_3px_10px_rgba(15,26,36,0.18)] sm:h-56 sm:w-56 lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:mr-10 lg:h-64 lg:w-64 lg:self-center">
            {foto ? (
              <img
                src={foto}
                alt={`Foto ${nama}`}
                className="h-full w-full rounded object-cover"
              />
            ) : (
              <IlustrasiAvatar />
            )}
          </div>

          {/* 3. Sambutan + tanda tangan */}
          <div className="min-w-0 lg:col-start-1 lg:row-start-2 lg:self-start">
            <p className="max-w-md text-base leading-relaxed text-slate-700 sm:text-lg">
              {sambutan}
            </p>
            <div className="mt-6 max-w-md border-t border-slate-200 pt-5">
              <p className="text-sm font-bold text-[#1769aa]">{tandaTangan}</p>
            </div>
          </div>
        </article>
      </div>
    </section>
  );
}