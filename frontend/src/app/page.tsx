'use client';

import { useEffect, useState, useRef } from 'react';
import ActivityCard from './ActivityCard';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import InteractiveMap from '../components/InteractiveMap';
import BookingCard from '../components/BookingCard';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

type Itinerary = {
  tripTitle: string;
  itinerary: {
    day: number;
    title: string;
    activities: {
      time: string;
      description: string;
      category: string;
      lat?: number;
      lng?: number;
    }[];
  }[];
};

const thinkingSteps = [
  { text: "Analyzing your request... 🧠", duration: 1500 },
  { text: "Consulting global travel logs... 🗺️", duration: 2000 },
  { text: "Crafting your unique blueprint... ✨", duration: 2000 },
];

export default function Home() {
  const [idea, setIdea] = useState('');
  const [itinerary, setItinerary] = useState<Itinerary | null>(null);
  const [loading, setLoading] = useState(false);
  const [thinkingStep, setThinkingStep] = useState<number | null>(null);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [bookingData, setBookingData] = useState<any>(null);
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const activityRefs = useRef<Array<HTMLDivElement | null>>([]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
    });
    return () => unsubscribe();
  }, []);

  // Multi-step thinking animation
  useEffect(() => {
    if (loading) {
      setThinkingStep(0);
      let step = 0;
      const timers: NodeJS.Timeout[] = [];
      thinkingSteps.forEach((s, idx) => {
        timers.push(setTimeout(() => {
          setThinkingStep(idx);
        }, thinkingSteps.slice(0, idx).reduce((acc, cur) => acc + cur.duration, 0)));
      });
      return () => timers.forEach(clearTimeout);
    } else {
      setThinkingStep(null);
    }
  }, [loading]);

  const handleClick = async () => {
    setLoading(true);
    setItinerary(null);
    setBookingData(null);

    // Wait for all thinking steps before fetching
    let totalThinking = thinkingSteps.reduce((acc, cur) => acc + cur.duration, 0);
    setTimeout(async () => {
      const response = await fetch('http://localhost:8080/api/generate', {
        method: 'POST',
        body: idea,
      });

      const data = await response.json();
      setItinerary(data);

      // Fetch mock prices if destination is present
      if (data.destination) {
        try {
          const pricesRes = await fetch('http://localhost:8080/api/mock-prices', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ destination: data.destination }),
          });
          const prices = await pricesRes.json();
          setBookingData(prices);
        } catch {
          setBookingData(null);
        }
      }

      setLoading(false);
    }, totalThinking);
  };

  // Save itinerary to backend
  const handleSave = async () => {
    if (!itinerary || !user) return;
    setSaveStatus(null);

    try {
      const idToken = await user.getIdToken();
      const response = await fetch('http://localhost:8080/api/save-trip', {
        method: 'POST',
        body: JSON.stringify({ itinerary }),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`,
        },
      });
      if (response.ok) {
        setSaveStatus('Saved to your library!');
        toast.success('Trip saved to your library!', {
          icon: '✅',
        });
      } else {
        const errorText = await response.text();
        setSaveStatus('Error saving: ' + errorText);
      }
    } catch (err) {
      setSaveStatus('Error saving: ' + (err instanceof Error ? err.message : String(err)));
    }
  };

  // Scroll to activity card when marker is clicked
  useEffect(() => {
    if (selectedIdx !== null && activityRefs.current[selectedIdx]) {
      activityRefs.current[selectedIdx]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      // Remove highlight after 1.2s
      const timeout = setTimeout(() => setSelectedIdx(null), 1200);
      return () => clearTimeout(timeout);
    }
  }, [selectedIdx]);

  // Animation variants for staggered cards
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.18,
      },
    },
    exit: { opacity: 0 }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 60 } },
    exit: { opacity: 0, y: -30 }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-white font-sans">
      <div className="w-full max-w-5xl mx-auto rounded-2xl bg-white shadow-lg p-10 flex flex-col items-center justify-center border border-slate-200">
        <h1 className="text-5xl font-light mb-8 text-center text-gray-900 tracking-tight" style={{fontFamily: 'Roboto, Helvetica, Arial, sans-serif'}}>
          <span className="font-normal">Auryvia</span>
        </h1>
        <AnimatePresence>
          {!loading && thinkingStep === null && !itinerary && (
            <motion.form
              className="w-full flex flex-col items-center gap-6"
              onSubmit={e => { e.preventDefault(); handleClick(); }}
              initial={{ opacity: 1 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, transition: { duration: 0.5 } }}
            >
              <textarea
                value={idea}
                onChange={(e) => setIdea(e.target.value)}
                placeholder="e.g., A 5-day adventure in Kerala with backwaters, tea plantations, and spicy food"
                className="w-full bg-gray-100 border border-gray-300 rounded-full px-6 py-4 text-lg text-gray-900 focus:ring-2 focus:ring-blue-500 focus:outline-none transition shadow placeholder:text-gray-400 font-normal resize-none"
                rows={2}
                style={{ minHeight: 56 }}
              />
              <button
                type="submit"
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-8 rounded-full shadow transition disabled:opacity-50 text-lg"
                style={{fontFamily: 'Roboto, Helvetica, Arial, sans-serif'}}
              >
                {loading ? 'Dreaming...' : 'Create My Trip'}
              </button>
            </motion.form>
          )}
        </AnimatePresence>
        <AnimatePresence>
          {loading && thinkingStep !== null && (
            <motion.div
              key={thinkingStep}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.5 }}
              className="w-full flex flex-col items-center justify-center min-h-[120px]"
            >
              <motion.p
                className="text-2xl font-semibold text-blue-700 mb-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
              >
                {thinkingSteps[thinkingStep].text}
              </motion.p>
            </motion.div>
          )}
        </AnimatePresence>
        <AnimatePresence>
          {itinerary && !loading && (
            <motion.div
              className="mt-10 w-full h-[600px] flex flex-row gap-8"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              {/* Left Panel: Interactive Map */}
              <div className="w-1/2 h-full">
                <InteractiveMap
                  activities={
                    itinerary.itinerary
                      .flatMap(day => day.activities)
                      .filter(a => typeof a.lat === 'number' && typeof a.lng === 'number')
                  }
                  apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ''}
                  hoveredIdx={hoveredIdx}
                  selectedIdx={selectedIdx}
                  onMarkerClick={setSelectedIdx}
                />
              </div>
              {/* Right Panel: Scrollable itinerary cards */}
              <div className="w-1/2 h-full overflow-y-auto pr-2">
                <motion.h2
                  className="text-2xl font-medium mb-6 text-center text-blue-700"
                  variants={cardVariants}
                >
                  {itinerary.tripTitle}
                </motion.h2>
                <motion.div
                  className="space-y-6"
                  variants={containerVariants}
                >
                  <AnimatePresence>
                    {itinerary.itinerary.map((day) => (
                      <motion.div
                        key={day.day}
                        className="rounded-xl bg-gray-50 p-6 shadow border border-slate-200"
                        variants={cardVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                      >
                        <motion.h3
                          className="text-lg font-medium mb-4 text-blue-600"
                          variants={cardVariants}
                        >
                          Day {day.day}: {day.title}
                        </motion.h3>
                        <motion.div
                          className="space-y-4"
                          variants={containerVariants}
                        >
                          <AnimatePresence>
                            {day.activities.map((activity, index) => {
                              // Calculate global activity index for map binding
                              const globalIdx = itinerary.itinerary
                                .slice(0, itinerary.itinerary.indexOf(day))
                                .reduce((acc, d) => acc + d.activities.length, 0) + index;
                              return (
                                <motion.div
                                  key={index}
                                  variants={cardVariants}
                                  initial="hidden"
                                  animate="visible"
                                  exit="exit"
                                >
                                  <ActivityCard
                                    activity={activity}
                                    isHovered={hoveredIdx === globalIdx}
                                    isSelected={selectedIdx === globalIdx}
                                    onHover={() => setHoveredIdx(globalIdx)}
                                    onUnhover={() => setHoveredIdx(null)}
                                    refProp={el => (activityRefs.current[globalIdx] = el)}
                                  />
                                </motion.div>
                              );
                            })}
                          </AnimatePresence>
                        </motion.div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </motion.div>
                {bookingData && <BookingCard data={bookingData} />}
                {user && (
                  <motion.button
                    onClick={handleSave}
                    className="mt-8 bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg transition-transform transform hover:scale-105"
                    variants={cardVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                  >
                    Save to My Library
                  </motion.button>
                )}
                {saveStatus && (
                  <motion.div
                    className="mt-4 text-center"
                    variants={cardVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                  >
                    <span className={saveStatus.startsWith('Saved') ? 'text-green-400' : 'text-red-400'}>{saveStatus}</span>
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}