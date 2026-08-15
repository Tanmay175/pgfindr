import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { getMyBookings } from "../api/booking";
import { getFavorites } from "../api/favoriteReview";
import { useAuth } from "../context/AuthContext";

export default function StudentDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    try {
      const [{ data: bookingData }, { data: favData }] = await Promise.all([
        getMyBookings(),
        getFavorites(),
      ]);
      const bookings = bookingData.bookings;
      setStats({
        total: bookings.length,
        pending: bookings.filter((b) => b.status === "pending").length,
        approved: bookings.filter((b) => b.status === "approved").length,
        saved: favData.count,
      });
    } catch {
      toast.error("Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-5xl mx-auto py-10 px-6">
      <h1 className="font-heading text-2xl font-semibold mb-1">Welcome back, {user?.name}</h1>
      <p className="text-gray-500 mb-6">Here's what's happening with your PG search.</p>

      {loading ? (
        <div className="text-center py-16 text-gray-500">Loading...</div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-4">
            <p className="text-2xl font-heading font-semibold text-brand-blue">{stats.total}</p>
            <p className="text-xs text-gray-500 mt-1">Total Bookings</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-4">
            <p className="text-2xl font-heading font-semibold text-amber-600">{stats.pending}</p>
            <p className="text-xs text-gray-500 mt-1">Pending Requests</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-4">
            <p className="text-2xl font-heading font-semibold text-green-600">{stats.approved}</p>
            <p className="text-xs text-gray-500 mt-1">Approved Bookings</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-4">
            <p className="text-2xl font-heading font-semibold text-red-500">{stats.saved}</p>
            <p className="text-xs text-gray-500 mt-1">Saved PGs</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link to="/search" className="bg-white rounded-xl shadow-sm p-5 hover:shadow-md transition-shadow">
          <h3 className="font-heading font-semibold mb-1">Search PGs</h3>
          <p className="text-sm text-gray-500">Find your next place</p>
        </Link>
        <Link to="/student/bookings" className="bg-white rounded-xl shadow-sm p-5 hover:shadow-md transition-shadow">
          <h3 className="font-heading font-semibold mb-1">My Bookings</h3>
          <p className="text-sm text-gray-500">Track your requests</p>
        </Link>
        <Link to="/favorites" className="bg-white rounded-xl shadow-sm p-5 hover:shadow-md transition-shadow">
          <h3 className="font-heading font-semibold mb-1">Favorites</h3>
          <p className="text-sm text-gray-500">PGs you've saved</p>
        </Link>
      </div>
    </div>
  );
}
