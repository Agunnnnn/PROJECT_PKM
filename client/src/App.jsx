import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import FormSurvey from "./pages/FormSurvey";
import Login from "./pages/Login";
import Dashboard from "./pages/admin/Dashboard";
import DataSurvey from "./pages/admin/DataSurvey";

// Route sederhana: kalau belum ada token, lempar ke halaman login
function PrivateRoute({ children }) {
    const token = localStorage.getItem("token");
    return token ? children : <Navigate to='/login' />;
}

export default function App() {
    return (
        <BrowserRouter>
            <Navbar />
            <Routes>
                <Route path='/' element={<FormSurvey />} />
                <Route path='/login' element={<Login />} />
                <Route
                    path='/admin/dashboard'
                    element={
                        <PrivateRoute>
                            <Dashboard />
                        </PrivateRoute>
                    }
                />
                <Route
                    path='/admin/data'
                    element={
                        <PrivateRoute>
                            <DataSurvey />
                        </PrivateRoute>
                    }
                />
            </Routes>
        </BrowserRouter>
    );
}
