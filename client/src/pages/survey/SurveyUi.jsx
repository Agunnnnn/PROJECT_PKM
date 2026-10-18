// Komponen & gaya yang dipakai bersama oleh semua langkah survey
import { useState, useRef, useEffect } from "react";

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
  disabled = false,
  placeholder = "-- Pilih --",
  options = [],
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const dropdownRef = useRef(null);

  // Ambil label opsi yang sedang terpilih
  const selectedOption = options.find((o) => String(o.value) === String(value));

  // Tutup dropdown jika klik di luar
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("touchstart", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [isOpen]);

  // Reset pencarian saat dropdown ditutup
  useEffect(() => {
    if (!isOpen) setSearch("");
  }, [isOpen]);

  // Tutup jika komponen tiba-tiba di-disable
  useEffect(() => {
    if (disabled && isOpen) {
      setIsOpen(false);
    }
  }, [disabled, isOpen]);

  const handleSelect = (val) => {
    onChange({ target: { name: id, value: val } });
    setIsOpen(false);
  };

  const filteredOptions = options.filter((o) =>
    String(o.label || o.value)
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  return (
    <div className={`relative ${isOpen ? "z-30" : "z-10"}`} ref={dropdownRef}>
      {label && (
        <label htmlFor={id} className={labelCls}>
          {label}
        </label>
      )}
      <div className="relative">
        <button
          type="button"
          id={id}
          disabled={disabled}
          onClick={() => !disabled && setIsOpen((prev) => !prev)}
          className={`${fieldCls} flex items-center justify-between text-left appearance-none pr-10 transition-all ${
            disabled
              ? "cursor-not-allowed bg-[#f1f5f9] text-[#8a9bb0]"
              : "cursor-pointer bg-white"
          } ${!value ? "text-[#6b7f99]" : "text-[#12263f]"}`}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
        >
          <span className="truncate">
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          <span
            className={`pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#5b7794] transition-transform duration-200 ${
              isOpen ? "rotate-180" : ""
            }`}
          >
            <IChevron />
          </span>
        </button>

        {isOpen && !disabled && (
          <div className="absolute left-0 top-full z-50 mt-1.5 w-full rounded-xl border border-[#cbd5e1] bg-white shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-100">
            {/* Input pencarian jika opsi lebih dari 5 */}
            {options.length > 5 && (
              <div className="border-b border-[#e2e8f0] p-2 bg-[#f8fafc]">
                <div className="relative">
                  <input
                    type="text"
                    autoFocus
                    placeholder="Ketik untuk mencari..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full rounded-lg border border-[#cbd5e1] bg-white py-2 pl-3 pr-8 text-sm text-[#12263f] placeholder:text-[#94a3b8] focus:border-[#1767a8] focus:outline-none focus:ring-2 focus:ring-[#1767a8]/20"
                    onClick={(e) => e.stopPropagation()}
                  />
                  {search && (
                    <button
                      type="button"
                      onClick={() => setSearch("")}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-[#94a3b8] hover:text-[#12263f]"
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>
            )}

            <ul
              role="listbox"
              className="max-h-56 overflow-y-auto overscroll-contain py-1 text-base divide-y divide-[#f8fafc]"
            >
              {placeholder && (
                <li
                  role="option"
                  aria-selected={!value}
                  onClick={() => handleSelect("")}
                  className={`cursor-pointer px-4 py-2.5 text-sm transition-colors ${
                    !value
                      ? "bg-[#1767a8]/10 font-semibold text-[#1767a8]"
                      : "text-[#64748b] hover:bg-[#f1f5f9]"
                  }`}
                >
                  {placeholder}
                </li>
              )}
              {filteredOptions.length > 0 ? (
                filteredOptions.map((o, idx) => {
                  const isSelected = String(o.value) === String(value);
                  return (
                    <li
                      key={`${o.value}-${idx}`}
                      role="option"
                      aria-selected={isSelected}
                      onClick={() => handleSelect(o.value)}
                      className={`flex cursor-pointer items-center justify-between px-4 py-2.5 text-sm transition-colors ${
                        isSelected
                          ? "bg-[#1767a8]/10 font-semibold text-[#1767a8]"
                          : "text-[#12263f] hover:bg-[#f8fafc]"
                      }`}
                    >
                      <span className="truncate pr-2">{o.label}</span>
                      {isSelected && (
                        <span className="text-[#1767a8] font-bold text-sm shrink-0">
                          ✓
                        </span>
                      )}
                    </li>
                  );
                })
              ) : (
                <li className="px-4 py-3 text-center text-sm text-[#94a3b8]">
                  Tidak ada data yang cocok
                </li>
              )}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

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
