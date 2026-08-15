import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { getOwnerStats } from "../api/pg";
import { useAuth } from "../context/AuthContext";

const CARDS = [
  { key: "totalPGs", label: "Total PGs" },
  { key: "totalRooms", label: "Total Rooms" },
  { key: "availableRooms", label: "Available Rooms" },
  { key: "pendingRequests", label: "Pending Requests" },
  { key: "approvedBookings", label: "Approved Bookings" },
  { key: "totalReviews", label: "Total Reviews" },
  { key: "averageRating", label: "Average Rating" },
];

export default function OwnerDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    try {
      const { data } = await getOwnerStats();
      setStats(data.stats);
    } catch {
      toast.error("Failed to load dashboard stats");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-5xl mx-auto py-10 px-6">
      <h1 className="font-heading text-2xl font-semibold mb-1">Welcome back, {user?.name}</h1>
      <p className="text-gray-500 mb-6">Here's how your listings are doing.</p>

      {loading ? (
        <div className="text-center py-16 text-gray-500">Loading...</div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {CARDS.map((c) => (
            <div key={c.key} className="bg-white rounded-xl shadow-sm p-4">
              <p className="text-2xl font-heading font-semibold text-brand-blue">
                {c.key === "averageRating" ? (stats[c.key] > 0 ? `★ ${stats[c.key]}` : "—") : stats[c.key]}
              </p>
              <p className="text-xs text-gray-500 mt-1">{c.label}</p>
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link to="/owner/pgs" className="bg-white rounded-xl shadow-sm p-5 hover:shadow-md transition-shadow">
          <h3 className="font-heading font-semibold mb-1">My PGs</h3>
          <p className="text-sm text-gray-500">View and manage your listings</p>
        </Link>
        <Link to="/owner/pgs/new" className="bg-white rounded-xl shadow-sm p-5 hover:shadow-md transition-shadow">
          <h3 className="font-heading font-semibold mb-1">Add PG</h3>
          <p className="text-sm text-gray-500">Publish a new listing</p>
        </Link>
        <Link to="/owner/bookings" className="bg-white rounded-xl shadow-sm p-5 hover:shadow-md transition-shadow">
          <h3 className="font-heading font-semibold mb-1">Booking Requests</h3>
          <p className="text-sm text-gray-500">
            {stats?.pendingRequests > 0 ? `${stats.pendingRequests} pending` : "No pending requests"}
          </p>
        </Link>
      </div>
    </div>
  );
}
