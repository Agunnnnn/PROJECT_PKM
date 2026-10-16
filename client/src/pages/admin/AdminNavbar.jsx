import { useEffect, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import logo from "../../assets/Logo.jpeg";

const MENU = [
  { label: "Dashboard", to: "/admin/dashboard", icon: "grid" },
  { label: "Data Alumni", to: "/admin/data", icon: "users" },
  { label: "Laporan", to: "/admin/laporan", icon: "report" },
  { label: "Profil Admin", to: "/admin/profil", icon: "user" },
];

/* ---------- Ikon ---------- */
const Svg = ({ children, size = 26 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    {children}
  </svg>
);

const ICONS = {
  grid: (
    <Svg>
      <rect x="3" y="4" width="18" height="16" rx="3" />
      <path d="M12 4v16M3 12h18" />
    </Svg>
  ),
  users: (
    <Svg>
      <circle cx="9" cy="8" r="3.200" />
      <path d="M3 20c0-3.300 2.700-6 6-6s6 2.700 6 6" />
      <circle cx="17" cy="9" r="2.500" />
      <path d="M17 14.200c2.400.3 4 2.200 4 4.800" />
    </Svg>
  ),
  report: (
    <Svg>
      <rect x="5" y="3" width="14" height="18" rx="2" />
      <path d="M9 8h6M9 12h6M9 16h4" />
    </Svg>
  ),
  user: (
    <Svg>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21c0-4.400 3.600-8 8-8s8 3.600 8 8" />
    </Svg>
  ),
  logout: (
    <Svg>
      <path d="M10 4H6a2 2 0 00-2 2v12a2 2 0 002 2h4" />
      <path d="M14 8l4 4-4 4M18 12H9" />
    </Svg>
  ),
  burger: (
    <Svg size={28}>
      <path d="M4 7h16M4 12h16M4 17h16" strokeWidth="2" />
    </Svg>
  ),
  close: (
    <Svg size={28}>
      <path d="M6 6l12 12M18 6L6 18" strokeWidth="2" />
    </Svg>
  ),
};

const desktopLink = ({ isActive }) =>
  `font-['Poppins',sans-serif] text-[16px] font-medium transition-colors hover:text-[#1767a8] ${
    isActive ? "font-semibold text-[#1767a8]" : "text-[#3d4a5c]"
  }`;

export default function AdminNavbar() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem("token");
    setOpen(false);
    navigate("/login");
  };

  // Tutup drawer saat pindah halaman
  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  // Kunci scroll + tutup dengan Esc saat drawer terbuka
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
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-5 py-4 lg:px-10">
          <Link to="/admin/dashboard" className="flex items-center gap-3.5">
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
          <nav
            className="hidden items-center gap-8 lg:flex"
            aria-label="Menu admin"
          >
            {MENU.map((m) => (
              <NavLink key={m.to} to={m.to} end className={desktopLink}>
                {m.label}
              </NavLink>
            ))}
          </nav>

          <button
            onClick={handleLogout}
            className="hidden h-11 items-center gap-2 rounded-xl border-2 border-[#1767a8] px-5 font-['Poppins',sans-serif] text-[15px] font-semibold text-[#1767a8] transition-colors hover:bg-[#1767a8]/10 lg:inline-flex"
          >
            Logout
          </button>

          {/* Hamburger - hanya HP */}
          <button
            onClick={() => setOpen(true)}
            aria-expanded={open}
            aria-controls="drawer-admin"
            aria-label="Buka menu admin"
            className="grid h-13 w-13 place-items-center rounded-2xl bg-[#e9f3fd] text-[#1767a8] lg:hidden"
          >
            {ICONS.burger}
          </button>
        </div>
      </header>

      {/* ===== Drawer mobile ===== */}
      <div
        className={`fixed inset-0 z-40 transition-[visibility] lg:hidden ${
          open ? "visible" : "invisible delay-300"
        }`}
      >
        <div
          onClick={() => setOpen(false)}
          className={`absolute inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity duration-300 ${
            open ? "opacity-100" : "opacity-0"
          }`}
        />

        <aside
          id="drawer-admin"
          role="dialog"
          aria-modal="true"
          aria-label="Menu admin Tracer Study"
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

          <h2 className="mb-4 mt-6 font-['Poppins',sans-serif] text-lg font-bold uppercase tracking-wide text-[#334155]">
            Menu Tracer Study
          </h2>

          <nav className="flex flex-col gap-5" aria-label="Menu admin seluler">
            {MENU.map((m) => (
              <NavLink
                key={m.to}
                to={m.to}
                end
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `flex h-14 items-center rounded-2xl border px-5 transition-colors ${
                    isActive
                      ? "border-[#2563eb] bg-[#2563eb] font-['Poppins',sans-serif] text-[17px] font-bold text-white"
                      : "border-[#dde5f0] bg-[#e9eff7] font-['Inter',sans-serif] text-[17px] text-[#334155] hover:bg-white"
                  }`
                }
              >
                <span className="grid w-8 flex-none place-items-center">
                  {ICONS[m.icon]}
                </span>
                <span className="flex-1 pr-8 text-center">{m.label}</span>
              </NavLink>
            ))}
          </nav>

          <button
            onClick={handleLogout}
            className="mt-auto flex h-14 items-center rounded-2xl border border-[#dde5f0] bg-[#e9eff7] px-5 font-['Inter',sans-serif] text-[17px] text-[#334155] transition-colors hover:bg-white"
          >
            <span className="grid w-8 flex-none place-items-center">
              {ICONS.logout}
            </span>
            <span className="flex-1 pr-8 text-center">Logout</span>
          </button>
        </aside>
      </div>
    </>
  );
}
