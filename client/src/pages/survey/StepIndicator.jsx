import { LANGKAH } from "./SurveyConfig";

export default function StepIndicator({ step }) {
  const garisOranye = Math.min(step, 3); // garis setelah langkah aktif berwarna oranye
  return (
    <ol
      className="mx-auto mt-8 flex w-full max-w-3xl items-start"
      aria-label="Langkah pengisian"
    >
      {LANGKAH.map((l, i) => {
        const no = i + 1;
        const aktif = no === step;
        return (
          <li
            key={l.label}
            className="flex flex-1 items-start last:flex-none"
            aria-current={aktif ? "step" : undefined}
          >
            <div className="flex w-12 flex-col items-center lg:w-17">
              <span
                className={`grid h-12 w-12 place-items-center rounded-full border-4 font-['Poppins',sans-serif] text-xl font-bold lg:h-17 lg:w-17 lg:text-[44px] ${
                  aktif
                    ? "border-[#f5a623] bg-white text-[#1767a8]"
                    : "border-white/40 bg-[#7396c4]/70 text-white"
                }`}
              >
                {no}
              </span>
              <span
                className={`mt-2 w-max font-['Poppins',sans-serif] text-sm font-bold lg:text-[26px] ${aktif ? "text-white" : "text-[#9cb8dd]"}`}
              >
                {l.label}
              </span>
            </div>
            {no < 4 && (
              <span
                className={`mx-2 mt-5.5 h-1 flex-1 rounded-full lg:mx-4 lg:mt-8 ${no === garisOranye ? "bg-[#f5a623]" : "bg-white/70"}`}
              />
            )}
          </li>
        );
      })}
    </ol>
  );
}
