import { useState, useEffect } from "react";
import api from "../api/axios";

const initialForm = {
    nis: "",
    nama: "",
    jurusan: "",
    tahunLulus: "",
    email: "",
    noHp: "",
    statusSaatIni: "Bekerja",
    namaPerusahaan: "",
    bidangKerja: "",
    relevansiJurusan: "Sangat Sesuai",
    lamaTungguKerja: "",
    namaKampus: "",
    jurusanKampus: "",
    saranUntukSekolah: "",
};

export default function FormSurvey() {
    const [form, setForm] = useState(initialForm);
    const [status, setStatus] = useState(null);

    const [jurusanList, setJurusanList] = useState([]);
    const [tahunList, setTahunList] = useState([]);
    const [alumniList, setAlumniList] = useState([]);

    // Ambil daftar jurusan sekali di awal
    useEffect(() => {
        api.get("/alumni/jurusan-list").then((res) => setJurusanList(res.data));
    }, []);

    // Setiap jurusan berubah, ambil daftar tahun lulus yang sesuai
    useEffect(() => {
        if (!form.jurusan) {
            setTahunList([]);
            return;
        }
        api.get("/alumni/tahun-by-jurusan", {
            params: { jurusan: form.jurusan },
        }).then((res) => setTahunList(res.data));
    }, [form.jurusan]);

    // Setiap jurusan/tahun berubah, ambil daftar nama alumni yang sesuai
    useEffect(() => {
        if (!form.jurusan || !form.tahunLulus) {
            setAlumniList([]);
            return;
        }
        api.get("/alumni/search", {
            params: { jurusan: form.jurusan, tahunLulus: form.tahunLulus },
        }).then((res) => setAlumniList(res.data));
    }, [form.jurusan, form.tahunLulus]);

    const handleChange = (e) => {
        const { name, value } = e.target;

        // Kalau ganti jurusan, reset pilihan tahun & nama yang di bawahnya
        if (name === "jurusan") {
            setForm({
                ...form,
                jurusan: value,
                tahunLulus: "",
                nama: "",
                nis: "",
            });
            return;
        }
        // Kalau ganti tahun, reset pilihan nama
        if (name === "tahunLulus") {
            setForm({ ...form, tahunLulus: value, nama: "", nis: "" });
            return;
        }
        // Kalau pilih nama, otomatis isi NIS dari data yang cocok
        if (name === "nama") {
            const dipilih = alumniList.find((a) => a.nama === value);
            setForm({ ...form, nama: value, nis: dipilih ? dipilih.nis : "" });
            return;
        }

        setForm({ ...form, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus(null);
        try {
            await api.post("/survey", form);
            setStatus("success");
            setForm(initialForm);
            setTahunList([]);
            setAlumniList([]);
        } catch (error) {
            console.error(error);
            setStatus("error");
        }
    };

    return (
        <div className='container'>
            <div className='card'>
                <h1>Form Tracer Study Alumni</h1>
                <p>
                    SMK Puspita Bangsa — Isi data berikut sesuai kondisi kamu
                    saat ini.
                </p>

                <form onSubmit={handleSubmit}>
                    <label>Jurusan</label>
                    <select
                        name='jurusan'
                        value={form.jurusan}
                        onChange={handleChange}
                        required
                    >
                        <option value=''>-- Pilih Jurusan --</option>
                        {jurusanList.map((j) => (
                            <option key={j} value={j}>
                                {j}
                            </option>
                        ))}
                    </select>

                    <label>Tahun Lulus</label>
                    <select
                        name='tahunLulus'
                        value={form.tahunLulus}
                        onChange={handleChange}
                        required
                        disabled={!form.jurusan}
                    >
                        <option value=''>-- Pilih Tahun Lulus --</option>
                        {tahunList.map((t) => (
                            <option key={t} value={t}>
                                {t}
                            </option>
                        ))}
                    </select>

                    <label>Nama</label>
                    <select
                        name='nama'
                        value={form.nama}
                        onChange={handleChange}
                        required
                        disabled={!form.tahunLulus}
                    >
                        <option value=''>-- Pilih Nama --</option>
                        {alumniList.map((a) => (
                            <option key={a.id} value={a.nama}>
                                {a.nama}
                            </option>
                        ))}
                    </select>

                    <label>NIS</label>
                    <input
                        name='nis'
                        value={form.nis}
                        readOnly
                        placeholder='Otomatis terisi setelah pilih nama'
                    />

                    <label>Email</label>
                    <input
                        type='email'
                        name='email'
                        value={form.email}
                        onChange={handleChange}
                    />

                    <label>No HP / WhatsApp</label>
                    <input
                        name='noHp'
                        value={form.noHp}
                        onChange={handleChange}
                    />

                    <label>Status Saat Ini</label>
                    <select
                        name='statusSaatIni'
                        value={form.statusSaatIni}
                        onChange={handleChange}
                    >
                        <option>Bekerja</option>
                        <option>Kuliah</option>
                        <option>Wirausaha</option>
                        <option>Belum Bekerja</option>
                    </select>

                    {form.statusSaatIni === "Bekerja" && (
                        <>
                            <label>Nama Perusahaan</label>
                            <input
                                name='namaPerusahaan'
                                value={form.namaPerusahaan}
                                onChange={handleChange}
                            />

                            <label>Bidang Pekerjaan</label>
                            <input
                                name='bidangKerja'
                                value={form.bidangKerja}
                                onChange={handleChange}
                            />

                            <label>Kesesuaian dengan Jurusan</label>
                            <select
                                name='relevansiJurusan'
                                value={form.relevansiJurusan}
                                onChange={handleChange}
                            >
                                <option>Sangat Sesuai</option>
                                <option>Cukup Sesuai</option>
                                <option>Tidak Sesuai</option>
                            </select>

                            <label>Lama Menunggu Kerja</label>
                            <input
                                name='lamaTungguKerja'
                                placeholder='contoh: < 3 bulan'
                                value={form.lamaTungguKerja}
                                onChange={handleChange}
                            />
                        </>
                    )}

                    {form.statusSaatIni === "Kuliah" && (
                        <>
                            <label>Nama Kampus</label>
                            <input
                                name='namaKampus'
                                value={form.namaKampus}
                                onChange={handleChange}
                            />

                            <label>Jurusan Kuliah</label>
                            <input
                                name='jurusanKampus'
                                value={form.jurusanKampus}
                                onChange={handleChange}
                            />
                        </>
                    )}

                    <label>Saran untuk Sekolah</label>
                    <textarea
                        name='saranUntukSekolah'
                        value={form.saranUntukSekolah}
                        onChange={handleChange}
                    />

                    <button type='submit'>Kirim Jawaban</button>
                </form>

                {status === "success" && (
                    <div className='msg-success'>
                        Terima kasih! Jawaban kamu berhasil disimpan.
                    </div>
                )}
                {status === "error" && (
                    <div className='msg-error'>
                        Gagal mengirim data. Coba lagi beberapa saat.
                    </div>
                )}
            </div>
        </div>
    );
}
