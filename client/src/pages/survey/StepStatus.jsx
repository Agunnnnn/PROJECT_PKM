import { STATUS } from "./SurveyConfig";

// Langkah 2: pilih status. Rincian diisi di halaman berikutnya.
export default function StepStatus({ value, onPilih }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {STATUS.map((s) => {
        const dipilih = value === s.key;
        return (
          <button
            key={s.key}
            type="button"
            onClick={() => onPilih(s.key)}
            aria-pressed={dipilih}
            className={`rounded-2xl border-2 p-5 text-left transition-colors ${
              dipilih
                ? "border-[#1767a8] bg-[#eaf3fd]"
                : "border-[#d9e6f5] bg-white hover:border-[#9fc3e6]"
            }`}
          >
            <span className="grid h-12 w-12 place-items-center rounded-xl bg-[#fff0d6] text-[#f5a623]">
              {s.icon}
            </span>
            <span className="mt-4 block font-['Poppins',sans-serif] text-xl font-bold text-[#12263f]">
              {s.key}
            </span>
            <span className="mt-1 block text-[15px] leading-snug text-[#5b7794]">
              {s.desk}
            </span>
          </button>
        );
      })}
    </div>
  );
}
