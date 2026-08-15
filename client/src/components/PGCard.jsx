import { Link } from "react-router-dom";

export default function PGCard({ pg }) {
  const cover = pg.images?.find((i) => i.isCover) || pg.images?.[0];
  const minPrice = pg.rooms?.length ? Math.min(...pg.rooms.map((r) => r.price)) : 0;
  const totalAvailable = pg.rooms?.reduce((s, r) => s + r.availableRooms, 0) || 0;

  const availabilityLabel =
    totalAvailable === 0 ? "Fully Booked" : totalAvailable <= 2 ? "Limited Availability" : "Available";
  const availabilityColor =
    totalAvailable === 0 ? "bg-red-100 text-red-700" : totalAvailable <= 2 ? "bg-amber-100 text-amber-700" : "bg-green-100 text-green-700";

  return (
    <Link
      to={`/pgs/${pg._id}`}
      className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden flex flex-col"
    >
      <img
        src={cover?.url || "https://placehold.co/400x240?text=No+Image"}
        alt={pg.name}
        className="w-full h-44 object-cover"
      />
      <div className="p-4 flex flex-col gap-1.5 flex-1">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-heading font-semibold leading-tight">{pg.name}</h3>
          {pg.rating?.count > 0 && (
            <span className="text-xs text-amber-600 whitespace-nowrap">
              ★ {pg.rating.average.toFixed(1)} ({pg.rating.count})
            </span>
          )}
        </div>
        <p className="text-sm text-gray-500">{pg.location?.city}</p>

        <div className="flex flex-wrap gap-1 mt-1">
          {pg.amenities?.slice(0, 3).map((a) => (
            <span key={a} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
              {a}
            </span>
          ))}
        </div>

        <div className="flex items-center justify-between mt-auto pt-2">
          <span className="font-semibold text-brand-blue">₹{minPrice}<span className="text-xs text-gray-500 font-normal">/mo</span></span>
          <span className={`text-xs px-2 py-0.5 rounded-full ${availabilityColor}`}>{availabilityLabel}</span>
        </div>
      </div>
    </Link>
  );
}
