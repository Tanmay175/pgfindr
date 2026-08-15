import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { getMyBookings, cancelBooking } from "../api/booking";

const ROOM_LABELS = { single: "Single Room", double: "Double Sharing", triple: "Triple Sharing", four_sharing: "4 Sharing" };

const STATUS_STYLES = {
  pending: "bg-amber-100 text-amber-700",
  approved: "bg-green-100 text-green-700",
  rejected: "bg-red-100 text-red-700",
  cancelled: "bg-gray-100 text-gray-600",
  completed: "bg-blue-100 text-blue-700",
};

export default function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    try {
      const { data } = await getMyBookings();
      setBookings(data.bookings);
    } catch {
      toast.error("Failed to load your bookings");
    } finally {
      setLoading(false);
    }
  }

  async function handleCancel(id) {
    if (!window.confirm("Cancel this booking request?")) return;
    try {
      await cancelBooking(id);
      toast.success("Booking cancelled");
      setBookings((prev) => prev.map((b) => (b._id === id ? { ...b, status: "cancelled" } : b)));
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to cancel booking");
    }
  }

  if (loading) return <div className="text-center py-16 text-gray-500">Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto py-10 px-6">
      <h1 className="font-heading text-2xl font-semibold mb-6">My Bookings</h1>

      {bookings.length === 0 ? (
        <div className="text-center py-16 text-gray-500 bg-white rounded-xl shadow-sm">
          <p className="mb-3">No bookings yet.</p>
          <Link to="/search" className="text-brand-blue font-medium">Browse PGs</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map((b) => {
            const cover = b.pg?.images?.find((i) => i.isCover) || b.pg?.images?.[0];
            return (
              <div key={b._id} className="bg-white rounded-xl shadow-sm p-4 flex gap-4 items-center">
                <img
                  src={cover?.url || "https://placehold.co/100x80?text=PG"}
                  alt={b.pg?.name}
                  className="w-24 h-18 object-cover rounded-md flex-shrink-0"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">{b.pg?.name || "PG"}</h3>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_STYLES[b.status]}`}>
                      {b.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500">{ROOM_LABELS[b.roomType]}</p>
                  <p className="text-sm text-gray-600">
                    Move-in: {new Date(b.moveInDate).toLocaleDateString()} · {b.stayDurationMonths} month(s)
                  </p>
                  <p className="text-xs text-gray-400">Requested {new Date(b.createdAt).toLocaleDateString()}</p>
                </div>
                {["pending", "approved"].includes(b.status) && (
                  <button onClick={() => handleCancel(b._id)} className="text-red-500 text-sm whitespace-nowrap">
                    Cancel
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
