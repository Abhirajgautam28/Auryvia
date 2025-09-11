'use client';

import { useEffect, useState } from 'react';

type Trip = {
  id: string;
  tripTitle: string;
  destination: string;
  itinerary?: any;
};

export default function DiscoverPage() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTrips = async () => {
      setLoading(true);
      try {
        const res = await fetch('http://localhost:8080/api/public-trips');
        const data = await res.json();
        setTrips(data);
      } catch {
        setTrips([]);
      }
      setLoading(false);
    };
    fetchTrips();
  }, []);

  return (
    <main className="min-h-screen bg-slate-900 p-8">
      <h1 className="text-4xl font-extrabold text-center mb-10 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
        Discover Public Trips
      </h1>
      {loading ? (
        <div className="text-center text-slate-400 text-xl">Loading...</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
          {trips.map(trip => (
            <div
              key={trip.id}
              className="bg-slate-800 border border-slate-700 rounded-xl shadow-lg p-6 flex flex-col items-center"
            >
              <div className="w-full h-40 mb-4 flex items-center justify-center bg-slate-700 rounded-lg overflow-hidden">
                <img
                  src="/globe.svg"
                  alt="Trip"
                  className="h-24 w-24 opacity-70"
                />
              </div>
              <h2 className="text-2xl font-bold text-blue-400 mb-2 text-center">{trip.tripTitle}</h2>
              <p className="text-slate-300 mb-2 text-center">{trip.destination}</p>
              <button
                className="mt-4 bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-6 rounded-lg shadow transition"
                disabled
              >
                View Details
              </button>
            </div>
          ))}
        </div>