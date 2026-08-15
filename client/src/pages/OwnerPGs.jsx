import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { getOwnerPGs, deletePG } from "../api/pg";

export default function OwnerPGs() {
  const [pgs, setPgs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    try {
      const { data } = await getOwnerPGs();
      setPgs(data.pgs);
    } catch {
      toast.error("Failed to load your PGs");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id, name) {
    if (!window.confirm(`Delete "${name}"? This cannot be undone.`)) return;
    try {
      await deletePG(id);
      toast.success("PG deleted successfully");
      setPgs((prev) => prev.filter((p) => p._id !== id));
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete PG");
    }
  }

  if (loading) return <div className="text-center py-16 text-gray-500">Loading...</div>;

  return (
    <div className="max-w-5xl mx-auto py-10 px-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-heading text-2xl font-semibold">My PGs</h1>
        <Link to="/owner/pgs/new" className="bg-brand-green text-white px-4 py-2 rounded-md text-sm font-medium">
          + Add PG
        </Link>
      </div>

      {pgs.length === 0 ? (
        <div className="text-center py-16 text-gray-500 bg-white rounded-xl shadow-sm">
          <p>No PGs found. Add your first listing to get started.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {pgs.map((pg) => {
            const totalAvailable = pg.rooms.reduce((s, r) => s + r.availableRooms, 0);
            const minPrice = pg.rooms.length ? Math.min(...pg.rooms.map((r) => r.price)) : 0;
            const cover = pg.images.find((i) => i.isCover) || pg.images[0];

            return (
              <div key={pg._id} className="bg-white rounded-xl shadow-sm p-4 flex gap-4 items-center">
                <img
                  src={cover?.url || "https://placehold.co/120x90?text=No+Image"}
                  alt={pg.name}
                  className="w-28 h-20 object-cover rounded-md flex-shrink-0"
                />
                <div className="flex-1">
                  <h3 className="font-semibold">{pg.name}</h3>
                  <p className="text-sm text-gray-500">{pg.location.city}</p>
                  <p className="text-sm text-gray-700">
                    ₹{minPrice}/mo · {totalAvailable} rooms available
                  </p>
                  <span
                    className={`inline-block text-xs px-2 py-0.5 rounded-full mt-1 ${
                      pg.status === "active" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {pg.status}
                  </span>
                </div>
                <div className="flex flex-col gap-2 text-sm">
                  <Link to={`/pgs/${pg._id}`} className="text-brand-blue">View</Link>
                  <button onClick={() => handleDelete(pg._id, pg.name)} className="text-red-500 text-left">
                    Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
