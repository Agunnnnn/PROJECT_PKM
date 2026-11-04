import { Field, Select } from "./SurveyUi";
import { OPSI_GAJI } from "./SurveyConfig";

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
      <Select
        id="gaji"
        label="Rentang Gaji per Bulan"
        value={form.gaji}
        onChange={onChange}
        placeholder="-- Pilih rentang gaji --"
        options={OPSI_GAJI}
      />
      <Field
        id="lamaTungguKerja"
        label="Lama Menunggu Kerja"
        opsional
        placeholder="contoh: < 3 bulan"
        value={form.lamaTungguKerja}
        onChange={onChange}
      />
    </div>
  );
}
