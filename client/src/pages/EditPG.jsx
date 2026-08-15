import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { getPGById, updatePG, deletePGImage, setCoverImage, AMENITIES_LIST, ROOM_TYPES } from "../api/pg";

export default function EditPG() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [basic, setBasic] = useState(null);
  const [location, setLocation] = useState(null);
  const [pricing, setPricing] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [amenities, setAmenities] = useState([]);
  const [rules, setRules] = useState(null);
  const [status, setStatus] = useState("active");
  const [existingImages, setExistingImages] = useState([]);
  const [newImages, setNewImages] = useState([]);

  useEffect(() => {
    load();
  }, [id]);

  async function load() {
    setLoading(true);
    try {
      const { data } = await getPGById(id);
      const pg = data.pg;
      setBasic({ name: pg.name, description: pg.description || "", pgType: pg.pgType, gender: pg.gender });
      setLocation(pg.location);
      setPricing(pg.pricing);
      setRooms(pg.rooms.map((r) => ({ ...r, id: r._id })));
      setAmenities(pg.amenities);
      setRules(pg.rules);
      setStatus(pg.status);
      setExistingImages(pg.images);
    } catch {
      toast.error("Failed to load PG");
      navigate("/owner/pgs");
    } finally {
      setLoading(false);
    }
  }

  function toggleAmenity(a) {
    setAmenities((prev) => (prev.includes(a) ? prev.filter((x) => x !== a) : [...prev, a]));
  }

  function updateRoom(i, field, value) {
    setRooms((prev) => prev.map((r, idx) => (idx === i ? { ...r, [field]: value } : r)));
  }

  function addRoomRow() {
    setRooms((prev) => [...prev, { type: "single", totalRooms: "", availableRooms: "", price: "" }]);
  }

  function removeRoomRow(i) {
    setRooms((prev) => prev.filter((_, idx) => idx !== i));
  }

  async function handleDeleteImage(imageId) {
    if (!window.confirm("Delete this photo?")) return;
    try {
      await deletePGImage(id, imageId);
      setExistingImages((prev) => prev.filter((img) => img._id !== imageId));
      toast.success("Photo deleted");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete photo");
    }
  }

  async function handleSetCover(imageId) {
    try {
      await setCoverImage(id, imageId);
      setExistingImages((prev) => prev.map((img) => ({ ...img, isCover: img._id === imageId })));
      toast.success("Cover photo updated");
    } catch {
      toast.error("Failed to update cover photo");
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    for (const r of rooms) {
      if (Number(r.availableRooms) > Number(r.totalRooms)) {
        toast.error("Available rooms can't exceed total rooms");
        return;
      }
    }

    setSaving(true);
    try {
      const fd = new FormData();
      Object.entries(basic).forEach(([k, v]) => fd.append(k, v));
      fd.append("status", status);
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
      newImages.forEach((img) => fd.append("images", img));

      await updatePG(id, fd);
      toast.success("PG updated successfully");
      navigate("/owner/pgs");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update PG");
    } finally {
      setSaving(false);
    }
  }

  if (loading || !basic) return <div className="text-center py-16 text-gray-500">Loading...</div>;

  const inputClass = "w-full border rounded-md p-2.5 text-sm";
  const labelClass = "block text-sm font-medium text-gray-700 mb-1";

  return (
    <div className="max-w-3xl mx-auto py-10 px-6">
      <h1 className="font-heading text-2xl font-semibold mb-6">Edit PG</h1>

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
          <div className="grid grid-cols-3 gap-4">
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
            <div>
              <label className={labelClass}>Status</label>
              <select className={inputClass} value={status} onChange={(e) => setStatus(e.target.value)}>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
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
            <input placeholder="State" className={inputClass} value={location.state || ""}
              onChange={(e) => setLocation({ ...location, state: e.target.value })} />
            <input placeholder="Pincode" className={inputClass} value={location.pincode || ""}
              onChange={(e) => setLocation({ ...location, pincode: e.target.value })} />
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
            <div key={room.id || i} className="grid grid-cols-5 gap-3 items-end border-t pt-4 first:border-t-0 first:pt-0">
              <div>
                <label className={labelClass}>Type</label>
                <select className={inputClass} value={room.type} onChange={(e) => updateRoom(i, "type", e.target.value)}>
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
                <button type="button" onClick={() => removeRoomRow(i)} className="text-red-500 text-sm h-10">Remove</button>
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
          <h2 className="font-heading font-semibold text-lg">Current Photos</h2>
          {existingImages.length === 0 ? (
            <p className="text-sm text-gray-500">No photos yet.</p>
          ) : (
            <div className="grid grid-cols-4 gap-3">
              {existingImages.map((img) => (
                <div key={img._id} className="relative">
                  <img src={img.url} alt="" className="h-24 w-full object-cover rounded-md" />
                  {img.isCover && (
                    <span className="absolute top-1 left-1 bg-brand-green text-white text-[10px] px-1.5 py-0.5 rounded">Cover</span>
                  )}
                  <div className="flex gap-1 mt-1">
                    {!img.isCover && (
                      <button type="button" onClick={() => handleSetCover(img._id)} className="text-xs text-brand-blue">
                        Set cover
                      </button>
                    )}
                    <button type="button" onClick={() => handleDeleteImage(img._id)} className="text-xs text-red-500 ml-auto">
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div>
            <label className={labelClass}>Add More Photos</label>
            <input type="file" multiple accept="image/jpeg,image/png,image/webp"
              onChange={(e) => setNewImages(Array.from(e.target.files))} />
          </div>
        </section>

        <button disabled={saving} type="submit"
          className="w-full bg-brand-green text-white py-3 rounded-md font-medium disabled:opacity-60">
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </form>
    </div>
  );
}
