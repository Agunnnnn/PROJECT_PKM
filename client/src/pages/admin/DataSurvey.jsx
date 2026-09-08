import { useEffect, useState } from "react";
import api from "../../api/axios";

export default function DataSurvey() {
  const [surveys, setSurveys] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get("/survey")
      .then((res) => setSurveys(res.data))
      .catch(() => setError("Gagal memuat data. Pastikan sudah login."));
  }, []);

  if (error) return <div className="container msg-error">{error}</div>;

  return (
    <div className="container" style={{ maxWidth: 1100 }}>
      <h1>Data Respons Survey</h1>
      <div className="card" style={{ overflowX: "auto" }}>
        <table>
          <thead>
            <tr>
              <th>Nama</th>
              <th>Jurusan</th>
              <th>Tahun Lulus</th>
              <th>Status</th>
              <th>Perusahaan/Kampus</th>
              <th>Relevansi</th>
            </tr>
          </thead>
          <tbody>
            {surveys.map((s) => (
              <tr key={s.id}>
                <td>{s.nama}</td>
                <td>{s.jurusan}</td>
                <td>{s.tahun_lulus}</td>
                <td>{s.status_saat_ini}</td>
                <td>{s.nama_perusahaan || s.nama_kampus || "-"}</td>
                <td>{s.relevansi_jurusan || "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {surveys.length === 0 && <p>Belum ada data.</p>}
      </div>
    </div>
  );
}
