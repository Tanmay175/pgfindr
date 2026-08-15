import { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import { getPGs, AMENITIES_LIST, ROOM_TYPES } from "../api/pg";
import PGCard from "../components/PGCard";

const DEBOUNCE_MS = 400;

export default function Search() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [city, setCity] = useState(searchParams.get("city") || "");
  const [minPrice, setMinPrice] = useState(searchParams.get("minPrice") || "");
  const [maxPrice, setMaxPrice] = useState(searchParams.get("maxPrice") || "");
  const [gender, setGender] = useState(searchParams.get("gender") || "");
  const [roomType, setRoomType] = useState(searchParams.get("roomType") || "");
  const [amenities, setAmenities] = useState(
    searchParams.get("amenities") ? searchParams.get("amenities").split(",") : []
  );
  const [availableOnly, setAvailableOnly] = useState(searchParams.get("availableOnly") === "true");
  const [sort, setSort] = useState(searchParams.get("sort") || "newest");
  const [page, setPage] = useState(1);

  const [pgs, setPgs] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  const fetchResults = useCallback(async () => {
    setLoading(true);
    const params = {
      search: search || undefined,
      city: city || undefined,
      minPrice: minPrice || undefined,
      maxPrice: maxPrice || undefined,
      gender: gender || undefined,
      roomType: roomType || undefined,
      amenities: amenities.length ? amenities.join(",") : undefined,
      availableOnly: availableOnly || undefined,
      sort,
      page,
      limit: 9,
    };
    try {
      const { data } = await getPGs(params);
      setPgs(data.pgs);
      setTotalPages(data.totalPages);
      setTotal(data.total);
    } catch {
      toast.error("Failed to load PGs");
    } finally {
      setLoading(false);
    }
  }, [search, city, minPrice, maxPrice, gender, roomType, amenities, availableOnly, sort, page]);

  useEffect(() => {
    const t = setTimeout(fetchResults, DEBOUNCE_MS);
    return () => clearTimeout(t);
  }, [fetchResults]);

  useEffect(() => {
    setPage(1);
  }, [search, city, minPrice, maxPrice, gender, roomType, amenities, availableOnly, sort]);

  useEffect(() => {
    const p = {};
    if (search) p.search = search;
    if (city) p.city = city;
    if (minPrice) p.minPrice = minPrice;
    if (maxPrice) p.maxPrice = maxPrice;
    if (gender) p.gender = gender;
    if (roomType) p.roomType = roomType;
    if (amenities.length) p.amenities = amenities.join(",");
    if (availableOnly) p.availableOnly = "true";
    if (sort !== "newest") p.sort = sort;
    setSearchParams(p, { replace: true });
  }, [search, city, minPrice, maxPrice, gender, roomType, amenities, availableOnly, sort]);

  function toggleAmenity(a) {
    setAmenities((prev) => (prev.includes(a) ? prev.filter((x) => x !== a) : [...prev, a]));
  }

  function clearFilters() {
    setSearch(""); setCity(""); setMinPrice(""); setMaxPrice("");
    setGender(""); setRoomType(""); setAmenities([]); setAvailableOnly(false); setSort("newest");
  }

  const inputClass = "w-full border rounded-md p-2 text-sm";

  return (
    <div className="max-w-6xl mx-auto py-8 px-6">
      <div className="flex flex-col md:flex-row gap-3 mb-6">
        <input
          className="flex-1 border rounded-md p-3"
          placeholder="Search by PG name, city, or college..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button
          onClick={() => setShowFilters((s) => !s)}
          className="border rounded-md px-4 py-2 text-sm font-medium"
        >
          {showFilters ? "Hide Filters" : "Show Filters"}
        </button>
        <select className={inputClass + " md:w-48"} value={sort} onChange={(e) => setSort(e.target.value)}>
          <option value="newest">Newest</option>
          <option value="price_asc">Price: Low → High</option>
          <option value="price_desc">Price: High → Low</option>
          <option value="rating">Rating</option>
        </select>
      </div>

      {showFilters && (
        <div className="bg-white rounded-xl shadow-sm p-5 mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
          <input className={inputClass} placeholder="City" value={city} onChange={(e) => setCity(e.target.value)} />
          <input className={inputClass} type="number" min="0" placeholder="Min price" value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)} />
          <input className={inputClass} type="number" min="0" placeholder="Max price" value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)} />
          <select className={inputClass} value={gender} onChange={(e) => setGender(e.target.value)}>
            <option value="">Any Gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="any">Co-ed</option>
          </select>
          <select className={inputClass} value={roomType} onChange={(e) => setRoomType(e.target.value)}>
            <option value="">Any Room Type</option>
            {ROOM_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={availableOnly} onChange={(e) => setAvailableOnly(e.target.checked)} />
            Available only
          </label>
          <button onClick={clearFilters} className="text-sm text-brand-blue text-left md:text-right">
            Clear all filters
          </button>

          <div className="md:col-span-4 flex flex-wrap gap-2 pt-2 border-t">
            {AMENITIES_LIST.map((a) => (
              <button
                key={a}
                type="button"
                onClick={() => toggleAmenity(a)}
                className={`text-xs px-3 py-1 rounded-full border ${
                  amenities.includes(a) ? "bg-brand-green text-white border-brand-green" : "border-gray-300 text-gray-600"
                }`}
              >
                {a}
              </button>
            ))}
          </div>
        </div>
      )}

      {loading ? (
        <div className="text-center py-16 text-gray-500">Loading PGs...</div>
      ) : pgs.length === 0 ? (
        <div className="text-center py-16 text-gray-500 bg-white rounded-xl shadow-sm">
          No PGs found. Try adjusting your filters.
        </div>
      ) : (
        <>
          <p className="text-sm text-gray-500 mb-4">{total} PG{total !== 1 ? "s" : ""} found</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {pgs.map((pg) => <PGCard key={pg._id} pg={pg} />)}
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-8">
              <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)}
                className="px-3 py-1.5 border rounded-md text-sm disabled:opacity-40">
                Previous
              </button>
              <span className="text-sm text-gray-600">Page {page} of {totalPages}</span>
              <button disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}
                className="px-3 py-1.5 border rounded-md text-sm disabled:opacity-40">
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
