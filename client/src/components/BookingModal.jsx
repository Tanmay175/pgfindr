import { useState } from "react";
import toast from "react-hot-toast";
import { createBooking } from "../api/booking";

const ROOM_LABELS = { single: "Single Room", double: "Double Sharing", triple: "Triple Sharing", four_sharing: "4 Sharing" };

export default function BookingModal({ pg, onClose }) {
  const [roomId, setRoomId] = useState(pg.rooms.find((r) => r.availableRooms > 0)?._id || "");
  const [moveInDate, setMoveInDate] = useState("");
  const [stayDurationMonths, setStayDurationMonths] = useState(1);
  const [occupants, setOccupants] = useState(1);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const today = new Date().toISOString().split("T")[0];

  async function handleSubmit(e) {
    e.preventDefault();
    if (!roomId) {
      toast.error("Select a room type");
      return;
    }
    setLoading(true);
    try {
      await createBooking({
        pgId: pg._id,
        roomId,
        moveInDate,
        stayDurationMonths,
        occupants,
        message,
      });
      toast.success("Booking request sent");
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to send booking request");
    } finally {
      setLoading(false);
    }
  }

  const inputClass = "w-full border rounded-md p-2.5 text-sm";
  const labelClass = "block text-sm font-medium text-gray-700 mb-1";

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-xl max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-heading text-lg font-semibold">Request a Booking</h2>
          <button onClick={onClose} className="text-gray-400 text-xl leading-none">&times;</button>
        </div>
        <p className="text-sm text-gray-500 mb-4">{pg.name}</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className={labelClass}>Room Type</label>
            <select required className={inputClass} value={roomId} onChange={(e) => setRoomId(e.target.value)}>
              {pg.rooms.map((r) => (
                <option key={r._id} value={r._id} disabled={r.availableRooms <= 0}>
                  {ROOM_LABELS[r.type]} — ₹{r.price}/mo {r.availableRooms <= 0 ? "(Fully Booked)" : `(${r.availableRooms} available)`}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Move-in Date</label>
              <input required type="date" min={today} className={inputClass} value={moveInDate}
                onChange={(e) => setMoveInDate(e.target.value)} />
            </div>
            <div>
              <label className={labelClass}>Duration (months)</label>
              <input required type="number" min="1" className={inputClass} value={stayDurationMonths}
                onChange={(e) => setStayDurationMonths(e.target.value)} />
            </div>
          </div>

          <div>
            <label className={labelClass}>Number of Occupants</label>
            <input type="number" min="1" className={inputClass} value={occupants}
              onChange={(e) => setOccupants(e.target.value)} />
          </div>

          <div>
            <label className={labelClass}>Message to Owner (optional)</label>
            <textarea rows={3} className={inputClass} value={message} onChange={(e) => setMessage(e.target.value)} />
          </div>

          <button disabled={loading} type="submit"
            className="w-full bg-brand-green text-white py-2.5 rounded-md font-medium disabled:opacity-60">
            {loading ? "Sending..." : "Send Booking Request"}
          </button>
        </form>
      </div>
    </div>
  );
}
