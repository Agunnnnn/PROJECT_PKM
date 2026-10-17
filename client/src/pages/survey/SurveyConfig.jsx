import api from "../../api/axios";
import { ICap, IBag, IStore, ISearch } from "./SurveyUi";

export const initialForm = {
  nis: "",
  nama: "",
  jurusan: "",
  tahunLulus: "",
  email: "",
  noHp: "",
  statusSaatIni: "",
  namaPerusahaan: "",
  bidangKerja: "",
  lamaTungguKerja: "",
  namaKampus: "",
  jurusanKampus: "",
  saranUntukSekolah: "",
};

export const LANGKAH = [
  {
    label: "Data diri",
    judul: "Data diri",
    sub: "Pilih jurusan dan namamu, data lainnya terisi otomatis.",
  },
  {
    label: "Status",
    judul: "Apa kegiatanmu sekarang?",
    sub: "Pilih satu status yang paling sesuai dengan kondisimu saat ini.",
  },
  {
    label: "Relevansi",
    judul: "Relevansi jurusan",
    sub: "Seberapa sesuai kegiatanmu saat ini dengan jurusan yang kamu pelajari di SMK?",
  },
  {
    label: "Selesai",
    judul: "Terima kasih, jawabanmu sudah kami terima!",
    sub: "",
  },
];

export const STATUS = [
  {
    key: "Kuliah",
    icon: <ICap />,
    desk: "Sedang menempuh pendidikan di perguruan tinggi.",
    subjek: "Program studi perkuliahan kamu",
  },
  {
    key: "Bekerja",
    icon: <IBag />,
    desk: "Aktif bekerja di perusahaan atau instansi.",
    subjek: "Pekerjaan kamu",
  },
  {
    key: "Wirausaha",
    icon: <IStore />,
    desk: "Membangun dan menjalankan usaha sendiri.",
    subjek: "Bidang usaha kamu",
  },
  {
    key: "Belum Bekerja",
    icon: <ISearch />,
    desk: "Sedang mencari pekerjaan atau peluang lain.",
    subjek: "",
  },
];

export const RINCIAN = {
  Kuliah: {
    judul: "Detail kuliah",
    sub: "Ceritakan di mana dan apa yang sedang kamu pelajari.",
    wajib: ["namaKampus", "jurusanKampus"],
  },
  Bekerja: {
    judul: "Detail pekerjaan",
    sub: "Ceritakan tempat dan bidang pekerjaanmu saat ini.",
    wajib: ["namaPerusahaan", "bidangKerja"],
  },
  Wirausaha: {
    judul: "Detail usaha",
    sub: "Ceritakan usaha yang sedang kamu jalankan.",
    wajib: ["namaPerusahaan", "bidangKerja"],
  },
};

export async function analisisRelevansi(form) {
  try {
    const res = await api.post("/survey/prediksi-relevansi", {
      jurusan: form.jurusan,
      statusSaatIni: form.statusSaatIni,
      bidangKerja: form.bidangKerja,
      jurusanKampus: form.jurusanKampus,
    });
    return res.data;
  } catch (err) {
    console.error("Gagal meminta prediksi relevansi:", err);
    return { relevansi: null, skor: 0, tersedia: false, error: true };
  }
}
