import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Beranda from "./pages/Beranda";
import FormSurvey from "./pages/FormSurvey";
import Login from "./pages/Login";
import Dashboard from "./pages/admin/Dashboard";
import DataSurvey from "./pages/admin/DataSurvey";
import Tentang from "./pages/Tentang";

// Route sederhana: kalau belum ada token, lempar ke halaman login
function PrivateRoute({ children }) {
  const token = localStorage.getItem("token");
  return token ? children : <Navigate to="/login" />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<Beranda />} />
        <Route path="/tentang" element={<Tentang />} />
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
      <Footer />
    </BrowserRouter>
  );
}
