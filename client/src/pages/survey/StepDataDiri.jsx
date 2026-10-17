import { useEffect, useState } from "react";
import api from "../../api/axios";
import { Select, fieldCls, labelCls } from "./SurveyUi";

// Langkah 1: pilihan berantai jurusan -> tahun lulus -> nama; NIS terisi otomatis
export default function StepDataDiri({ form, setForm }) {
  const [jurusanList, setJurusanList] = useState([]);
  const [tahunList, setTahunList] = useState([]);
  const [alumniList, setAlumniList] = useState([]);

  useEffect(() => {
    api
      .get("/alumni/jurusan-list")
      .then((res) => setJurusanList(res.data))
      .catch(() => setJurusanList([]));
  }, []);

  useEffect(() => {
    if (!form.jurusan) return setTahunList([]);
    api
      .get("/alumni/tahun-by-jurusan", { params: { jurusan: form.jurusan } })
      .then((res) => setTahunList(res.data))
      .catch(() => setTahunList([]));
  }, [form.jurusan]);

  useEffect(() => {
    if (!form.jurusan || !form.tahunLulus) return setAlumniList([]);
    api
      .get("/alumni/search", {
        params: { jurusan: form.jurusan, tahunLulus: form.tahunLulus },
      })
      .then((res) => setAlumniList(res.data))
      .catch(() => setAlumniList([]));
  }, [form.jurusan, form.tahunLulus]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "jurusan")
      return setForm({
        ...form,
        jurusan: value,
        tahunLulus: "",
        nama: "",
        nis: "",
      });
    if (name === "tahunLulus")
      return setForm({ ...form, tahunLulus: value, nama: "", nis: "" });
    if (name === "nama") {
      const dipilih = alumniList.find((a) => a.nama === value);
      return setForm({ ...form, nama: value, nis: dipilih ? dipilih.nis : "" });
    }
  };

  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <Select
        id="jurusan"
        label="Jurusan di SMK"
        value={form.jurusan}
        onChange={handleChange}
        placeholder="-- Pilih Jurusan --"
        options={jurusanList.map((j) => ({ value: j, label: j }))}
      />
      <Select
        id="tahunLulus"
        label="Tahun Lulus"
        value={form.tahunLulus}
        onChange={handleChange}
        disabled={!form.jurusan}
        placeholder="-- Pilih Tahun Lulus --"
        options={tahunList.map((t) => ({ value: t, label: t }))}
      />
      <Select
        id="nama"
        label="Nama Lengkap"
        value={form.nama}
        onChange={handleChange}
        disabled={!form.tahunLulus}
        placeholder="-- Pilih Nama --"
        options={alumniList.map((a) => ({ value: a.nama, label: a.nama }))}
      />
      <div>
        <label htmlFor="nis" className={labelCls}>
          NIS
        </label>
        <input
          id="nis"
          value={form.nis}
          readOnly
          placeholder="Otomatis terisi setelah pilih nama"
          className={`${fieldCls} bg-[#f1f5f9]`}
        />
      </div>
    </div>
  );
}
