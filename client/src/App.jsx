import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Beranda from "./pages/Beranda";
import Tentang from "./pages/Tentang";
import Panduan from "./pages/Panduan";
import FormSurvey from "./pages/FormSurvey";
import Login from "./pages/Login";
import Dashboard from "./pages/admin/Dashboard";
import DataSurvey from "./pages/admin/DataSurvey";

// Route sederhana: kalau belum ada token, lempar ke halaman login
function PrivateRoute({ children }) {
  const token = localStorage.getItem("token");
  return token ? children : <Navigate to="/login" />;
}

export default function App() {
  return (
    <BrowserRouter>
      {/* flex-col + min-h-screen + flex-1: footer selalu menempel di dasar layar */}
      <div className="flex min-h-screen flex-col">
        <Navbar />

        <div className="flex-1">
          <Routes>
            <Route path="/" element={<Beranda />} />
            <Route path="/tentang" element={<Tentang />} />
            <Route path="/panduan" element={<Panduan />} />
            <Route path="/survey" element={<FormSurvey />} />
            <Route path="/login" element={<Login />} />
            <Route
              path="/admin/dashboard"
              element={
                <PrivateRoute>
                  <Dashboard />
                </PrivateRoute>
              }
            />
            <Route
              path="/admin/data"
              element={
                <PrivateRoute>
                  <DataSurvey />
                </PrivateRoute>
              }
            />
          </Routes>
        </div>

        <Footer />
      </div>
    </BrowserRouter>
  );
}