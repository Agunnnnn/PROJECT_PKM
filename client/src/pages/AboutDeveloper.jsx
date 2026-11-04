import React from "react";
import fotoPalaguna from "../assets/team/Palaguna.jpeg";
import fotoIqbal from "../assets/team/Iqbal.jpeg";
import fotoawal from "../assets/team/image.png";
/* ─── Data 10 Anggota Tim Pengembang PKM ───────────────────────── */
const TIM_DEVELOPER = [
  {
    id: 1,
    nama: "Fortuna Yuli Astuti",
    peran: "Ketua Kelompok, BackEnd Dev, Project Manager",
    nim: "241011400443",
    spesialisasi: "Project Management • Node.js Express • MySQL",
    foto: fotoawal,
    kontak: {
      github: "https://github.com/palaguna1501",
      linkedin: "https://linkedin.com",
      email: "mailto:palaguna1501@gmail.com",
    },
  },
  {
    id: 2,
    nama: "Putra Reno Hariyanto",
    peran: "Wakil Ketua, FullStack Dev, ML-Engineer",
    nim: "Mahasiswa PKM",
    spesialisasi: "React.js • Node.js • Machine Learning",
    foto: fotoawal,
    kontak: {
      github: "https://github.com",
      linkedin: "https://linkedin.com",
      email: "mailto:developer@example.com",
    },
  },
  {
    id: 3,
    nama: "Syifa Aulia",
    peran: "Bendahara, ML-Engineer",
    nim: "Mahasiswa PKM",
    spesialisasi: "Scikit-Learn • Data Preprocessing • Model Evaluation",
    foto: fotoawal,
    kontak: {
      github: "https://github.com",
      linkedin: "https://linkedin.com",
      email: "mailto:developer@example.com",
    },
  },
  {
    id: 4,
    nama: "Raksandrina",
    peran: "Sekretaris, UI/UX Design",
    nim: "Mahasiswa PKM",
    spesialisasi: "UI/UX Design • Wireframing • Dokumentasi",
    foto: fotoawal,
    kontak: {
      github: "https://github.com",
      linkedin: "https://linkedin.com",
      email: "mailto:developer@example.com",
    },
  },
  {
    id: 5,
    nama: "Sabrina",
    peran: "UI/UX Design",
    nim: "Mahasiswa PKM",
    spesialisasi: "Figma • Prototyping • User Research",
    foto: fotoawal,
    kontak: {
      github: "https://github.com",
      linkedin: "https://linkedin.com",
      email: "mailto:developer@example.com",
    },
  },
  {
    id: 6,
    nama: "Palaguna",
    peran: "QA Check, ML-Engineer, FullStack Dev",
    nim: "Mahasiswa PKM",
    spesialisasi: "Quality Assurance • Python ML • Web Developments",
    foto: fotoPalaguna,
    kontak: {
      github: "https://github.com/Agunnnnn",
      linkedin: "https://linkedin.com",
      email: "mailto:developer@example.com",
    },
  },
  {
    id: 7,
    nama: "Dicky",
    peran: "BackEnd Dev, QA Check",
    nim: "Mahasiswa PKM",
    spesialisasi: "REST API • MySQL • Testing & Bug Tracking",
    foto: fotoawal,
    kontak: {
      github: "https://github.com",
      linkedin: "https://linkedin.com",
      email: "mailto:developer@example.com",
    },
  },
  {
    id: 8,
    nama: "Iqbal Dwi Ramadhan",
    peran: "BackEnd Developer ",
    nim: "Mahasiswa PKM",
    spesialisasi: "Node.js Express • REST API • Database Design",
    foto: fotoIqbal,
    kontak: {
      github: "https://github.com",
      linkedin: "https://linkedin.com",
      email: "mailto:developer@example.com",
    },
  },
  {
    id: 9,
    nama: "Akbar",
    peran: "FrontEnd Dev",
    nim: "Mahasiswa PKM",
    spesialisasi: "React.js • Tailwind CSS • Responsive UI",
    foto: fotoawal,
    kontak: {
      github: "https://github.com",
      linkedin: "https://linkedin.com",
      email: "mailto:developer@example.com",
    },
  },
  {
    id: 10,
    nama: "Bima Arya Kusuma",
    peran: "FrontEnd Dev",
    nim: "Mahasiswa PKM",
    spesialisasi: "React.js • Vite • UI Implementation",
    foto: fotoawal,
    kontak: {
      github: "https://github.com",
      linkedin: "https://linkedin.com",
      email: "mailto:developer@example.com",
    },
  },
];

/* ─── Komponen Ikon Media Sosial ─────────────────────────────────── */
function IconGithub({ className = "h-4 w-4" }) {
  return (
    <svg
      className={className}
      fill="currentColor"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
      />
    </svg>
  );
}

function IconLinkedin({ className = "h-4 w-4" }) {
  return (
    <svg
      className={className}
      fill="currentColor"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
    </svg>
  );
}

function IconEmail({ className = "h-4 w-4" }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
      />
    </svg>
  );
}

