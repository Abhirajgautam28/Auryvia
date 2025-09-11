'use client';

import { Button } from '@/components/ui/button';
import OnboardingModal from '@/components/OnboardingModal';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { motion, AnimatePresence } from 'framer-motion';
import { FaHeart, FaShieldAlt, FaBrain, FaMapPin, FaLeaf, FaWheelchair, FaUtensils, FaEye } from 'react-icons/fa';
import { useEffect, useState, useRef } from 'react';
import ActivityCard from './ActivityCard';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import InteractiveMap from '../components/InteractiveMap';
import BookingCard from '../components/BookingCard';
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

const featureCards = [
  {
    icon: <FaEye className="text-blue-400 text-3xl mb-2" />,
    title: 'The Relief View',
    text: 'A map overlay showing accessible restrooms, quiet zones, and support services.',
  },
  {
    icon: <FaWheelchair className="text-blue-400 text-3xl mb-2" />,
    title: 'Step-Free Routing',
    text: 'Generates true, wheelchair-accessible paths between locations on a map.',
  },
  {
    icon: <FaUtensils className="text-blue-400 text-3xl mb-2" />,
    title: 'Dietary-Aware Dining',
    text: 'Locates restaurants that match your precise dietary needs, from allergies to celiac disease.',
  },
  {
    icon: <FaEye className="text-blue-400 text-3xl mb-2" />,
    title: 'Sensory-Friendly Scheduling',
    text: 'Finds quiet times at attractions and low-stimulation environments.',
  },
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
  const [showOnboarding, setShowOnboarding] = useState(false);
  // Check onboarding status after login
  useEffect(() => {
    if (user) {
      // Replace with your Firestore check for onboarding status
      fetch(`http://localhost:8080/api/check-onboarding`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${user && (user as any).accessToken}` },
      })
        .then(res => res.json())
        .then(data => {
          if (!data.onboarded) setShowOnboarding(true);
        })
        .catch(() => setShowOnboarding(false));
    }
  }, [user]);

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
      return () => {
        setTimeout(() => {
          setSelectedIdx(null);
        }, 1200);
      };
    }
  }, [selectedIdx]);

  return (
    <main className="min-h-screen bg-[#f8f7f4] text-[#1e293b] font-sans">
      {showOnboarding && (
        <OnboardingModal onComplete={() => setShowOnboarding(false)} />
      )}
      <div className="relative">
        {/* Background SVG */}
        <motion.svg
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 w-full h-full -z-10"
          viewBox="0 0 1440 320"
        >
          <motion.path
            fill="url(#gradient)"
            d="M0,128L30,138.7C60,149,120,171,180,186.7C240,203,300,213,360,186.7C420,160,480,96,540,74.7C600,53,660,75,720,101.3C780,128,840,160,900,186.7C960,213,1020,235,1080,218.7C1140,203,1200,149,1260,128L1320,107L1380,85.3L1440,64L1440,320L1380,320C1320,320,1260,320,1200,320C1140,320,1080,320,1020,320C960,320,900,320,840,320C780,320,720,320,660,320C600,320,540,320,480,320C420,320,360,320,300,320C240,320,180,320,120,320C60,320,30,320,0,320Z"
            variants={{
              hidden: { opacity: 0, y: 20 },
              visible: { opacity: 1, y: 0 },
            }}
            transition={{ duration: 1, ease: 'easeOut' }}
          />
          <defs>
            <linearGradient id="gradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3b82f6" />
              <stop offset="100%" stopColor="#a7f3d0" />
            </linearGradient>
          </defs>
        </motion.svg>

        <div className="relative z-10 px-4 py-16 max-w-5xl mx-auto">
          {/* Search and Idea Section */}
          <motion.div
            className="bg-white rounded-3xl shadow-2xl p-8 mb-12"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          >
            <motion.h2
              className="text-3xl font-extrabold mb-6 text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.7, ease: 'easeOut' }}
            >
              Your Next Adventure Awaits
            </motion.h2>
            <motion.div
              className="flex flex-col md:flex-row gap-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.7, ease: 'easeOut' }}
            >
              <input
                type="text"
                value={idea}
                onChange={(e) => setIdea(e.target.value)}
                placeholder="Where to this time?"
                className="flex-1 px-4 py-3 text-lg rounded-full border-2 border-transparent focus:border-blue-500 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              />
              <Button
                onClick={handleClick}
                className="flex-shrink-0 bg-blue-600 hover:bg-blue-700 text-white text-lg rounded-full px-6 py-3 transition-all"
              >
                {loading ? 'Thinking...' : 'Generate Itinerary'}
              </Button>
            </motion.div>
          </motion.div>

          {/* Thinking Animation */}
          <AnimatePresence>
            {loading && (
              <motion.div
                className="bg-white rounded-3xl shadow-2xl p-8 mb-12"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
              >
                <motion.h2
                  className="text-2xl font-bold mb-4 text-center"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.7, ease: 'easeOut' }}
                >
                  Just a Moment...
                </motion.h2>
                <motion.div
                  className="flex flex-col gap-2"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.7, ease: 'easeOut' }}
                >
                  {thinkingSteps.map((step, idx) => (
                    <motion.div
                      key={idx}
                      className="flex items-center gap-3"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, ease: 'easeOut' }}
                    >
                      <div className="w-3 h-3 rounded-full bg-blue-600" />
                      <p className="text-lg text-[#334155]">{step.text}</p>
                    </motion.div>
                  ))}
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Itinerary and Booking Results */}
          <AnimatePresence>
            {itinerary && !loading && (
              <motion.div
                className="bg-white rounded-3xl shadow-2xl p-8 mb-12"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
              >
                <div className="flex flex-col gap-4">
                  <motion.h2
                    className="text-2xl font-bold mb-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.7, ease: 'easeOut' }}
                  >
                    {itinerary.tripTitle}
                  </motion.h2>
                  <motion.div
                    className="grid grid-cols-1 sm:grid-cols-2 gap-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.7, ease: 'easeOut' }}
                  >
                    {itinerary.itinerary.map((day, idx) => (
                      <div key={idx} className="p-4 bg-blue-50 rounded-lg shadow">
                        <h3 className="text-xl font-semibold mb-2">Day {day.day}: {day.title}</h3>
                        <div className="flex flex-col gap-2">
                          {day.activities.map((activity, aidx) => (
                            <div key={aidx} className="flex items-center gap-3 p-3 bg-white rounded-lg shadow-sm">
                              <div className="flex-shrink-0">
                                <span className="block w-2.5 h-2.5 rounded-full bg-blue-600" />
                              </div>
                              <div className="flex-1">
                                <p className="text-[#334155] font-medium">{activity.time} - {activity.description}</p>
                                <p className="text-sm text-gray-500">{activity.category}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </motion.div>
                </div>

                {/* Booking Card and Save Button */}
                <div className="mt-6">
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
      </div>

      {/* New Sections Below */}
      {/* Hero Section */}
      <section className="relative flex flex-col items-center justify-center h-[70vh] px-4">
        {/* Animated abstract background */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 pointer-events-none"
        >
          <svg width="100%" height="100%" viewBox="0 0 1440 600" fill="none" className="absolute inset-0 w-full h-full">
            <motion.path
              d="M0,400 Q720,600 1440,400 L1440,0 L0,0 Z"
              fill="url(#gradient1)"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 0.5, y: 0 }}
              transition={{ duration: 1.2, ease: 'easeOut' }}
            />
            <defs>
              <linearGradient id="gradient1" x1="0" y1="0" x2="1440" y2="600" gradientTransform="rotate(45)">
                <stop stopColor="#3b82f6" stopOpacity="0.18" />
                <stop offset="1" stopColor="#a7f3d0" stopOpacity="0.12" />
              </linearGradient>
            </defs>
          </svg>
        </motion.div>
        <div className="relative z-10 flex flex-col items-center">
          <motion.h1
            className="text-5xl md:text-7xl font-extrabold mb-6 text-center"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: 'easeOut' }}
            style={{ color: '#1e293b', fontFamily: 'Inter, sans-serif' }}
          >
            Travel Without Barriers.
          </motion.h1>
          <motion.p
            className="text-lg md:text-2xl font-medium text-center mb-8 max-w-2xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 1, ease: 'easeOut' }}
            style={{ color: '#334155', fontFamily: 'Inter, sans-serif' }}
          >
            Auryvia is the world's first compassionate travel AI, designing trips that adapt to your unique needs, energy levels, and sensory preferences.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1, duration: 0.7, ease: 'easeOut' }}
          >
            <Button size="lg" className="bg-blue-500 hover:bg-blue-600 text-white text-lg px-8 py-4 rounded-full shadow-lg font-semibold">
              Plan My Comfort Trip
            </Button>
          </motion.div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 px-4 max-w-5xl mx-auto">
        <motion.h2
          className="text-3xl md:text-4xl font-bold text-center mb-12"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
        >
          How It Works
        </motion.h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {/* Step 1 */}
          <motion.div
            className="flex flex-col items-center text-center"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.1, ease: 'easeOut' }}
          >
            <span className="bg-blue-100 rounded-full p-4 mb-4">
              <FaHeart className="text-blue-400 text-3xl" />
              <FaShieldAlt className="text-blue-400 text-xl absolute -ml-6 mt-2" />
            </span>
            <h3 className="text-xl font-semibold mb-2">Share Your Needs, Safely</h3>
            <p className="text-base text-[#334155]">Our inclusive onboarding understands everything from mobility to sensory sensitivities.</p>
          </motion.div>
          {/* Step 2 */}
          <motion.div
            className="flex flex-col items-center text-center"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.2, ease: 'easeOut' }}
          >
            <span className="bg-blue-100 rounded-full p-4 mb-4">
              <FaBrain className="text-blue-400 text-3xl" />
              <svg width="32" height="32" className="absolute -ml-6 mt-2">
                <path d="M8 16 Q16 8 24 16" stroke="#3b82f6" strokeWidth="2" fill="none" />
              </svg>
            </span>
            <h3 className="text-xl font-semibold mb-2">Our Compassionate AI Creates</h3>
            <p className="text-base text-[#334155]">Auryvia analyzes millions of data points to build a trip that respects your pace.</p>
          </motion.div>
          {/* Step 3 */}
          <motion.div
            className="flex flex-col items-center text-center"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.3, ease: 'easeOut' }}
          >
            <span className="bg-blue-100 rounded-full p-4 mb-4 flex items-center justify-center relative">
              <FaMapPin className="text-blue-400 text-3xl" />
              <FaLeaf className="text-green-400 text-xl absolute -ml-6 mt-2" />
            </span>
            <h3 className="text-xl font-semibold mb-2">Travel With Confidence</h3>
            <p className="text-base text-[#334155]">Receive an itinerary designed for your comfort, peace of mind, and joy.</p>
          </motion.div>
        </div>
      </section>

      {/* Key Features Grid */}
      <section className="py-16 px-4 max-w-6xl mx-auto">
        <motion.h2
          className="text-3xl md:text-4xl font-bold text-center mb-12"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
        >
          Relief-Oriented Features
        </motion.h2>
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={{
            hidden: {},
            visible: {
              transition: { staggerChildren: 0.18 }
            }
          }}
        >
          {featureCards.map((feature, idx) => (
            <motion.div
              key={feature.title}
              variants={{
                hidden: { opacity: 0, y: 30 },
                visible: { opacity: 1, y: 0 }
              }}
              whileHover={{ scale: 1.04, boxShadow: '0 8px 32px #3b82f633' }}
              transition={{ type: 'spring', stiffness: 80, damping: 18 }}
            >
              <Card className="bg-white border-0 shadow-lg rounded-xl p-6 flex flex-col items-center text-center min-h-[220px]">
                <CardHeader>
                  {feature.icon}
                  <CardTitle className="text-lg font-bold mb-2 text-blue-500">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-base text-[#334155]">{feature.text}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </section>
    </main>
  );
}