import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div className="text-center py-20 px-6 bg-gradient-to-b from-gray-900 to-gray-700 text-white">
      <h1 className="font-heading text-4xl font-semibold mb-4">
        Find Your Perfect PG with <span className="text-brand-green">PG</span>
        <span className="text-brand-blue">Findr</span>
      </h1>
      <p className="text-gray-300 mb-8">Verified listings. Real availability. Direct booking requests.</p>
      <Link to="/search" className="bg-brand-blue px-6 py-3 rounded-md font-medium">
        Search PGs
      </Link>
    </div>
  );
}
