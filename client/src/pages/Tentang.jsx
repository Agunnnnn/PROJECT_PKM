import { Link2, Shuffle, BookOpen } from "lucide-react";

const cards = [
    {
        number: "01",
        title: "Relevan",
        icon: Link2,
        iconStyle: "bg-blue-900/60 text-sky-300",
        text: "Pekerjaan atau program studimu sejalan dengan jurusan di SMK. Contoh: lulusan RPL bekerja sebagai programmer.",
    },
    {
        number: "02",
        title: "Tidak relevan",
        icon: Shuffle,
        iconStyle: "bg-teal-700/60 text-teal-200",
        text: "Pekerjaan atau program studimu berbeda bidang dengan jurusan di SMK. Contoh: lulusan RPL bekerja sebagai kasir.",
    },
    {
        number: "03",
        title: "Untuk apa?",
        icon: BookOpen,
        iconStyle: "bg-yellow-700/60 text-yellow-200",
        text: "Hasilnya dipakai sekolah untuk memperbarui kurikulum dan kerja sama dengan dunia usaha.",
    },
];

export default function TentangTracerStudy() {
    return (
        <div className="flex min-h-screen flex-col bg-sky-50 font-[Poppins,sans-serif] text-slate-800">
            {/* Konten */}
            <main className="flex-1 px-6 py-12">
                <div className="mx-auto max-w-6xl">
                    <h1 className="text-4xl font-bold text-slate-900">
                        Tentang Tracer Study
                    </h1>
                    <p className="mt-4 max-w-3xl text-lg leading-relaxed text-slate-600">
                        Survey ini mengumpulkan informasi tentang kegiatan Anda setelah
                        lulus untuk meningkatkan kualitas pendidikan kejuruan.
                    </p>

                    <div className="mt-8 grid gap-6 md:grid-cols-3">
                        {cards.map(({ number, title, icon: Icon, iconStyle, text }) => (
                            <article
                                key={number}
                                className="relative overflow-hidden rounded-lg bg-blue-700 p-6 text-white shadow-[4px_4px_0_0_rgba(15,23,42,0.18)]"
                            >
                                {/* Angka besar dekoratif */}
                                <div
                                    aria-hidden="true"
                                    className="absolute -right-4 -top-4 flex h-28 w-28 items-center justify-center rounded-full bg-black/15 text-5xl font-bold text-white/25"
                                >
                                    {number}
                                </div>

                                <div
                                    className={`relative flex h-10 w-10 items-center justify-center rounded-md ${iconStyle}`}
                                >
                                    <Icon size={20} />
                                </div>

                                <h2 className="relative mt-3 text-2xl font-bold">{title}</h2>
                                <p className="relative mt-3 text-sm leading-relaxed text-blue-50">
                                    {text}
                                </p>
                            </article>
                        ))}
                    </div>
                </div>
            </main>
        </div>
    );
}