import React from "react";

/**
 * Konten utama halaman "Sambutan Kepala Sekolah".
 * Navbar dan footer dipasang terpisah di layout.
 *
 * Props (semua opsional):
 *  - judul   : judul halaman
 *  - jabatan : teks tebal di samping ikon
 *  - sekolah : teks abu-abu di bawah jabatan
 *  - pesan   : isi sambutan
 *  - ttd     : teks biru di bagian bawah kartu
 *  - foto    : URL foto kepala sekolah (kosong = pakai avatar bawaan)
 */
export default function Sambutan({
  judul = "Sambutan Kepala Sekolah",
  jabatan = "Kepala Sekolah",
  sekolah = "SMK Puspita Bangsa",
  pesan = "Setiap kabar darimu membantu adik kelasmu mendapat pendidikan yang lebih tepat sasaran. Terima kasih sudah meluangkan waktu untuk mengisi survei ini.",
  ttd = "Kepala SMK Puspita Bangsa",
  foto = "",
}) {
  return (
    <main className="bg-[#eaf3fd] px-5 py-10 sm:px-8 lg:px-[135px] lg:py-[72px]">
      <h1 className="mb-6 text-[2rem] font-extrabold leading-tight text-[#0f1a24] sm:text-5xl lg:mb-8 lg:text-[4.2rem]">
        {judul}
      </h1>

      <section className="grid grid-cols-1 gap-x-10 rounded-3xl bg-white p-5 shadow-[0_4px_14px_rgba(15,26,36,0.12)] sm:p-8 lg:grid-cols-[minmax(0,1fr)_420px] lg:rounded-2xl lg:px-[85px] lg:pb-12 lg:pt-12">
        {/* Ikon + jabatan */}
        <div className="flex items-center gap-4 lg:col-start-1 lg:items-start lg:gap-0">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#1769aa] shadow-[0_6px_10px_rgba(15,26,36,0.25)] lg:h-[173px] lg:w-[173px]">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="#fff"
              strokeWidth="2"
              strokeLinecap="round"
              className="h-6 w-6 lg:h-[56px] lg:w-[56px]"
              aria-hidden="true"
            >
              <circle cx="12" cy="8" r="4" />
              <path d="M5 21v-1a5 5 0 0 1 5-5h4a5 5 0 0 1 5 5v1" />
            </svg>
          </div>
          <div className="lg:pl-7 lg:pt-5">
            <h2 className="text-xl font-bold text-[#0f1a24] sm:text-2xl lg:text-[2.1rem]">
              {jabatan}
            </h2>
            <p className="text-base text-slate-500 lg:mt-2 lg:text-[2.1rem]">
              {sekolah}
            </p>
          </div>
        </div>

        {/* Foto: di mobile berada di antara header dan teks, di desktop di kanan */}
        <figure className="mx-auto my-6 w-[160px] sm:w-[200px] lg:col-start-2 lg:row-span-3 lg:row-start-1 lg:my-0 lg:mr-0 lg:mt-[48px] lg:w-[270px] lg:self-start">
          <div className="flex aspect-[0.94] items-center justify-center overflow-hidden rounded-lg bg-white shadow-[0_3px_8px_rgba(15,26,36,0.3)]">
            {foto ? (
              <img
                src={foto}
                alt={`${jabatan} ${sekolah}`}
                className="h-full w-full object-cover"
              />
            ) : (
              <AvatarBawaan />
            )}
          </div>
        </figure>

        {/* Isi sambutan */}
        <p className="px-2 text-base leading-[1.95] text-slate-600 lg:col-start-1 lg:mt-12 lg:px-0 lg:text-[2rem] lg:leading-[1.75]">
          {pesan}
        </p>

        {/* Penutup */}
        <div className="mt-5 border-t-4 border-slate-100 pt-6 lg:col-start-1 lg:mt-14 lg:pt-14">
          <p className="text-lg font-bold text-[#1769aa] lg:text-[1.75rem]">
            {ttd}
          </p>
        </div>
      </section>
    </main>
  );
}

/* Avatar 3D sederhana sebagai pengganti jika foto belum diisi */
function AvatarBawaan() {
  return (
    <svg viewBox="0 0 200 200" className="h-4/5 w-4/5" aria-hidden="true">
      <defs>
        <linearGradient id="badan" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#7ee8b4" />
          <stop offset="0.6" stopColor="#7fd6f5" />
          <stop offset="1" stopColor="#8fa6f7" />
        </linearGradient>
        <radialGradient id="kepala" cx="0.35" cy="0.3" r="0.8">
          <stop offset="0" stopColor="#fdf6a8" />
          <stop offset="0.6" stopColor="#f5c9a0" />
          <stop offset="1" stopColor="#98e6a8" />
        </radialGradient>
        <radialGradient id="pipi" cx="0.4" cy="0.35" r="0.7">
          <stop offset="0" stopColor="#f9b8d6" />
          <stop offset="1" stopColor="#e6a0d8" />
        </radialGradient>
      </defs>
      <path d="M25 165c0-48 33-78 75-78s75 30 75 78c0 6-30 10-75 10s-75-4-75-10z" fill="url(#badan)" />
      <circle cx="100" cy="62" r="40" fill="url(#kepala)" />
      <circle cx="100" cy="64" r="26" fill="url(#pipi)" />
    </svg>
  );
}