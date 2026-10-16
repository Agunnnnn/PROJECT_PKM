import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import logo from "../assets/Logo.jpeg";

const MENU = [
  { label: "Beranda", href: "/", icon: "home" },
  { label: "Tentang", href: "/tentang", icon: "info" },
  { label: "Sambutan", href: "/#sambutan", icon: "mic" },
  { label: "Panduan", href: "/panduan", icon: "book" },
  { label: "FAQ", href: "/#faq", icon: "help" },
];

/* ---------- Ikon ---------- */
const Svg = ({ children, size = 24, ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    aria-hidden="true"
    {...props}
  >
    {children}
  </svg>
);

const ICONS = {
  home: (
    <Svg fill="currentColor">
      <path d="M12 3l9 8h-2.5v9h-5v-6h-3v6h-5v-9H3l9-8z" />
    </Svg>
  ),
  info: (
    <Svg fill="currentColor">
      <path d="M12 2a10 10 0 100 20 10 10 0 000-20zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" />
    </Svg>
  ),
  mic: (
    <Svg fill="currentColor">
      <path d="M12 14a3.500 3.500 0 003.500-3.500V6a3.500 3.500 0 10-7 0v4.500A3.500 3.500 0 0012 14z" />
      <path d="M6 10.500a1 1 0 112 0 4 4 0 008 0 1 1 0 112 0 6 6 0 01-5 5.900V19h2a1 1 0 110 2H9a1 1 0 110-2h2v-2.600a6 6 0 01-5-5.900z" />
    </Svg>
  ),
  book: (
    <Svg
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinejoin="round"
    >
      <path d="M12 6c-2-1.500-5-2-8-2v14c3 0 6 .5 8 2 2-1.500 5-2 8-2V4c-3 0-6 .5-8 2zM12 6v14" />
    </Svg>
  ),
  help: (
    <Svg fill="currentColor">
      <path d="M12 2a10 10 0 100 20 10 10 0 000-20zm1 16h-2v-2h2v2zm1.800-7.400l-.9.900c-.7.700-.9 1.200-.9 2.500h-2v-.500c0-1 .3-1.900 1-2.600l1.200-1.300c.4-.3.600-.8.600-1.300 0-1.100-.9-2-2-2s-2 .9-2 2H8a4 4 0 118 0c0 .9-.4 1.700-1.200 2.300z" />
    </Svg>
  ),
  login: (
    <Svg
      fill="none"
      stroke="currentColor"
      strokeWidth="2.200"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 12h11M10 7l5 5-5 5" />
      <path d="M14 4h4a2 2 0 012 2v12a2 2 0 01-2 2h-4" />
    </Svg>
  ),
  burger: (
    <Svg
      size={28}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    >
      <path d="M4 7h16M4 12h16M4 17h16" />
    </Svg>
  ),
  close: (
    <Svg
      size={28}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    >
      <path d="M6 6l12 12M18 6L6 18" />
    </Svg>
  ),
};

// "display" (flex / inline-flex / hidden) sengaja TIDAK ada di sini,
// supaya tidak bentrok dengan kelas hidden / lg:inline-flex di tempat pemakaian.
const btnSolid =
  "items-center justify-center rounded-2xl border-2 border-[#1767a8] bg-[#1767a8] font-['Poppins',sans-serif] font-semibold text-white transition-colors hover:bg-[#12558c] focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-[#8cc1ee]";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  const isItemActive = (href) => {
    if (href === "/") {
      return (
        location.pathname === "/" &&
        (!location.hash || location.hash === "#beranda")
      );
    }
    if (href === "/tentang") {
      return location.pathname === "/tentang";
    }
    if (href.startsWith("/#")) {
      return (
        location.pathname === "/" && location.hash === href.replace("/", "")
      );
    }
    return location.pathname === href;
  };

  // Tutup drawer saat pindah halaman / hash
  useEffect(() => {
    setOpen(false);
  }, [location.pathname, location.hash]);

  // Kunci scroll halaman + tutup dengan tombol Esc saat drawer terbuka
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <>
      {/* ===== Header ===== */}
      <header className="sticky top-0 z-20 border-b border-[#e6edf5] bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-5 py-4 lg:px-10 lg:py-6">
          <Link to="/" className="flex items-center gap-3.5">
            <img
              src={logo}
              alt="Logo SMK Puspita Bangsa"
              className="h-11 w-11 object-contain"
            />
            <div>
              <small className="block text-[13px] font-semibold uppercase leading-tight tracking-wide text-[#5b7794]">
                SMK Puspita Bangsa
              </small>
              <strong className="font-['Poppins',sans-serif] text-[22px] font-bold leading-tight">
                Tracer Study
              </strong>
            </div>
          </Link>

          {/* Menu desktop */}
          <nav className="hidden gap-9 lg:flex" aria-label="Menu utama">
            {MENU.map((m) => {
              const active = isItemActive(m.href);
              return (
                <Link
                  key={m.label}
                  to={m.href}
                  className={`font-['Poppins',sans-serif] text-[17px] font-medium transition-colors hover:text-[#1767a8] ${
                    active ? "font-semibold text-[#1767a8]" : "text-[#3d4a5c]"
                  }`}
                >
                  {m.label}
                </Link>
              );
            })}
          </nav>

          {/* Login Admin - hanya desktop */}
          <Link
            to="/login"
            className={`${btnSolid} hidden px-6 py-3.5 text-[17px] lg:inline-flex`}
          >
            Login Admin
          </Link>

          {/* Hamburger - hanya HP */}
          <button
            onClick={() => setOpen(true)}
            aria-expanded={open}
            aria-controls="drawer-mobile"
            aria-label="Buka menu"
            className="grid h-13 w-13 place-items-center rounded-2xl bg-[#e9f3fd] text-[#1767a8] lg:hidden"
          >
            {ICONS.burger}
          </button>
        </div>
      </header>

      {/* ===== Drawer mobile (backdrop blur + panel dari kanan) ===== */}
      <div
        className={`fixed inset-0 z-40 transition-[visibility] lg:hidden ${
          open ? "visible" : "invisible delay-300"
        }`}
      >
        {/* Backdrop blur - klik untuk menutup */}
        <div
          onClick={() => setOpen(false)}
          className={`absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity duration-300 ${
            open ? "opacity-100" : "opacity-0"
          }`}
        />

        {/* Panel */}
        <aside
          id="drawer-mobile"
          role="dialog"
          aria-modal="true"
          aria-label="Menu Tracer Study"
          className={`absolute right-0 top-0 flex h-full w-[86%] max-w-sm flex-col rounded-l-4xl bg-[#d6dfeb] px-5 pb-6 pt-6 shadow-2xl transition-transform duration-300 ease-out ${
            open ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <div className="flex justify-end">
            <button
              onClick={() => setOpen(false)}
              aria-label="Tutup menu"
              className="grid h-13 w-13 place-items-center rounded-2xl bg-[#e9f3fd] text-[#1767a8]"
            >
              {ICONS.close}
            </button>
          </div>

          <h2 className="mb-3 mt-6 font-['Poppins',sans-serif] text-lg font-bold uppercase tracking-wide text-[#334155]">
            Menu Tracer Study
          </h2>

          <nav className="flex flex-col gap-3" aria-label="Menu seluler">
            {MENU.map((m) => {
              const active = isItemActive(m.href);
              return (
                <Link
                  key={m.label}
                  to={m.href}
                  onClick={() => setOpen(false)}
                  className={`flex h-17 items-center gap-5 rounded-2xl border px-5 font-['Inter',sans-serif] text-[17px] transition-colors ${
                    active
                      ? "border-[#0f172a] bg-[#0f172a] font-medium text-white"
                      : "border-[#dde5f0] bg-[#e9eff7] text-[#334155] hover:bg-white"
                  }`}
                >
                  <span
                    className={`grid w-8 flex-none place-items-center ${
                      active ? "text-white" : "text-[#475569]"
                    }`}
                  >
                    {ICONS[m.icon]}
                  </span>
                  {m.label}
                </Link>
              );
            })}
          </nav>

          <Link
            to="/login"
            onClick={() => setOpen(false)}
            className="mt-auto flex h-16 items-center gap-5 rounded-2xl bg-[#2563eb] px-5 font-['Poppins',sans-serif] text-[17px] font-semibold text-white transition-colors hover:bg-[#1d4fd8]"
          >
            <span className="grid w-8 flex-none place-items-center">
              {ICONS.login}
            </span>
            Login Admin
          </Link>
        </aside>
      </div>
    </>
  );
}
