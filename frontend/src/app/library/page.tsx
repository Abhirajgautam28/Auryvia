"use client";

import { useEffect, useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import TripCard from "@/components/TripCard";
import { motion } from "framer-motion";
import { FaPlus } from "react-icons/fa";

type Trip = {
  id: string;
  tripTitle: string;
  destination: string;
  startDate?: string;
  endDate?: string;
  accessibility?: {
    mobility?: boolean;
    sensory?: boolean;
    dietary?: boolean;
  };
  imageUrl?: string;
  isPast?: boolean;
};

export default function LibraryPage() {
  const [userName, setUserName] = useState("Traveler");
  const [upcoming, setUpcoming] = useState<Trip[]>([]);
  const [past, setPast] = useState<Trip[]>([]);

  useEffect(() => {
    // Fetch user name and trips from backend
    const fetchTrips = async () => {
      // Replace with real user fetching logic
      setUserName("Traveler");
      const res = await fetch("http://localhost:8080/api/my-trips");
      const data = await res.json();
      setUpcoming(data.upcoming || []);
      setPast(data.past || []);
    };
    fetchTrips();
  }, []);

  return (
    <main className="max-w-6xl mx-auto py-12 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4"
      >
        <div className="text-2xl font-bold text-gray-900">
          Welcome back, {userName}!
        </div>
        <Button size="lg" className="bg-blue-500 hover:bg-blue-600 text-white text-lg px-6 py-3 rounded-full shadow flex items-center gap-2">
          <FaPlus />
          Plan a New Trip
        </Button>
      </motion.div>
      <Tabs defaultValue="upcoming" className="w-full">
        <TabsList className="mb-8 flex gap-4 bg-gray-100 rounded-xl p-2">
          <TabsTrigger value="upcoming" className="flex-1 text-lg font-semibold">Upcoming Trips</TabsTrigger>
          <TabsTrigger value="past" className="flex-1 text-lg font-semibold">Past Adventures</TabsTrigger>
        </TabsList>
        <TabsContent value="upcoming">
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={{
              hidden: {},
              visible: { transition: { staggerChildren: 0.15 } },
            }}
          >
            {upcoming.length === 0 ? (
              <div className="text-center text-gray-400 py-12">No upcoming trips yet.</div>
            ) : (
              upcoming.map((trip) => (
                <motion.div
                  key={trip.id}
                  variants={{
                    hidden: { opacity: 0, y: 20 },
                    visible: { opacity: 1, y: 0 },
                  }}
                  whileHover={{ scale: 1.03, boxShadow: "0 8px 32px #3b82f633" }}
                  transition={{ type: "spring", stiffness: 80, damping: 18 }}
                >
                  <TripCard trip={trip} showChecklist />
                </motion.div>
              ))
            )}
          </motion.div>
        </TabsContent>
        <TabsContent value="past">
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={{
              hidden: {},
              visible: { transition: { staggerChildren: 0.15 } },
            }}
          >
            {past.length === 0 ? (
              <div className="text-center text-gray-400 py-12">No past adventures yet.</div>
            ) : (
              past.map((trip) => (
                <motion.div
                  key={trip.id}
                  variants={{
                    hidden: { opacity: 0, y: 20 },
                    visible: { opacity: 1, y: 0 },
                  }}
                  whileHover={{ scale: 1.03, boxShadow: "0 8px 32px #3b82f633" }}
                  transition={{ type: "spring", stiffness: 80, damping: 18 }}
                >
                  <TripCard trip={trip} />
                </motion.div>
              ))
            )}
          </motion.div>
        </TabsContent>
      </Tabs>
    </main>
  );
}