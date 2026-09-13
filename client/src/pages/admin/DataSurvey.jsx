import { useEffect, useState } from "react";
import api from "../../api/axios";

export default function DataSurvey() {
    const [surveys, setSurveys] = useState([]);
    const [filteredSurveys, setFilteredSurveys] = useState([]);
    const [tahunList, setTahunList] = useState([]);
    const [selectedTahun, setSelectedTahun] = useState("");
    const [error, setError] = useState("");
    const [exportError, setExportError] = useState("");
    const [isExporting, setIsExporting] = useState(false);

    useEffect(() => {
        api
            .get("/survey")
            .then((res) => {
                setSurveys(res.data);
                setFilteredSurveys(res.data);
            })
            .catch(() => setError("Gagal memuat data. Pastikan sudah login."));

        api.get("/survey/tahun-list")
            .then((res) => {
                setTahunList(res.data);
                if (res.data.length > 0) setSelectedTahun(res.data[0]);
            })
            .catch(() => {
                /* diamkan saja kalau gagal, dropdown akan kosong */
            });
    }, []);

    // Setiap tahun yang dipilih berubah, filter data yang ditampilkan di tabel
    useEffect(() => {
        if (!selectedTahun) {
            setFilteredSurveys(surveys);
            return;
        }
        setFilteredSurveys(surveys.filter((s) => String(s.tahun_lulus) === String(selectedTahun)));
    }, [selectedTahun, surveys]);

    const handleExportPdf = async () => {
        if (!selectedTahun) return;
        setExportError("");
        setIsExporting(true);

        try {
            // responseType 'blob' penting supaya axios tidak coba parse PDF sebagai JSON
            const res = await api.get(`/survey/export/${selectedTahun}`, {
                responseType: "blob",
            });

            // Bikin link download otomatis dari hasil blob PDF
            const url = window.URL.createObjectURL(new Blob([res.data]));
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute(
                "download",
                `laporan-tracer-study-${selectedTahun}.pdf`,
            );
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch (err) {
            setExportError(
                `Gagal export PDF untuk tahun ${selectedTahun}. Mungkin datanya kosong.`,
            );
        } finally {
            setIsExporting(false);
        }
    };

    const handleExportExcel = async () => {
        if (!selectedTahun) return;
        setExportError("");
        setIsExporting(true);

        try {
            const res = await api.get(`/survey/export-excel/${selectedTahun}`, {
                responseType: "blob",
            });

            const url = window.URL.createObjectURL(new Blob([res.data]));
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute(
                "download",
                `laporan-tracer-study-${selectedTahun}.xlsx`,
            );
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch (err) {
            setExportError(
                `Gagal export Excel untuk tahun ${selectedTahun}. Mungkin datanya kosong.`,
            );
        } finally {
            setIsExporting(false);
        }
    };

    if (error) return <div className='container msg-error'>{error}</div>;

    return (
        <div className='container' style={{ maxWidth: 1100 }}>
            <h1>Data Respons Survey</h1>

            <div
                className='card'
                style={{ display: "flex", gap: 12, alignItems: "flex-end" }}
            >
                <div style={{ flex: 1 }}>
                    <label>Export Laporan PDF Berdasarkan Tahun Lulus</label>
                    <select
                        value={selectedTahun}
                        onChange={(e) => setSelectedTahun(e.target.value)}
                    >
                        {tahunList.length === 0 && (
                            <option value=''>Belum ada data tahun</option>
                        )}
                        {tahunList.map((tahun) => (
                            <option key={tahun} value={tahun}>
                                {tahun}
                            </option>
                        ))}
                    </select>
                </div>
                <button
                    onClick={handleExportPdf}
                    disabled={!selectedTahun || isExporting}
                    style={{ marginTop: 0, whiteSpace: "nowrap" }}
                >
                    {isExporting ? "Membuat PDF..." : "Export ke PDF"}
                </button>
                <button
                    onClick={handleExportExcel}
                    disabled={!selectedTahun || isExporting}
                    style={{
                        marginTop: 0,
                        whiteSpace: "nowrap",
                        background: "#16a34a",
                    }}
                >
                    {isExporting ? "Membuat Excel..." : "Export ke Excel"}
                </button>
            </div>
            {exportError && <div className='msg-error'>{exportError}</div>}

            <div className='card' style={{ overflowX: "auto" }}>
                <table>
                    <thead>
                        <tr>
                            <th>Nama</th>
                            <th>Jurusan</th>
                            <th>Tahun Lulus</th>
                            <th>Status</th>
                            <th>Perusahaan/Kampus</th>
                            <th>Bidang Kerja</th>
                            <th>Jurusan Kampus</th>
                            <th>Relevansi</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredSurveys.map((s) => (
                            <tr key={s.id}>
                                <td>{s.nama}</td>
                                <td>{s.jurusan}</td>
                                <td>{s.tahun_lulus}</td>
                                <td>{s.status_saat_ini}</td>
                                <td>{s.nama_perusahaan || s.nama_kampus || "-"}</td>
                                <td>{s.bidang_kerja || "-"}</td>
                                <td>{s.jurusan_kampus || "-"}</td>
                                <td>{s.relevansi_jurusan || "-"}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {filteredSurveys.length === 0 && (
                    <p style={{ padding: "12px 0", color: "#6b7280" }}>
                        Data belum tersedia untuk tahun {selectedTahun || "ini"}.
                    </p>
                )}
            </div>
        </div>
    );
}
