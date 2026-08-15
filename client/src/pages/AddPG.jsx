import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { createPG, AMENITIES_LIST, ROOM_TYPES } from "../api/pg";

const emptyRoom = { type: "single", totalRooms: "", availableRooms: "", price: "" };

export default function AddPG() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const [basic, setBasic] = useState({ name: "", description: "", pgType: "boys", gender: "male" });
  const [location, setLocation] = useState({
    address: "", city: "", state: "", pincode: "", lat: "", lng: "", nearbyCollege: "", nearbyLandmark: "",
  });
  const [pricing, setPricing] = useState({
    securityDeposit: "", maintenanceCharge: "", electricityCharge: "", waterCharge: "", otherCharges: "",
  });
  const [rooms, setRooms] = useState([{ ...emptyRoom }]);
  const [amenities, setAmenities] = useState([]);
  const [rules, setRules] = useState({
    foodAvailable: false, smokingAllowed: false, alcoholAllowed: false, petsAllowed: false,
    visitorsAllowed: true, curfewTime: "", noticePeriodDays: "", minimumStayMonths: 1, otherRules: "",
  });
  const [images, setImages] = useState([]);

  function toggleAmenity(a) {
    setAmenities((prev) => (prev.includes(a) ? prev.filter((x) => x !== a) : [...prev, a]));
  }

  function updateRoom(i, field, value) {
    setRooms((prev) => prev.map((r, idx) => (idx === i ? { ...r, [field]: value } : r)));
  }

  function addRoomRow() {
    setRooms((prev) => [...prev, { ...emptyRoom }]);
  }

  function removeRoomRow(i) {
    setRooms((prev) => prev.filter((_, idx) => idx !== i));
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (rooms.length === 0) {
      toast.error("Add at least one room type");
      return;
    }
    for (const r of rooms) {
      if (Number(r.availableRooms) > Number(r.totalRooms)) {
        toast.error("Available rooms can't exceed total rooms");
        return;
      }
    }

    setLoading(true);
    try {
      const fd = new FormData();
      Object.entries(basic).forEach(([k, v]) => fd.append(k, v));
      fd.append("location", JSON.stringify(location));
      fd.append("pricing", JSON.stringify(pricing));
      fd.append("rooms", JSON.stringify(rooms.map((r) => ({
        type: r.type,
        totalRooms: Number(r.totalRooms),
        availableRooms: Number(r.availableRooms),
        price: Number(r.price),
      }))));
      fd.append("amenities", JSON.stringify(amenities));
      fd.append("rules", JSON.stringify(rules));
      images.forEach((img) => fd.append("images", img));

      await createPG(fd);
      toast.success("PG added successfully");
      navigate("/owner/pgs");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to add PG");
    } finally {
      setLoading(false);
    }
  }

  const inputClass = "w-full border rounded-md p-2.5 text-sm";
  const labelClass = "block text-sm font-medium text-gray-700 mb-1";

  return (
    <div className="max-w-3xl mx-auto py-10 px-6">
      <h1 className="font-heading text-2xl font-semibold mb-6">Add a New PG</h1>

      <form onSubmit={handleSubmit} className="space-y-8">
        <section className="bg-white rounded-xl shadow-sm p-6 space-y-4">
          <h2 className="font-heading font-semibold text-lg">Basic Information</h2>
          <div>
            <label className={labelClass}>PG Name</label>
            <input required className={inputClass} value={basic.name}
              onChange={(e) => setBasic({ ...basic, name: e.target.value })} />
          </div>
          <div>
            <label className={labelClass}>Description</label>
            <textarea rows={3} className={inputClass} value={basic.description}
              onChange={(e) => setBasic({ ...basic, description: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>PG Type</label>
              <select className={inputClass} value={basic.pgType}
                onChange={(e) => setBasic({ ...basic, pgType: e.target.value })}>
                <option value="boys">Boys PG</option>
                <option value="girls">Girls PG</option>
                <option value="coed">Co-ed</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>Gender</label>
              <select className={inputClass} value={basic.gender}
                onChange={(e) => setBasic({ ...basic, gender: e.target.value })}>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="any">Any</option>
              </select>
            </div>
          </div>
        </section>

        <section className="bg-white rounded-xl shadow-sm p-6 space-y-4">
          <h2 className="font-heading font-semibold text-lg">Location</h2>
          <input required placeholder="Address" className={inputClass} value={location.address}
            onChange={(e) => setLocation({ ...location, address: e.target.value })} />
          <div className="grid grid-cols-3 gap-4">
            <input required placeholder="City" className={inputClass} value={location.city}
              onChange={(e) => setLocation({ ...location, city: e.target.value })} />
            <input placeholder="State" className={inputClass} value={location.state}
              onChange={(e) => setLocation({ ...location, state: e.target.value })} />
            <input placeholder="Pincode" className={inputClass} value={location.pincode}
              onChange={(e) => setLocation({ ...location, pincode: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <input placeholder="Nearby college/university" className={inputClass} value={location.nearbyCollege}
              onChange={(e) => setLocation({ ...location, nearbyCollege: e.target.value })} />
            <input placeholder="Nearby landmark" className={inputClass} value={location.nearbyLandmark}
              onChange={(e) => setLocation({ ...location, nearbyLandmark: e.target.value })} />
          </div>
        </section>

        <section className="bg-white rounded-xl shadow-sm p-6 space-y-4">
          <h2 className="font-heading font-semibold text-lg">Additional Charges</h2>
          <div className="grid grid-cols-2 gap-4">
            {Object.keys(pricing).map((key) => (
              <div key={key}>
                <label className={labelClass}>{key.replace(/([A-Z])/g, " $1")}</label>
                <input type="number" min="0" className={inputClass} value={pricing[key]}
                  onChange={(e) => setPricing({ ...pricing, [key]: e.target.value })} />
              </div>
            ))}
          </div>
        </section>

        <section className="bg-white rounded-xl shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-heading font-semibold text-lg">Room Types & Pricing</h2>
            <button type="button" onClick={addRoomRow} className="text-brand-blue text-sm font-medium">
              + Add room type
            </button>
          </div>
          {rooms.map((room, i) => (
            <div key={i} className="grid grid-cols-5 gap-3 items-end border-t pt-4 first:border-t-0 first:pt-0">
              <div>
                <label className={labelClass}>Type</label>
                <select className={inputClass} value={room.type}
                  onChange={(e) => updateRoom(i, "type", e.target.value)}>
                  {ROOM_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </div>
              <div>
                <label className={labelClass}>Total Rooms</label>
                <input required type="number" min="0" className={inputClass} value={room.totalRooms}
                  onChange={(e) => updateRoom(i, "totalRooms", e.target.value)} />
              </div>
              <div>
                <label className={labelClass}>Available</label>
                <input required type="number" min="0" className={inputClass} value={room.availableRooms}
                  onChange={(e) => updateRoom(i, "availableRooms", e.target.value)} />
              </div>
              <div>
                <label className={labelClass}>Price (₹/mo)</label>
                <input required type="number" min="0" className={inputClass} value={room.price}
                  onChange={(e) => updateRoom(i, "price", e.target.value)} />
              </div>
              {rooms.length > 1 && (
                <button type="button" onClick={() => removeRoomRow(i)}
                  className="text-red-500 text-sm h-10">Remove</button>
              )}
            </div>
          ))}
        </section>

        <section className="bg-white rounded-xl shadow-sm p-6 space-y-4">
          <h2 className="font-heading font-semibold text-lg">Amenities</h2>
          <div className="grid grid-cols-3 gap-2">
            {AMENITIES_LIST.map((a) => (
              <label key={a} className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={amenities.includes(a)} onChange={() => toggleAmenity(a)} />
                {a}
              </label>
            ))}
          </div>
        </section>

        <section className="bg-white rounded-xl shadow-sm p-6 space-y-4">
          <h2 className="font-heading font-semibold text-lg">PG Rules</h2>
          <div className="grid grid-cols-2 gap-3">
            {["foodAvailable", "smokingAllowed", "alcoholAllowed", "petsAllowed", "visitorsAllowed"].map((key) => (
              <label key={key} className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={rules[key]}
                  onChange={(e) => setRules({ ...rules, [key]: e.target.checked })} />
                {key.replace(/([A-Z])/g, " $1")}
              </label>
            ))}
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className={labelClass}>Curfew Time</label>
              <input placeholder="e.g. 10:00 PM" className={inputClass} value={rules.curfewTime}
                onChange={(e) => setRules({ ...rules, curfewTime: e.target.value })} />
            </div>
            <div>
              <label className={labelClass}>Notice Period (days)</label>
              <input type="number" min="0" className={inputClass} value={rules.noticePeriodDays}
                onChange={(e) => setRules({ ...rules, noticePeriodDays: e.target.value })} />
            </div>
            <div>
              <label className={labelClass}>Minimum Stay (months)</label>
              <input type="number" min="1" className={inputClass} value={rules.minimumStayMonths}
                onChange={(e) => setRules({ ...rules, minimumStayMonths: e.target.value })} />
            </div>
          </div>
          <div>
            <label className={labelClass}>Other Rules</label>
            <textarea rows={2} className={inputClass} value={rules.otherRules}
              onChange={(e) => setRules({ ...rules, otherRules: e.target.value })} />
          </div>
        </section>

        <section className="bg-white rounded-xl shadow-sm p-6 space-y-4">
          <h2 className="font-heading font-semibold text-lg">PG Photos</h2>
          <input type="file" multiple accept="image/jpeg,image/png,image/webp"
            onChange={(e) => setImages(Array.from(e.target.files))} />
          {images.length > 0 && (
            <div className="grid grid-cols-4 gap-3 mt-3">
              {images.map((img, i) => (
                <img key={i} src={URL.createObjectURL(img)} alt="" className="h-24 w-full object-cover rounded-md" />
              ))}
            </div>
          )}
          <p className="text-xs text-gray-500">First photo will be used as the cover image. JPG/PNG/WEBP, up to 5MB each.</p>
        </section>

        <button disabled={loading} type="submit"
          className="w-full bg-brand-green text-white py-3 rounded-md font-medium disabled:opacity-60">
          {loading ? "Publishing..." : "Publish PG"}
        </button>
      </form>
    </div>
  );
}