/* ─── Komponen Utama Halaman About Developer ────────────────────── */
export default function AboutDeveloper() {
  return (
    <div
      className="min-h-screen bg-white"
      style={{ fontFamily: "'Geist', sans-serif" }}
    >
      {/* ─── HERO — Modern Minimalist ─────────────────────────────── */}
      <section className="relative overflow-hidden bg-white px-5 pt-16 pb-10 text-center sm:px-8 lg:px-10 lg:pt-20 lg:pb-12">
        {/* Dekorasi blob halus */}
        <div className="pointer-events-none absolute -top-32 left-1/2 h-[480px] w-[480px] -translate-x-1/2 rounded-full bg-blue-50 blur-3xl opacity-70" />

        <div className="relative mx-auto max-w-3xl">
          {/* Eyebrow label kecil */}
          <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-widest text-slate-500">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            PKM 2026 · SMK Puspita Bangsa
          </span>

          {/* Judul utama — dua baris elegan */}
          <h1 className="mt-5 text-5xl font-light tracking-tight text-slate-900 sm:text-6xl lg:text-7xl">
            Meet Our{" "}
            <span className="font-extrabold text-[#1769aa]">Developers</span>
          </h1>

          {/* Tagline */}
          <p className="mx-auto mt-5 max-w-xl text-base text-slate-500 sm:text-lg">
            Tim mahasiswa yang merancang dan membangun Sistem Tracer Study ini
            dengan penuh dedikasi.
          </p>

          {/* Let's Connect — subtle pill */}
          <div className="mt-7 flex items-center justify-center gap-3">
            <div className="h-px w-10 bg-slate-200" />
            <span className="text-sm font-semibold tracking-wide text-[#1769aa]">
              Let's Connect With Us ✦
            </span>
            <div className="h-px w-10 bg-slate-200" />
          </div>
        </div>
      </section>

      {/* ─── GRID 10 DEVELOPERS ───────────────────────────────────── */}
      <section className="mx-auto max-w-7xl px-5 pb-16 pt-4 sm:px-8 lg:px-10 lg:pb-20">
        {/* Grid Kartu Developer */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {TIM_DEVELOPER.map((dev) => (
            <article
              key={dev.id}
              className="group flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:border-[#1769aa]/40 hover:shadow-xl"
            >
              {/* Bagian Foto 1:1 Menggunakan object-cover dan object-top */}
              <div className="relative aspect-square w-full overflow-hidden bg-slate-100">
                <img
                  src={dev.foto}
                  alt={dev.nama}
                  className="h-full w-full object-cover object-top transition duration-500 group-hover:scale-105"
                  loading="lazy"
                />
                {/* Nomor badge kecil */}
                <span className="absolute left-3 top-3 flex h-7 w-7 items-center justify-center rounded-full bg-[#12294d]/80 text-xs font-bold text-white shadow-md backdrop-blur-sm">
                  #{dev.id}
                </span>
              </div>

              {/* Konten Keterangan */}
              <div className="flex flex-1 flex-col p-4 sm:p-5">
                {/* Peran / Role — ditampilkan sebagai pill badge terpisah */}
                <div className="mb-2 flex flex-wrap gap-1.5">
                  {dev.peran.split(",").map((role, i) => (
                    <span
                      key={i}
                      className="rounded-full border border-blue-100 bg-blue-50 px-2.5 py-0.5 text-[10px] font-semibold text-[#1769aa]"
                    >
                      {role.trim()}
                    </span>
                  ))}
                </div>

                {/* Nama Developer */}
                <h3 className="text-base font-bold text-[#12294d] group-hover:text-[#1769aa] transition-colors">
                  {dev.nama}
                </h3>
                <p className="text-xs font-medium text-slate-400">{dev.nim}</p>

                {/* Spesialisasi / Tech Stack */}
                <p className="mt-3 text-xs leading-relaxed text-slate-600">
                  <span className="font-semibold text-slate-700">Fokus: </span>
                  {dev.spesialisasi}
                </p>

                {/* Tombol Kontak / Let's Connect */}
                <div className="mt-4 border-t border-slate-100 pt-3">
                  <div className="flex items-center justify-around gap-2 text-slate-400">
                    <a
                      href={dev.kontak.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`GitHub ${dev.nama}`}
                      className="rounded-lg p-1.5 transition hover:bg-slate-100 hover:text-slate-900"
                      title="GitHub"
                    >
                      <IconGithub className="h-4 w-4" />
                    </a>
                    <a
                      href={dev.kontak.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`LinkedIn ${dev.nama}`}
                      className="rounded-lg p-1.5 transition hover:bg-slate-100 hover:text-[#0077b5]"
                      title="LinkedIn"
                    >
                      <IconLinkedin className="h-4 w-4" />
                    </a>
                    <a
                      href={dev.kontak.email}
                      aria-label={`Email ${dev.nama}`}
                      className="rounded-lg p-1.5 transition hover:bg-slate-100 hover:text-rose-600"
                      title="Email"
                    >
                      <IconEmail className="h-4 w-4" />
                    </a>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* ─── BANNER BAWAH: LET'S CONNECT WITH US ────────────────────── */}
      {/* ─── CTA BAWAH ─────────────────────────────────────────────── */}
      <section className="border-t border-slate-200 bg-slate-50/60 px-5 py-20 sm:px-8 lg:py-28">
        <div className="mx-auto max-w-2xl text-center">
          <h3 className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
            Punya masukan untuk sistem ini?
          </h3>
          <p className="mx-auto mt-4 max-w-md text-base leading-relaxed text-slate-500">
            Kami terbuka untuk saran fitur, kritik, dan kolaborasi pengembangan
            berikutnya.
          </p>

          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <a
              href="mailto:palaguna2006@gmail.com"
              className="inline-flex h-12 items-center rounded-full bg-[#12294d] px-7 text-sm font-semibold text-white transition hover:bg-[#1769aa] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1769aa]"
            >
              Kirim email ke tim
            </a>
            <a
              href="/"
              className="inline-flex h-12 items-center rounded-full px-7 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
            >
              Kembali ke beranda
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
