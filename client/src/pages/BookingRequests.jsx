import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { getOwnerBookings, approveBooking, rejectBooking } from "../api/ownerBooking";

const ROOM_LABELS = { single: "Single Room", double: "Double Sharing", triple: "Triple Sharing", four_sharing: "4 Sharing" };

const STATUS_STYLES = {
  pending: "bg-amber-100 text-amber-700",
  approved: "bg-green-100 text-green-700",
  rejected: "bg-red-100 text-red-700",
  cancelled: "bg-gray-100 text-gray-600",
  completed: "bg-blue-100 text-blue-700",
};

const TABS = ["pending", "approved", "rejected", "cancelled", "all"];

export default function BookingRequests() {
  const [tab, setTab] = useState("pending");
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actingOn, setActingOn] = useState(null);

  useEffect(() => {
    load();
  }, [tab]);

  async function load() {
    setLoading(true);
    try {
      const { data } = await getOwnerBookings(tab === "all" ? undefined : tab);
      setBookings(data.bookings);
    } catch {
      toast.error("Failed to load booking requests");
    } finally {
      setLoading(false);
    }
  }

  async function handleApprove(id) {
    setActingOn(id);
    try {
      await approveBooking(id);
      toast.success("Booking approved");
      if (tab === "pending") {
        setBookings((prev) => prev.filter((b) => b._id !== id));
      } else {
        setBookings((prev) => prev.map((b) => (b._id === id ? { ...b, status: "approved" } : b)));
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to approve booking");
    } finally {
      setActingOn(null);
    }
  }

  async function handleReject(id) {
    if (!window.confirm("Reject this booking request?")) return;
    setActingOn(id);
    try {
      await rejectBooking(id);
      toast.success("Booking rejected");
      if (tab === "pending") setBookings((prev) => prev.filter((b) => b._id !== id));
      else setBookings((prev) => prev.map((b) => (b._id === id ? { ...b, status: "rejected" } : b)));
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to reject booking");
    } finally {
      setActingOn(null);
    }
  }

  return (
    <div className="max-w-4xl mx-auto py-10 px-6">
      <h1 className="font-heading text-2xl font-semibold mb-4">Booking Requests</h1>

      <div className="flex gap-2 mb-6 border-b">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-3 py-2 text-sm font-medium capitalize border-b-2 -mb-px ${
              tab === t ? "border-brand-blue text-brand-blue" : "border-transparent text-gray-500"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-16 text-gray-500">Loading...</div>
      ) : bookings.length === 0 ? (
        <div className="text-center py-16 text-gray-500 bg-white rounded-xl shadow-sm">
          No {tab !== "all" ? tab : ""} booking requests.
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map((b) => (
            <div key={b._id} className="bg-white rounded-xl shadow-sm p-4">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">{b.student?.name}</h3>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_STYLES[b.status]}`}>{b.status}</span>
                  </div>
                  <p className="text-sm text-gray-500">{b.student?.phone} · {b.student?.email}</p>
                  <p className="text-sm text-gray-700 mt-1">{b.pg?.name} — {ROOM_LABELS[b.roomType]}</p>
                  <p className="text-sm text-gray-600">
                    Move-in: {new Date(b.moveInDate).toLocaleDateString()} · {b.stayDurationMonths} month(s) · {b.occupants} occupant(s)
                  </p>
                  {b.message && <p className="text-sm text-gray-500 italic mt-1">"{b.message}"</p>}
                  <p className="text-xs text-gray-400 mt-1">Requested {new Date(b.createdAt).toLocaleDateString()}</p>
                </div>

                {b.status === "pending" && (
                  <div className="flex gap-2 flex-shrink-0">
                    <button
                      disabled={actingOn === b._id}
                      onClick={() => handleApprove(b._id)}
                      className="bg-brand-green text-white text-sm px-3 py-1.5 rounded-md disabled:opacity-60"
                    >
                      Accept
                    </button>
                    <button
                      disabled={actingOn === b._id}
                      onClick={() => handleReject(b._id)}
                      className="border text-sm px-3 py-1.5 rounded-md disabled:opacity-60"
                    >
                      Reject
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
