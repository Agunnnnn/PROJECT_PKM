import { useEffect, useState } from "react";
import api from "../../api/axios";
import {
  LANGKAH,
  RINCIAN,
  analisisRelevansi,
  initialForm,
} from "./SurveyConfig";
import { IArrowL, IArrowR, btnBase } from "./SurveyUi";
import StepIndicator from "./StepIndicator";
import StepDataDiri from "./StepDataDiri";
import StepStatus from "./StepStatus";
import RincianKuliah from "./RincianKuliah";
import RincianBekerja from "./RincianBekerja";
import RincianWirausaha from "./RincianWirausaha";
import StepRelevansi from "./StepRelevansi";
import StepSelesai from "./StepSelesai";

const HALAMAN_RINCIAN = {
  Kuliah: RincianKuliah,
  Bekerja: RincianBekerja,
  Wirausaha: RincianWirausaha,
};

export default function FormSurvey() {
  const [step, setStep] = useState(1);
  const [rincian, setRincian] = useState(false); // true = sedang di halaman rincian (langkah 2)
  const [form, setForm] = useState(initialForm);
  const [hasil, setHasil] = useState(null);
  const [analisisKey, setAnalisisKey] = useState("");
  const [loadingHasil, setLoadingHasil] = useState(false);
  const [mengirim, setMengirim] = useState(false);
  const [error, setError] = useState("");

  const status = form.statusSaatIni;
  const adaRincian = !!RINCIAN[status];

  const jalankanPrediksi = async (dataForm) => {
    const key = `${dataForm.jurusan}|${dataForm.statusSaatIni}|${dataForm.bidangKerja}|${dataForm.jurusanKampus}`;
    if (key === analisisKey && hasil !== null) {
      return;
    }
    setLoadingHasil(true);
    setHasil(null);
    try {
      const h = await analisisRelevansi(dataForm);
      setHasil(h);
      setAnalisisKey(key);
    } catch {
      setHasil({ relevansi: null, skor: 0, tersedia: false, gagal: true });
    } finally {
      setLoadingHasil(false);
    }
  };

  // Fail-safe jika masuk langkah 3 tapi hasil belum ada
  useEffect(() => {
    if (step === 3 && !hasil && !loadingHasil) {
      jalankanPrediksi(form);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, hasil, loadingHasil]);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    // Reset hasil jika ada input diubah sehingga harus dihitung ulang saat Lanjut
    setHasil(null);
    setAnalisisKey("");
  };

  // Ganti status = kosongkan rincian lama supaya tidak ikut terkirim & reset prediksi
  const pilihStatus = (key) => {
    setForm((prev) => ({
      ...prev,
      statusSaatIni: key,
      namaPerusahaan: "",
      bidangKerja: "",
      lamaTungguKerja: "",
      namaKampus: "",
      jurusanKampus: "",
    }));
    setHasil(null);
    setAnalisisKey("");
  };

  const valid =
    step === 1
      ? !!form.nama
      : step === 2 && !rincian
        ? !!status
        : step === 2 && rincian
          ? RINCIAN[status].wajib.every((k) => (form[k] || "").trim())
          : step === 3
            ? !loadingHasil && !mengirim
            : true;

  const kirim = async () => {
    setError("");
    setMengirim(true);
    try {
      await api.post("/survey", form);
      setStep(4);
    } catch (err) {
      console.error(err);
      setError("Gagal mengirim data. Coba lagi beberapa saat.");
    } finally {
      setMengirim(false);
    }
  };

  const lanjut = () => {
    if (step === 1) return setStep(2);
    if (step === 2 && !rincian) {
      if (adaRincian) {
        return setRincian(true);
      }
      setStep(3);
      jalankanPrediksi(form);
      return;
    }
    if (step === 2 && rincian) {
      setRincian(false);
      setStep(3);
      jalankanPrediksi(form);
      return;
    }
    if (step === 3) return kirim();
  };

  const kembali = () => {
    if (step === 3) {
      setStep(2);
      return setRincian(adaRincian);
    }
    if (step === 2 && rincian) return setRincian(false);
    if (step === 2) return setStep(1);
  };

  // Judul pita biru: halaman rincian punya judul sendiri
  const hero = step === 2 && rincian ? RINCIAN[status] : LANGKAH[step - 1];
  const Rincian = HALAMAN_RINCIAN[status];

  return (
    <div className="bg-[#e9f3fd] font-['Inter',sans-serif]">
      {/* ===== Pita biru ===== */}
      <section className="relative overflow-hidden bg-linear-to-r from-[#2f7acb] via-[#235ea6] to-[#1b4885] px-5 pb-20 pt-10 text-white lg:pb-24 lg:pt-12">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-40 -left-32 h-105 w-105 rounded-full bg-white/10"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-24 -left-16 h-65 w-65 rounded-full bg-white/10"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-28 -top-40 h-120 w-120 rounded-full bg-[#0f2f5e]/30"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-8 -top-24 h-75 w-75 rounded-full bg-[#0f2f5e]/35"
        />

        <div className="relative mx-auto max-w-5xl">
          <h1 className="font-['Poppins',sans-serif] text-[30px] font-bold leading-tight lg:text-[48px]">
            {hero.judul}
          </h1>
          {hero.sub && (
            <p className="mt-2 max-w-2xl text-base text-white/90 lg:text-xl">
              {hero.sub}
            </p>
          )}
          <StepIndicator step={step} />
        </div>
      </section>

      {/* ===== Kartu langkah ===== */}
      <div className="relative mx-auto -mt-14 max-w-6xl px-4 pb-16 lg:px-6">
        <div className="rounded-[28px] bg-white p-5 shadow-[0_12px_40px_rgba(23,103,168,0.12)] lg:rounded-4xl lg:p-8">
          {step === 1 && <StepDataDiri form={form} setForm={setForm} />}
          {step === 2 && !rincian && (
            <StepStatus value={status} onPilih={pilihStatus} />
          )}
          {step === 2 && rincian && Rincian && (
            <Rincian form={form} onChange={handleChange} />
          )}
          {step === 3 && (
            <StepRelevansi
              form={form}
              hasil={hasil}
              loading={loadingHasil}
              error={error}
              onChange={handleChange}
            />
          )}
          {step === 4 && <StepSelesai />}

          {step < 4 && (
            <div className="mt-8 flex justify-end gap-3">
              {step > 1 && (
                <button
                  type="button"
                  onClick={kembali}
                  disabled={mengirim}
                  className={`${btnBase} border border-[#1767a8] bg-white text-[#1767a8] hover:bg-[#1767a8]/10`}
                >
                  <IArrowL /> Kembali
                </button>
              )}
              <button
                type="button"
                onClick={lanjut}
                disabled={!valid || mengirim}
                className={`${btnBase} justify-between bg-[#1767a8] text-white hover:bg-[#12558c] disabled:cursor-not-allowed disabled:opacity-50 sm:px-8`}
              >
                <span className="flex-1 text-center">
                  {mengirim ? "Mengirim..." : "Lanjut"}
                </span>
                <IArrowR />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
