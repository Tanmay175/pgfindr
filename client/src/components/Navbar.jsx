import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    toast.success("Logged out");
    navigate("/");
  }

  return (
    <header className="bg-white shadow-sm sticky top-0 z-40">
      <nav className="max-w-6xl mx-auto flex items-center justify-between px-6 py-4">
        <Link to="/" className="font-heading text-2xl font-semibold">
          <span className="text-brand-green">PG</span>
          <span className="text-brand-blue">Findr</span>
        </Link>

        <ul className="flex items-center gap-6 text-sm font-medium text-gray-700">
          {!user && (
            <>
              <li><Link to="/search">Search PG</Link></li>
              <li><Link to="/login">Login</Link></li>
              <li>
                <Link to="/register" className="bg-brand-green text-white px-4 py-2 rounded-md">
                  Register
                </Link>
              </li>
            </>
          )}

          {user?.role === "student" && (
            <>
              <li><Link to="/search">Search</Link></li>
              <li><Link to="/favorites">Favorites</Link></li>
              <li><Link to="/student/bookings">My Bookings</Link></li>
              <li><Link to="/student/dashboard">Dashboard</Link></li>
              <li><Link to="/profile">Profile</Link></li>
              <li><button onClick={handleLogout}>Logout</button></li>
            </>
          )}

          {user?.role === "owner" && (
            <>
              <li><Link to="/owner/dashboard">Dashboard</Link></li>
              <li><Link to="/owner/pgs">My PGs</Link></li>
              <li><Link to="/owner/pgs/new">Add PG</Link></li>
              <li><Link to="/owner/bookings">Booking Requests</Link></li>
              <li><Link to="/profile">Profile</Link></li>
              <li><button onClick={handleLogout}>Logout</button></li>
            </>
          )}
        </ul>
      </nav>
    </header>
  );
}
