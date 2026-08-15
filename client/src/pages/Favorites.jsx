import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { getFavorites, removeFavorite } from "../api/favoriteReview";
import PGCard from "../components/PGCard";

export default function Favorites() {
  const [pgs, setPgs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    try {
      const { data } = await getFavorites();
      setPgs(data.pgs);
    } catch {
      toast.error("Failed to load favorites");
    } finally {
      setLoading(false);
    }
  }

  async function handleRemove(id) {
    try {
      await removeFavorite(id);
      toast.success("Removed from favorites");
      setPgs((prev) => prev.filter((p) => p._id !== id));
    } catch {
      toast.error("Failed to remove favorite");
    }
  }

  if (loading) return <div className="text-center py-16 text-gray-500">Loading...</div>;

  return (
    <div className="max-w-6xl mx-auto py-10 px-6">
      <h1 className="font-heading text-2xl font-semibold mb-6">My Favorites</h1>

      {pgs.length === 0 ? (
        <div className="text-center py-16 text-gray-500 bg-white rounded-xl shadow-sm">
          <p className="mb-3">No saved PGs yet.</p>
          <Link to="/search" className="text-brand-blue font-medium">Browse PGs</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {pgs.map((pg) => (
            <div key={pg._id} className="relative">
              <PGCard pg={pg} />
              <button
                onClick={(e) => { e.preventDefault(); handleRemove(pg._id); }}
                className="absolute top-2 right-2 bg-white/90 text-red-500 text-xs px-2 py-1 rounded-full shadow"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
