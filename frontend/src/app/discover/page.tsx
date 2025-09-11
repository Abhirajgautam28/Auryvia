"use client";

import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";

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
        const res = await fetch("http://localhost:8080/api/public-trips");
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
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
          {Array.from({ length: 6 }).map((_, i) => (
            <motion.div
              key={i}
              className="bg-slate-800 border border-slate-700 rounded-xl shadow-lg p-6 flex flex-col items-center"
              initial={{ scale: 1 }}
              whileHover={{ scale: 1.03 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              <Skeleton className="w-full h-40 mb-4 rounded-lg" />
              <Skeleton className="h-8 w-2/3 mb-2" />
              <Skeleton className="h-6 w-1/2 mb-2" />
              <Skeleton className="h-10 w-1/2 mt-4" />
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
          {trips.map((trip) => (
            <motion.div
              key={trip.id}
              className="bg-slate-800 border border-slate-700 rounded-xl shadow-lg p-6 flex flex-col items-center cursor-pointer"
              initial={{ scale: 1 }}
              whileHover={{ scale: 1.03 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              <div className="w-full h-40 mb-4 flex items-center justify-center bg-slate-700 rounded-lg overflow-hidden">
                <img
                  src="/globe.svg"
                  alt="Trip"
                  className="h-24 w-24 opacity-70"
                />
              </div>
              <h2 className="text-2xl font-bold text-blue-400 mb-2 text-center">
                {trip.tripTitle}
              </h2>
              <p className="text-slate-300 mb-2 text-center">
                {trip.destination}
              </p>
              <button
                className="mt-4 bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-6 rounded-lg shadow transition"
                disabled
              >
                View Details
              </button>
            </motion.div>
          ))}
        </div>
      )}
    </main>
  );
}