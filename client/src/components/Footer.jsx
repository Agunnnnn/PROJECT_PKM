import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="bg-[#1767a8] text-white">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-5 py-8 text-center text-[15px] sm:px-8 lg:flex-row lg:text-left lg:px-10 lg:py-10">
        <div>
          <p className="font-semibold text-white">
            © 2026 Tracer Study SMKS Puspita Bangsa
          </p>
          <p className="mt-1 text-xs text-blue-100 sm:text-sm">
            Program Kerjasama PKM antara{" "}
            <span className="font-semibold text-white">
              Universitas Pamulang
            </span>{" "}
            &{" "}
            <span className="font-semibold text-white">
              SMKS Puspita Bangsa
            </span>
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs text-blue-100 sm:text-sm">
          <span>Pendataan alumni & mutu pendidikan</span>
          <span className="hidden sm:inline">•</span>
          <Link
            to="/about-developer"
            className="font-semibold text-white underline decoration-white/50 underline-offset-4 transition hover:text-amber-300"
          >
            Meet Our Developers 👨‍💻
          </Link>
        </div>
      </div>
    </footer>
  );
}
