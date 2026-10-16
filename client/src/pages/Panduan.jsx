import { Contact, Briefcase, ClipboardCheck, Send } from "lucide-react";

const steps = [
    {
        number: "01",
        title: "Data Diri",
        icon: Contact,
        iconStyle: "bg-blue-900/60 text-sky-300",
        text: "Isi nama, tahun lulus, dan jurusan.",
    },
    {
        number: "02",
        title: "Status Saat Ini",
        icon: Briefcase,
        iconStyle: "bg-yellow-700/60 text-yellow-200",
        text: "Pilih bekerja, kuliah, wirausaha, atau belum bekerja.",
    },
    {
        number: "03",
        title: "Relevansi Jurusan",
        icon: ClipboardCheck,
        iconStyle: "bg-rose-800/60 text-rose-200",
        text: "Nilai kecocokan pekerjaan dan kuliahmu dengan jurusan.",
    },
    {
        number: "04",
        title: "Selesai dan Kirim",
        icon: Send,
        iconStyle: "bg-teal-700/60 text-teal-200",
        text: "Tinjau data dan kirim jawabanmu.",
    },
];

export default function PanduanPengisian() {
    return (
        <section className="bg-sky-50 px-6 py-12 font-[Poppins,sans-serif] text-slate-800">
            <div className="mx-auto max-w-6xl">
                <h1 className="text-4xl font-bold text-slate-900">Panduan pengisian</h1>
                <p className="mt-4 max-w-md text-lg leading-relaxed text-slate-600">
                    Ikuti empat langkah singkat berikut. Selesai dalam sekitar 3 menit.
                </p>

                <ol className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                    {steps.map(({ number, title, icon: Icon, iconStyle, text }) => (
                        <li
                            key={number}
                            className="relative overflow-hidden rounded-lg bg-blue-700 p-5 text-white shadow-[4px_4px_0_0_rgba(15,23,42,0.18)]"
                        >
                            {/* Angka besar dekoratif */}
                            <div
                                aria-hidden="true"
                                className="absolute -right-3 -top-3 flex h-24 w-24 items-center justify-center rounded-full bg-black/15 text-4xl font-bold text-white/25"
                            >
                                {number}
                            </div>

                            <div
                                className={`relative flex h-9 w-9 items-center justify-center rounded-md ${iconStyle}`}
                            >
                                <Icon size={18} />
                            </div>

                            <h2 className="relative mt-3 text-xl font-bold leading-snug">
                                {title}
                            </h2>
                            <p className="relative mt-2 text-sm leading-relaxed text-blue-50">
                                {text}
                            </p>
                        </li>
                    ))}
                </ol>
            </div>
        </section>
    );
}