import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="bg-[#1767a8] text-white">
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-2 px-5 py-9 text-center text-[16px] lg:flex-row lg:justify-between lg:px-10 lg:py-12">
        <span>© 2026 Tracer Study SMK Puspita Bangsa</span>
        <div className="flex items-center gap-4 text-sm text-blue-100">
          <span>Pendataan alumni • Peningkatan mutu pendidikan</span>
          <span>•</span>
          <Link to="/about-developer" className="font-semibold text-white underline decoration-white/50 underline-offset-4 hover:text-amber-300">
            About Developer (PKM Team)
          </Link>
        </div>
      </div>
    </footer>
  );
}
