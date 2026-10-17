import { Field } from "./SurveyUi";

export default function RincianBekerja({ form, onChange }) {
  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <Field
        id="namaPerusahaan"
        label="Nama Perusahaan"
        value={form.namaPerusahaan}
        onChange={onChange}
      />
      <Field
        id="bidangKerja"
        label="Bidang Pekerjaan"
        value={form.bidangKerja}
        onChange={onChange}
      />
      <Field
        id="lamaTungguKerja"
        label="Lama Menunggu Kerja"
        opsional
        placeholder="contoh: < 3 bulan"
        value={form.lamaTungguKerja}
        onChange={onChange}
        className="lg:col-span-2"
      />
    </div>
  );
}
