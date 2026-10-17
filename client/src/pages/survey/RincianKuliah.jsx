import { Field } from "./SurveyUi";

export default function RincianKuliah({ form, onChange }) {
  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <Field
        id="namaKampus"
        label="Nama Kampus"
        value={form.namaKampus}
        onChange={onChange}
      />
      <Field
        id="jurusanKampus"
        label="Jurusan Kuliah"
        value={form.jurusanKampus}
        onChange={onChange}
      />
    </div>
  );
}
