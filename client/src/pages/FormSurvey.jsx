import { useState } from "react";
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
    saranUntukSekolah: "",
};

export default function FormSurvey() {
    const [form, setForm] = useState(initialForm);
    const [status, setStatus] = useState(null); // 'success' | 'error' | null

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus(null);
        try {
            await api.post("/survey", form);
            setStatus("success");
            setForm(initialForm);
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
                    <label>NIS</label>
                    <input
                        name='nis'
                        value={form.nis}
                        onChange={handleChange}
                        required
                    />

                    <label>Nama Lengkap</label>
                    <input
                        name='nama'
                        value={form.nama}
                        onChange={handleChange}
                        required
                    />

                    <label>Jurusan</label>
                    <input
                        name='jurusan'
                        value={form.jurusan}
                        onChange={handleChange}
                        required
                    />

                    <label>Tahun Lulus</label>
                    <input
                        type='number'
                        name='tahunLulus'
                        value={form.tahunLulus}
                        onChange={handleChange}
                        required
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
