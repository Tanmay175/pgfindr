import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import toast from "react-hot-toast";
import { getPGById } from "../api/pg";
import { useAuth } from "../context/AuthContext";

const ROOM_LABELS = { single: "Single Room", double: "Double Sharing", triple: "Triple Sharing", four_sharing: "4 Sharing" };

export default function PGDetails() {
  const { id } = useParams();
  const { user } = useAuth();
  const [pg, setPg] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);

  useEffect(() => {
    load();
  }, [id]);

  async function load() {
    setLoading(true);
    try {
      const { data } = await getPGById(id);
      setPg(data.pg);
    } catch {
      toast.error("Could not load this PG");
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <div className="text-center py-16 text-gray-500">Loading...</div>;
  if (!pg) return <div className="text-center py-16 text-gray-500">PG not found.</div>;

  const totalAvailable = pg.rooms.reduce((s, r) => s + r.availableRooms, 0);
  const minPrice = pg.rooms.length ? Math.min(...pg.rooms.map((r) => r.price)) : 0;

  return (
    <div className="max-w-5xl mx-auto py-8 px-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="font-heading text-3xl font-semibold">{pg.name}</h1>
        <p className="text-gray-500">{pg.location.address}, {pg.location.city}</p>
        <div className="flex items-center gap-3 mt-2">
          <span className="text-brand-blue font-semibold text-lg">₹{minPrice}/mo</span>
          {pg.rating?.count > 0 && (
            <span className="text-sm text-amber-600">★ {pg.rating.average.toFixed(1)} ({pg.rating.count} reviews)</span>
          )}
          <span className={`text-xs px-2 py-0.5 rounded-full ${totalAvailable > 0 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
            {totalAvailable > 0 ? `${totalAvailable} rooms available` : "Fully Booked"}
          </span>
        </div>
      </div>

      {/* Image gallery */}
      {pg.images.length > 0 ? (
        <div className="mb-8">
          <img src={pg.images[activeImage].url} alt={pg.name} className="w-full h-80 object-cover rounded-xl" />
          {pg.images.length > 1 && (
            <div className="flex gap-2 mt-2 overflow-x-auto">
              {pg.images.map((img, i) => (
                <img key={img._id || i} src={img.url} alt="" onClick={() => setActiveImage(i)}
                  className={`h-16 w-24 object-cover rounded-md cursor-pointer flex-shrink-0 ${i === activeImage ? "ring-2 ring-brand-blue" : ""}`} />
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="w-full h-60 bg-gray-100 rounded-xl flex items-center justify-center text-gray-400 mb-8">
          No photos uploaded yet
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-8">
          {pg.description && (
            <section>
              <h2 className="font-heading font-semibold text-lg mb-2">About this PG</h2>
              <p className="text-gray-600 text-sm leading-relaxed">{pg.description}</p>
            </section>
          )}

          <section>
            <h2 className="font-heading font-semibold text-lg mb-3">Room Types & Pricing</h2>
            <div className="space-y-2">
              {pg.rooms.map((r) => (
                <div key={r._id} className="flex items-center justify-between bg-white shadow-sm rounded-lg p-3">
                  <div>
                    <p className="font-medium">{ROOM_LABELS[r.type]}</p>
                    <p className="text-xs text-gray-500">{r.availableRooms} of {r.totalRooms} available</p>
                  </div>
                  <span className="font-semibold text-brand-blue">₹{r.price}/mo</span>
                </div>
              ))}
            </div>
          </section>

          {pg.amenities.length > 0 && (
            <section>
              <h2 className="font-heading font-semibold text-lg mb-3">Amenities</h2>
              <div className="flex flex-wrap gap-2">
                {pg.amenities.map((a) => (
                  <span key={a} className="text-sm bg-gray-100 text-gray-700 px-3 py-1 rounded-full">{a}</span>
                ))}
              </div>
            </section>
          )}

          <section>
            <h2 className="font-heading font-semibold text-lg mb-3">Rules</h2>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>Food: {pg.rules.foodAvailable ? "Available" : "Not available"}</li>
              <li>Smoking: {pg.rules.smokingAllowed ? "Allowed" : "Not allowed"}</li>
              <li>Alcohol: {pg.rules.alcoholAllowed ? "Allowed" : "Not allowed"}</li>
              <li>Pets: {pg.rules.petsAllowed ? "Allowed" : "Not allowed"}</li>
              <li>Visitors: {pg.rules.visitorsAllowed ? "Allowed" : "Not allowed"}</li>
              {pg.rules.curfewTime && <li>Curfew: {pg.rules.curfewTime}</li>}
              <li>Minimum stay: {pg.rules.minimumStayMonths} month(s)</li>
              {pg.rules.otherRules && <li>{pg.rules.otherRules}</li>}
            </ul>
          </section>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <div className="bg-white shadow-sm rounded-xl p-5">
            <h3 className="font-heading font-semibold mb-2">Owner</h3>
            <p className="text-sm text-gray-700">{pg.owner?.name}</p>
            {user && <p className="text-sm text-gray-500">{pg.owner?.phone}</p>}

            {user?.role === "student" ? (
              <button
                onClick={() => toast("Booking requests are coming in the next phase!")}
                className="w-full bg-brand-green text-white py-2.5 rounded-md mt-4 text-sm font-medium"
              >
                Request Booking
              </button>
            ) : !user ? (
              <Link to="/login" className="block text-center w-full bg-brand-green text-white py-2.5 rounded-md mt-4 text-sm font-medium">
                Login to Book
              </Link>
            ) : null}

            <button
              onClick={() => toast("Favorites are coming in a later phase!")}
              className="w-full border py-2.5 rounded-md mt-2 text-sm font-medium"
            >
              Save PG
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
