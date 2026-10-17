import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axios";
import logo from "../assets/Logo.jpeg"; // <-- simpan file di src/assets/Logo.jpeg

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

const Eye = () => (
  <Svg
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M2 12s3.500-7 10-7 10 7 10 7-3.500 7-10 7S2 12 2 12z" />
    <circle cx="12" cy="12" r="3" />
  </Svg>
);

const EyeOff = () => (
  <Svg
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M3 3l18 18" />
    <path d="M10.600 6.100A9.900 9.900 0 0112 6c6.500 0 10 6 10 6a17 17 0 01-3.200 3.900M6.600 6.600A16.800 16.800 0 002 12s3.500 7 10 7c1.700 0 3.200-.4 4.500-1" />
    <path d="M9.900 9.900a3 3 0 004.200 4.200" />
  </Svg>
);

const ArrowLeft = () => (
  <Svg
    size={22}
    fill="none"
    stroke="currentColor"
    strokeWidth="2.200"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M19 12H5M11 6l-6 6 6 6" />
  </Svg>
);

/* ---------- Gaya bersama ---------- */
const backLink =
  "items-center gap-2.5 font-['Poppins',sans-serif] text-base font-medium text-[#1767a8] hover:underline";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [userFocused, setUserFocused] = useState(false);
  const [passFocused, setPassFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // Pastikan form selalu mulai dalam keadaan kosong saat halaman dibuka
  useEffect(() => {
    setUsername("");
    setPassword("");
  }, []);

  const isUserFloating = userFocused || username.length > 0;
  const isPassFloating = passFocused || password.length > 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await api.post("/auth/login", { username, password });
      localStorage.setItem("token", res.data.token);
      navigate("/admin/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Username atau password salah.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#e9f3fd] px-5 py-14 font-['Inter',sans-serif] lg:py-16">
      <div className="mx-auto w-full max-w-md">
        <div className="rounded-[28px] bg-white p-6 shadow-[0_10px_30px_rgba(23,103,168,0.10)] lg:rounded-4xl lg:p-8">
          {/* Header kartu */}
          <div className="text-center">
            <img
              src={logo}
              alt="Logo SMK Puspita Bangsa"
              className="mx-auto mb-5 h-20 w-20 object-contain"
            />
            <h1 className="font-['Poppins',sans-serif] text-[28px] font-bold leading-tight text-[#0f1923]">
              Login Admin
            </h1>
            <p className="mt-2 text-[15px] leading-relaxed text-[#5b7794]">
              Selamat datang kembali. Masuk untuk mengelola data alumni dan
              hasil Tracer Study.
            </p>
          </div>

          {/* Form */}
          <form
            onSubmit={handleSubmit}
            className="mt-8"
            autoComplete="off"
            noValidate
          >
            {error && (
              <div
                role="alert"
                className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
              >
                {error}
              </div>
            )}

            {/* Input Username dengan Floating Label */}
            <div className="floating-group mb-6">
              <input
                id="username"
                type="text"
                autoComplete="off"
                placeholder=" "
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                onFocus={() => setUserFocused(true)}
                onBlur={() => setUserFocused(false)}
                required
                className="floating-input"
              />
              <label
                htmlFor="username"
                className={`floating-label ${isUserFloating ? "is-floating" : ""
                  } ${userFocused ? "is-focused" : ""}`}
              >
                Username atau email
              </label>
            </div>

            {/* Input Password dengan Floating Label */}
            <div className="floating-group mb-6">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                placeholder=" "
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onFocus={() => setPassFocused(true)}
                onBlur={() => setPassFocused(false)}
                required
                className="floating-input pr-12"
              />
              <label
                htmlFor="password"
                className={`floating-label ${isPassFloating ? "is-floating" : ""
                  } ${passFocused ? "is-focused" : ""}`}
              >
                Password
              </label>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={
                  showPassword ? "Sembunyikan password" : "Tampilkan password"
                }
                className="absolute right-3 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-lg text-[#5b7794] transition hover:text-[#1767a8]"
              >
                {showPassword ? <EyeOff /> : <Eye />}
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="h-13 w-full rounded-xl bg-[#1767a8] font-['Poppins',sans-serif] text-base font-semibold text-white transition-colors hover:bg-[#12558c] focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-[#8cc1ee] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading ? "Memproses..." : "Masuk"}
            </button>
          </form>

          {/* Catatan */}
          <div className="mt-5 lg:mt-7 lg:border-t lg:border-[#e6edf5] lg:pt-5">
            <p className="text-center text-[13px] leading-relaxed text-[#5b7794]">
              Khusus administrator sekolah. Jika mengalami kendala masuk,
              hubungi pengelola Tracer Study.
            </p>

            {/* Mobile: link kembali di dalam kartu */}
            <div className="mt-5 flex justify-center border-t border-[#e6edf5] pt-5 lg:hidden">
              <Link to="/" className={`inline-flex ${backLink}`}>
                <ArrowLeft /> Kembali ke Beranda
              </Link>
            </div>
          </div>
        </div>

        {/* Desktop: link kembali di luar kartu */}
        <div className="mt-8 hidden justify-center lg:flex">
          <Link to="/" className={`inline-flex ${backLink}`}>
            <ArrowLeft /> Kembali ke Beranda
          </Link>
        </div>
      </div>
    </div>
  );
}