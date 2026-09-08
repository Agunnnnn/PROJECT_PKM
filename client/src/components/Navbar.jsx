import { Link, useNavigate } from "react-router-dom";

export default function Navbar() {
    const navigate = useNavigate();
    const isLoggedIn = !!localStorage.getItem("token");

    const handleLogout = () => {
        localStorage.removeItem("token");
        navigate("/login");
    };

    return (
        <div className='navbar'>
            <div>
                <Link to='/'>Isi Survey</Link>
                {isLoggedIn && <Link to='/admin/dashboard'>Dashboard</Link>}
                {isLoggedIn && <Link to='/admin/data'>Data Survey</Link>}
            </div>
            <div>
                {isLoggedIn ? (
                    <button
                        onClick={handleLogout}
                        style={{ margin: 0, padding: "6px 14px" }}
                    >
                        Logout
                    </button>
                ) : (
                    <Link to='/login'>Login Admin</Link>
                )}
            </div>
        </div>
    );
}
