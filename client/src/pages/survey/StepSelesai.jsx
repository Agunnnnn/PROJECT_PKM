import { Link } from "react-router-dom";

export default function StepSelesai() {
  return (
    <div className="mx-auto max-w-3xl py-4 text-center lg:py-6">
      <div className="mx-auto grid h-24 w-24 place-items-center rounded-full bg-[#e3f1ff] text-5xl shadow-lg lg:h-[100px] lg:w-[100px]">🎉</div>
      <h2 className="mt-6 font-['Poppins',sans-serif] text-[26px] font-bold text-[#0f1923] lg:text-4xl">Terima Kasih Atas Kontribusimu!</h2>
      <p className="mt-4 text-base leading-relaxed text-[#4a5568] lg:text-lg">
        Setiap jawaban dan rekam jejak yang kamu bagikan adalah <span className="text-[#0b55c7]">kunci utama</span> untuk
        membawa almamater kita melangkah lebih jauh. Kontribusimu membantu menciptakan pendidikan yang makin relevan
        dan inspiratif bagi generasi penerus SMK Puspita Bangsa.
      </p>
      <p className="mt-6 italic text-[#4a5568]">"Jejak langkahmu hari ini adalah fondasi masa depan generasi besok."</p>
      <Link to="/" className="mt-6 inline-flex h-14 items-center rounded-xl bg-[#0b55c7] px-10 font-['Poppins',sans-serif] text-lg font-semibold text-white shadow-lg shadow-blue-900/20 hover:bg-[#0947a8]">
        Kembali ke Beranda
      </Link>
    </div>
  );
}
