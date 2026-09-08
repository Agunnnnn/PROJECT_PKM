import { useEffect, useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import api from "../../api/axios";

const COLORS = ["#2563eb", "#22c55e", "#f59e0b", "#ef4444"];

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get("/survey/stats")
      .then((res) => setStats(res.data))
      .catch(() => setError("Gagal memuat data. Pastikan sudah login."));
  }, []);

  if (error) return <div className="container msg-error">{error}</div>;
  if (!stats) return <div className="container">Memuat data...</div>;

  const statusData = stats.statusCount.map((s) => ({
    name: s.status,
    jumlah: s.jumlah,
  }));

  const relevansiData = stats.relevansiCount
    .filter((r) => r.relevansi)
    .map((r) => ({ name: r.relevansi, jumlah: r.jumlah }));

  return (
    <div className="container">
      <h1>Dashboard Tracer Study</h1>

      <div className="stats-grid">
        <div className="stat-box">
          <h3>{stats.totalAlumni}</h3>
          <p>Total Alumni Terdaftar</p>
        </div>
        <div className="stat-box">
          <h3>{stats.totalSurvey}</h3>
          <p>Total Respons Survey</p>
        </div>
      </div>

      <div className="card">
        <h2>Status Alumni Saat Ini</h2>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={statusData}
              dataKey="jumlah"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={100}
              label
            >
              {statusData.map((entry, index) => (
                <Cell key={index} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="card">
        <h2>Kesesuaian Pekerjaan dengan Jurusan</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={relevansiData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Bar dataKey="jumlah" fill="#2563eb" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
