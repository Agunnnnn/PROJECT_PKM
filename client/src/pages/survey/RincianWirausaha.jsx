import { Field } from "./SurveyUi";

// Memakai kolom namaPerusahaan & bidangKerja yang sudah ada di backend
export default function RincianWirausaha({ form, onChange }) {
  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <Field
        id="namaPerusahaan"
        label="Nama Usaha"
        value={form.namaPerusahaan}
        onChange={onChange}
      />
      <Field
        id="bidangKerja"
        label="Bidang Usaha"
        value={form.bidangKerja}
        onChange={onChange}
      />
    </div>
  );
}
