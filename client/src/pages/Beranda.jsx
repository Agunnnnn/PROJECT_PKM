import gedung from "../assets/GedungSekolah.png";

const Icon = ({ children, size = 24 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    {children}
  </svg>
);

const ArrowRight = () => (
  <Icon>
    <path d="M5 12h14M13 6l6 6-6 6" />
  </Icon>
);
const Clock = () => (
  <Icon>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3 2" />
  </Icon>
);
const Shield = () => (
  <Icon>
    <path d="M12 3l7 3v5c0 4.5-3 8-7 10-4-2-7-5.5-7-10V6l7-3z" />
    <path d="M9 12l2 2 4-4" />
  </Icon>
);
const Sparkle = () => (
  <Icon size={22}>
    <path
      d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3z"
      fill="currentColor"
    />
    <path
      d="M19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8L19 15z"
      fill="currentColor"
    />
  </Icon>
);

const btn =
  "inline-flex items-center justify-center gap-3 rounded-2xl border-2 border-[#1767a8] font-['Poppins',sans-serif] font-semibold transition-colors focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-[#8cc1ee]";
const btnSolid = `${btn} bg-[#1767a8] text-white hover:bg-[#12558c]`;
const btnOutline = `${btn} bg-transparent text-[#1767a8] hover:bg-[#1767a8]/10`;

export default function Beranda() {
  return (
    <div className="flex min-h-screen flex-col bg-[#e9f3fd] font-['Inter',sans-serif] text-[#0f1923]">
      {/* ===== Hero ===== */}
      <main
        id="beranda"
        className="mx-auto flex w-full max-w-7xl flex-1 flex-col lg:flex-row lg:items-center lg:gap-12 lg:px-10 lg:py-18"
      >
        <div className="order-1 px-5 pb-14 pt-5 lg:flex-[1.15] lg:p-0">
          <span className="inline-flex items-center gap-2.5 rounded-full bg-[#fff0d6] px-4.5 py-2.5 text-[13px] font-bold uppercase text-[#1767a8]">
            <span className="text-[#f5a623]">
              <Sparkle />
            </span>
            Satu almamater, berjuta cerita
          </span>

          <h1 className="mb-4 mt-5 font-['Poppins',sans-serif] text-[clamp(2.1rem,7vw,4.6rem)] font-bold leading-[1.15]">
            Halo, alumni
            <span className="block text-[#1767a8]">SMK Puspita Bangsa</span>
          </h1>

          <p className="mb-7 max-w-[34em] text-[clamp(1.05rem,2.2vw,1.6rem)] leading-relaxed text-[#4a5568]">
            Tracer Study adalah langkah untuk mengetahui perjalanan lulusan
            setelah menyelesaikan pendidikan kejuruan.
          </p>

          <div className="flex flex-col gap-3 lg:flex-row">
            <a
              href="/survey"
              className={`${btnSolid} px-7 py-5.5 text-[22px] lg:px-9 lg:py-6 lg:text-xl`}
            >
              Mulai Survey <ArrowRight />
            </a>
            <a
              href="#panduan"
              className={`${btnOutline} p-5 text-lg lg:px-9 lg:py-6 lg:text-xl`}
            >
              Lihat Panduan
            </a>
          </div>

          <div className="mt-8 grid grid-cols-2 gap-4 lg:mt-10">
            {[
              { icon: <Clock />, title: "± 3 menit", desc: "Estimasi waktu" },
              { icon: <Shield />, title: "Aman", desc: "Data terlindungi" },
            ].map((f) => (
              <div
                key={f.title}
                className="flex items-center gap-3.5 rounded-[18px] border border-[#e6edf5] bg-white px-4 py-3.5"
              >
                <div className="grid h-13 w-13 flex-none place-items-center rounded-2xl bg-[#fff0d6] text-[#f5a623]">
                  {f.icon}
                </div>
                <div>
                  <strong className="block font-['Poppins',sans-serif] text-[17px] font-semibold">
                    {f.title}
                  </strong>
                  <span className="text-[15px] text-[#5b7794]">{f.desc}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div
          className="order-first h-67.5 overflow-hidden [-webkit-mask-image:linear-gradient(to_bottom,#000_70%,transparent)] mask-[linear-gradient(to_bottom,#000_70%,transparent)]
                     lg:order-2 lg:h-140 lg:flex-1 lg:rounded-[36px] lg:shadow-[0_24px_60px_rgba(23,103,168,0.18)] lg:[-webkit-mask-image:none] lg:mask-none"
        >
          <img
            src={gedung}
            alt="Gedung SMK Puspita Bangsa bersama siswa"
            className="block h-full w-full object-cover"
          />
        </div>
      </main>
    </div>
  );
}
