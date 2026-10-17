import { ICheck, IWarn, fieldCls, labelCls } from "./SurveyUi";

export default function StepRelevansi({
  form,
  hasil,
  loading,
  error,
  onChange,
}) {
  const status = form.statusSaatIni;
  const isKuliah = status === "Kuliah";
  const isBekerja = status === "Bekerja";

  const renderKartu = () => {
    if (!hasil) return null;

    const label = hasil.relevansi;
    const tersedia = hasil.tersedia && label && label !== "Tidak Diketahui";

    // 1. Sangat Sesuai
    if (tersedia && label === "Sangat Sesuai") {
      const deskripsi = isKuliah
        ? `Program studi "${form.jurusanKampus || ""}" sangat sesuai dan selaras dengan latar belakang jurusan SMK ${form.jurusan || ""}.`
        : `Bidang pekerjaan "${form.bidangKerja || ""}" sangat sesuai dan selaras dengan kompetensi keahlian jurusan SMK ${form.jurusan || ""}.`;

      return (
        <div className="flex items-start gap-4 rounded-2xl border-2 border-emerald-400 bg-emerald-50/80 p-4">
          <span className="grid h-12 w-12 flex-none place-items-center rounded-xl bg-emerald-600 text-white">
            <ICheck />
          </span>
          <div>
            <div className="font-['Poppins',sans-serif] text-lg font-bold text-emerald-900">
              Sangat Sesuai
            </div>
            <p className="mt-0.5 text-[15px] leading-relaxed text-emerald-800">
              {deskripsi}
            </p>
            <p className="mt-2 text-xs italic text-emerald-700/80">
              * Perkiraan otomatis, bukan penilaian resmi
            </p>
          </div>
        </div>
      );
    }

    // 2. Cukup Sesuai
    if (tersedia && label === "Cukup Sesuai") {
      const deskripsi = isKuliah
        ? `Program studi "${form.jurusanKampus || ""}" memiliki keterkaitan yang cukup sesuai dengan latar belakang jurusan SMK ${form.jurusan || ""}.`
        : `Bidang pekerjaan "${form.bidangKerja || ""}" memiliki keterkaitan yang cukup sesuai dengan kompetensi keahlian jurusan SMK ${form.jurusan || ""}.`;

      return (
        <div className="flex items-start gap-4 rounded-2xl border-2 border-amber-400 bg-amber-50/80 p-4">
          <span className="grid h-12 w-12 flex-none place-items-center rounded-xl bg-amber-500 text-white">
            <ICheck />
          </span>
          <div>
            <div className="font-['Poppins',sans-serif] text-lg font-bold text-amber-900">
              Cukup Sesuai
            </div>
            <p className="mt-0.5 text-[15px] leading-relaxed text-amber-800">
              {deskripsi}
            </p>
            <p className="mt-2 text-xs italic text-amber-700/80">
              * Perkiraan otomatis, bukan penilaian resmi
            </p>
          </div>
        </div>
      );
    }

    // 3. Tidak Sesuai
    if (tersedia && label === "Tidak Sesuai") {
      const deskripsi = isKuliah
        ? `Program studi "${form.jurusanKampus || ""}" teridentifikasi lintas bidang dan tidak langsung berkaitan dengan jurusan SMK ${form.jurusan || ""}.`
        : `Bidang pekerjaan "${form.bidangKerja || ""}" teridentifikasi berbeda bidang dengan kompetensi keahlian jurusan SMK ${form.jurusan || ""}.`;

      return (
        <div className="flex items-start gap-4 rounded-2xl border-2 border-rose-300 bg-rose-50/80 p-4">
          <span className="grid h-12 w-12 flex-none place-items-center rounded-xl bg-rose-500 text-white">
            <IWarn />
          </span>
          <div>
            <div className="font-['Poppins',sans-serif] text-lg font-bold text-rose-900">
              Tidak Sesuai
            </div>
            <p className="mt-0.5 text-[15px] leading-relaxed text-rose-800">
              {deskripsi}
            </p>
            <p className="mt-2 text-xs italic text-rose-700/80">
              * Perkiraan otomatis, bukan penilaian resmi
            </p>
          </div>
        </div>
      );
    }

    // 4. Kartu Netral (Wirausaha, Belum Bekerja, ML tidak tersedia, atau timeout)
    let deskripsiNetral =
      "Analisis relevansi otomatis saat ini belum tersedia untuk kondisi ini. Kamu tetap bisa melanjutkan dan mengirim jawabanmu.";

    if (status === "Wirausaha") {
      deskripsiNetral =
        "Penilaian otomatis Machine Learning saat ini difokuskan pada jalur Bekerja dan Kuliah. Usaha yang kamu jalankan tetap tercatat dan sangat dihargai.";
    } else if (status === "Belum Bekerja") {
      deskripsiNetral =
        "Kamu belum memiliki aktivitas bekerja atau perkuliahan untuk dinilai relevansinya. Kamu tetap dapat melanjutkan dan mengirim survei.";
    } else if (isKuliah && !hasil.tersedia) {
      deskripsiNetral =
        "Model analisis untuk jalur perkuliahan sedang dalam tahap pengembangan. Data pilihan kampus dan jurusanmu tetap tersimpan.";
    }

    return (
      <div className="flex items-start gap-4 rounded-2xl border-2 border-slate-300 bg-slate-50/90 p-4">
        <span className="grid h-12 w-12 flex-none place-items-center rounded-xl bg-slate-500 text-white">
          <IWarn />
        </span>
        <div>
          <div className="font-['Poppins',sans-serif] text-lg font-bold text-slate-800">
            Analisis belum tersedia untuk kondisi ini
          </div>
          <p className="mt-0.5 text-[15px] leading-relaxed text-slate-600">
            {deskripsiNetral}
          </p>
          <p className="mt-2 text-xs italic text-slate-500">
            * Perkiraan otomatis, bukan penilaian resmi
          </p>
        </div>
      </div>
    );
  };

  return (
    <>
      <h2 className="mb-4 font-['Poppins',sans-serif] text-xl font-bold text-[#12263f] lg:text-2xl">
        Hasil Analisis Relevansi (Machine Learning)
      </h2>

      {loading && (
        <div
          role="status"
          className="rounded-2xl border-2 border-dashed border-[#c7d8ec] p-6 text-[#5b7794]"
        >
          Sedang menganalisis kegiatanmu…
        </div>
      )}
      {!loading && renderKartu()}

      <div className="mt-6">
        <label htmlFor="saranUntukSekolah" className={labelCls}>
          Saran untuk Sekolah{" "}
          <span className="font-normal text-[#5b7794]">(opsional)</span>
        </label>
        <textarea
          id="saranUntukSekolah"
          name="saranUntukSekolah"
          rows={4}
          value={form.saranUntukSekolah}
          onChange={onChange}
          placeholder="Tulis saran atau masukanmu untuk SMK Puspita Bangsa"
          className={`${fieldCls} h-auto py-3`}
        />
      </div>

      {error && (
        <div
          role="alert"
          className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {error}
        </div>
      )}
    </>
  );
}
