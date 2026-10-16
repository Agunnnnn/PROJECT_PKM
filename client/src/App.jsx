import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  Outlet,
} from "react-router-dom";
import Navbar from "./components/Navbar";
import AdminNavbar from "./pages/admin/AdminNavbar";
import Footer from "./components/Footer";
import Beranda from "./pages/Beranda";
import Tentang from "./pages/Tentang";
import Sambutan from "./pages/Sambutan";
import Panduan from "./pages/Panduan";
import Faq from "./pages/Faq";
import FormSurvey from "./pages/FormSurvey";
import Login from "./pages/Login";
import Dashboard from "./pages/admin/Dashboard";
import DataSurvey from "./pages/admin/DataSurvey";

// Kalau belum ada token, lempar ke halaman login
function PrivateRoute({ children }) {
  const token = localStorage.getItem("token");
  return token ? children : <Navigate to="/login" />;
}

// Layout halaman publik: Navbar biasa + Footer
function PublicLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

// Layout halaman admin: AdminNavbar, tanpa Footer, dijaga PrivateRoute
function AdminLayout() {
  return (
    <PrivateRoute>
      <div className="min-h-screen bg-[#f3f7fc]">
        <AdminNavbar />
        <main className="mx-auto max-w-7xl px-5 py-8 lg:px-10">
          <Outlet />
        </main>
      </div>
    </PrivateRoute>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Publik */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Beranda />} />
          <Route path="/tentang" element={<Tentang />} />
          <Route path="/sambutan" element={<Sambutan />} />
          <Route path="/panduan" element={<Panduan />} />
          <Route path="/faq" element={<Faq />} />
          <Route path="/survey" element={<FormSurvey />} />
          <Route path="/login" element={<Login />} />
        </Route>

        {/* Admin */}
        <Route element={<AdminLayout />}>
          <Route path="/admin/dashboard" element={<Dashboard />} />
          <Route path="/admin/data" element={<DataSurvey />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
