"use client";

import { useEffect, useState, useRef } from "react";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import PioneerCard from "@/components/PioneerCard";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { motion } from "framer-motion";
import { FaFilter, FaChevronLeft, FaChevronRight } from "react-icons/fa";

const featuredCollections = [
  {
    title: "Quiet Coastal Retreats",
    image: "/coast.jpg",
  },
  {
    title: "A Culinary Tour for Celiacs",
    image: "/culinary.jpg",
  },
  {
    title: "Step-Free City Escapes",
    image: "/city.jpg",
  },
  {
    title: "Sensory-Friendly Nature Trails",
    image: "/nature.jpg",
  },
];

const filterOptions = [
  { key: "wheelchair", label: "Wheelchair Accessible" },
  { key: "sensory", label: "Sensory-Friendly" },
  { key: "lowEnergy", label: "Low Energy" },
];

export default function DiscoverPage() {
  const [trips, setTrips] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<{ [key: string]: boolean }>({});
  const [carouselIdx, setCarouselIdx] = useState(0);

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

  // Filter and search logic
  const filteredTrips = trips.filter((trip) => {
    if (
      search &&
      !trip.tripTitle.toLowerCase().includes(search.toLowerCase()) &&
      !trip.destination.toLowerCase().includes(search.toLowerCase())
    ) {
      return false;
    }
    if (filters.wheelchair && !trip.accessibility?.mobility) return false;
    if (filters.sensory && !trip.accessibility?.sensory) return false;
    if (filters.lowEnergy && !trip.accessibility?.lowEnergy) return false;
    return true;
  });

  // Carousel scroll logic
  const scrollCarousel = (dir: "left" | "right") => {
    setCarouselIdx((prev) =>
      dir === "left"
        ? Math.max(prev - 1, 0)
        : Math.min(prev + 1, featuredCollections.length - 1)
    );
  };

  return (
    <main className="min-h-screen bg-[#f8f7f4] px-0 py-8">
      {/* Search & Filtering */}
      <section className="max-w-6xl mx-auto px-4 mb-10">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search trips, destinations, or keywords..."
            className="w-full md:w-2/3 text-lg bg-white border border-slate-200 shadow rounded-xl px-5 py-3"
          />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 px-5 py-3 bg-blue-500 text-white rounded-xl shadow hover:bg-blue-600 transition">
                <FaFilter />
                Filter
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {filterOptions.map((opt) => (
                <DropdownMenuCheckboxItem
                  key={opt.key}
                  checked={!!filters[opt.key]}
                  onCheckedChange={(checked) =>
                    setFilters((f) => ({ ...f, [opt.key]: checked }))
                  }
                >
                  {opt.label}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </section>

      {/* Featured Collections Carousel */}
      <section className="max-w-6xl mx-auto px-4 mb-16">
        <h2 className="text-2xl font-bold mb-6 text-[#1e293b]">
          Featured Collections
        </h2>
        <div className="relative">
          <button
            className="absolute left-0 top-1/2 -translate-y-1/2 bg-white rounded-full shadow p-2 z-10"
            onClick={() => scrollCarousel("left")}
            disabled={carouselIdx === 0}
          >
            <FaChevronLeft />
          </button>
          <div className="overflow-x-hidden">
            <div
              className="flex transition-transform duration-500"
              style={{ transform: `translateX(-${carouselIdx * 320}px)` }}
            >
              {featuredCollections.map((col, idx) => (
                <motion.div
                  key={col.title}
                  className="min-w-[320px] h-48 rounded-2xl shadow-lg mr-6 flex items-end p-6 bg-cover bg-center relative"
                  style={{ backgroundImage: `url(${col.image})` }}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{
                    scale: 1.04,
                    boxShadow: "0 8px 32px #3b82f633",
                  }}
                  transition={{ type: "spring", stiffness: 80, damping: 18 }}
                >
                  <span className="text-xl font-bold text-white drop-shadow-lg">
                    {col.title}
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent rounded-2xl pointer-events-none" />
                </motion.div>
              ))}
            </div>
          </div>
          <button
            className="absolute right-0 top-1/2 -translate-y-1/2 bg-white rounded-full shadow p-2 z-10"
            onClick={() => scrollCarousel("right")}
            disabled={carouselIdx === featuredCollections.length - 1}
          >
            <FaChevronRight />
          </button>
        </div>
      </section>

      {/* Pioneer Itinerary Grid */}
      <section className="max-w-6xl mx-auto px-4">
        <h2 className="text-2xl font-bold mb-8 text-[#1e293b]">
          Pioneer Itineraries
        </h2>
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card
                key={i}
                className="bg-white border-0 shadow-lg rounded-xl p-6 flex flex-col items-center animate-pulse"
              >
                <CardHeader>
                  <Avatar className="mb-4">
                    <AvatarFallback>U</AvatarFallback>
                  </Avatar>
                  <CardTitle className="h-6 w-2/3 bg-gray-200 rounded mb-2" />
                </CardHeader>
                <CardContent>
                  <div className="h-4 w-1/2 bg-gray-200 rounded mb-2" />
                  <div className="h-4 w-1/3 bg-gray-200 rounded" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
            {filteredTrips.map((trip, idx) => (
              <motion.div
                key={trip.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{
                  scale: 1.04,
                  boxShadow: "0 8px 32px #3b82f633",
                }}
                transition={{ type: "spring", stiffness: 80, damping: 18 }}
              >
                <PioneerCard trip={trip} />
              </motion.div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}