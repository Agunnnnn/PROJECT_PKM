// Komponen & gaya yang dipakai bersama oleh semua langkah survey

export const Svg = ({ children, size = 24, fill = "none", sw = 2 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill={fill}
    stroke="currentColor"
    strokeWidth={sw}
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    {children}
  </svg>
);

export const IArrowR = () => (
  <Svg>
    <path d="M5 12h14M13 6l6 6-6 6" />
  </Svg>
);
export const IArrowL = () => (
  <Svg>
    <path d="M19 12H5M11 6l-6 6 6 6" />
  </Svg>
);
export const ICheck = () => (
  <Svg size={34} sw={2.5}>
    <path d="M5 12.5l4.5 4.5L19 7.5" />
  </Svg>
);
export const IWarn = () => (
  <Svg size={34} sw={2.5}>
    <path d="M12 7v6M12 17h.01" />
  </Svg>
);
export const IChevron = () => (
  <Svg size={20} sw={2.5}>
    <path d="M6 9l6 6 6-6" />
  </Svg>
);
export const ICap = () => (
  <Svg size={28}>
    <path d="M2 9l10-5 10 5-10 5L2 9z" />
    <path d="M6 11.5V16c0 1.5 2.7 3 6 3s6-1.5 6-3v-4.5" />
  </Svg>
);
export const IBag = () => (
  <Svg size={28}>
    <rect x="3" y="7" width="18" height="13" rx="2" />
    <path d="M9 7V5a2 2 0 012-2h2a2 2 0 012 2v2M3 13h18" />
  </Svg>
);
export const IStore = () => (
  <Svg size={28}>
    <path d="M4 9l1.5-5h13L20 9M4 9v11h16V9M4 9c0 1.7 1.3 3 3 3s3-1.3 3-3c0 1.7 1.3 3 3 3s3-1.3 3-3c0 1.7 1.3 3 3 3" />
  </Svg>
);
export const ISearch = () => (
  <Svg size={28}>
    <circle cx="11" cy="11" r="7" />
    <path d="M20 20l-4-4" />
  </Svg>
);

export const fieldCls =
  "h-14 w-full rounded-xl border border-[#cbd5e1] bg-white px-4 text-base text-[#12263f] placeholder:text-[#6b7f99] focus:border-[#1767a8] focus:outline-none focus:ring-4 focus:ring-[#1767a8]/15 disabled:cursor-not-allowed disabled:bg-[#f1f5f9] disabled:text-[#8a9bb0]";
export const labelCls =
  "mb-2 block font-['Poppins',sans-serif] text-[15px] font-semibold text-[#12263f]";
export const btnBase =
  "inline-flex h-14 flex-1 items-center justify-center gap-3 rounded-xl px-6 font-['Poppins',sans-serif] text-lg font-semibold transition-colors sm:min-w-[200px] sm:flex-none lg:h-[58px]";

export const Select = ({
  id,
  label,
  value,
  onChange,
  disabled,
  placeholder,
  options,
}) => (
  <div>
    <label htmlFor={id} className={labelCls}>
      {label}
    </label>
    <div className="relative">
      <select
        id={id}
        name={id}
        value={value}
        onChange={onChange}
        disabled={disabled}
        className={`${fieldCls} appearance-none pr-12`}
      >
        <option value="">{placeholder}</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#5b7794]">
        <IChevron />
      </span>
    </div>
  </div>
);

export const Field = ({ id, label, opsional, className = "", ...props }) => (
  <div className={className}>
    <label htmlFor={id} className={labelCls}>
      {label}
      {opsional && (
        <span className="font-normal text-[#5b7794]"> (opsional)</span>
      )}
    </label>
    <input id={id} name={id} className={fieldCls} {...props} />
  </div>
);
