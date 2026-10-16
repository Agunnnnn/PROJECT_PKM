import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import logo from "../assets/Logo.jpeg";

const MENU = [
  { label: "Beranda", href: "/" },
  { label: "Tentang", href: "/tentang" },
  { label: "Sambutan", href: "/#sambutan" },
  { label: "Panduan", href: "/#panduan" },
  { label: "FAQ", href: "/#faq" },
];

const MenuIcon = ({ open }) => (
  <svg
    width="28"
    height="28"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    {open ? (
      <path d="M6 6l12 12M18 6L6 18" />
    ) : (
      <path d="M4 7h16M4 12h16M4 17h16" />
    )}
  </svg>
);

// Catatan: "display" (flex / inline-flex / hidden) sengaja TIDAK ada di sini,
// supaya tidak bentrok dengan kelas hidden / lg:inline-flex di tempat pemakaian.
const btnSolid =
  "items-center justify-center rounded-2xl border-2 border-[#1767a8] bg-[#1767a8] font-['Poppins',sans-serif] font-semibold text-white transition-colors hover:bg-[#12558c] focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-[#8cc1ee]";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  const isItemActive = (href) => {
    if (href === "/") {
      return location.pathname === "/" && (!location.hash || location.hash === "#beranda");
    }
    if (href === "/tentang") {
      return location.pathname === "/tentang";
    }
    if (href.startsWith("/#")) {
      return location.pathname === "/" && location.hash === href.replace("/", "");
    }
    return location.pathname === href;
  };

  return (
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

        <nav className="hidden gap-9 lg:flex" aria-label="Menu utama">
          {MENU.map((m) => {
            const active = isItemActive(m.href);
            return (
              <Link
                key={m.label}
                to={m.href}
                className={`font-['Poppins',sans-serif] text-[17px] font-medium transition-colors hover:text-[#1767a8] ${
                  active ? "text-[#1767a8] font-semibold" : "text-[#3d4a5c]"
                }`}
              >
                {m.label}
              </Link>
            );
          })}
        </nav>

        {/* Login Admin - hanya tampil di desktop */}
        <Link
          to="/login"
          className={`${btnSolid} hidden px-6 py-3.5 text-[17px] lg:inline-flex`}
        >
          Login Admin
        </Link>

        {/* Tombol hamburger - hanya tampil di HP */}
        <button
          onClick={() => setOpen(!open)}
          aria-expanded={open}
          aria-label="Buka menu"
          className="grid h-13 w-13 place-items-center rounded-2xl bg-[#e9f3fd] text-[#1767a8] lg:hidden"
        >
          <MenuIcon open={open} />
        </button>
      </div>

      {open && (
        <nav
          className="flex flex-col border-t border-[#e6edf5] bg-white px-5 pb-5 pt-2 lg:hidden"
          aria-label="Menu seluler"
        >
          {MENU.map((m) => {
            const active = isItemActive(m.href);
            return (
              <Link
                key={m.label}
                to={m.href}
                onClick={() => setOpen(false)}
                className={`border-b border-[#e6edf5] py-3.5 font-['Poppins',sans-serif] text-[17px] font-medium transition-colors ${
                  active ? "text-[#1767a8] font-semibold" : "text-[#3d4a5c]"
                }`}
              >
                {m.label}
              </Link>
            );
          })}
          <Link
            to="/login"
            onClick={() => setOpen(false)}
            className={`${btnSolid} mt-4 flex px-6 py-3.5 text-[17px]`}
          >
            Login Admin
          </Link>
        </nav>
      )}
    </header>
  );
}
