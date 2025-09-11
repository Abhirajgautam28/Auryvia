'use client';

import { useEffect, useState } from 'react';
import ActivityCard from './ActivityCard';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import InteractiveMap from '../components/InteractiveMap';
import BookingCard from '../components/BookingCard';

type Itinerary = {
  tripTitle: string;
  itinerary: {
    day: number;
    title: string;
    activities: {
      time: string;
      description: string;
      category: string;
    }[];
  }[];
};

export default function Home() {
  const [idea, setIdea] = useState('');
  const [itinerary, setItinerary] = useState<Itinerary | null>(null);
  const [loading, setLoading] = useState(false);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [bookingData, setBookingData] = useState<any>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
    });
    return () => unsubscribe();
  }, []);

  const handleClick = async () => {
    setLoading(true);
    setItinerary(null);
    setBookingData(null);

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
      } else {
        const errorText = await response.text();
        setSaveStatus('Error saving: ' + errorText);
      }
    } catch (err) {
      setSaveStatus('Error saving: ' + (err instanceof Error ? err.message : String(err)));
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-white font-sans">
      <div className="w-full max-w-xl mx-auto rounded-2xl bg-white shadow-lg p-10 flex flex-col items-center justify-center border border-slate-200">
        <h1 className="text-5xl font-light mb-8 text-center text-gray-900 tracking-tight" style={{fontFamily: 'Roboto, Helvetica, Arial, sans-serif'}}>
          <span className="font-normal">Auryvia</span>
        </h1>
        <form
          className="w-full flex flex-col items-center gap-6"
          onSubmit={e => { e.preventDefault(); handleClick(); }}
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
        </form>
        {itinerary && (
          <div className="mt-10 w-full">
            <InteractiveMap
              activities={
                itinerary.itinerary
                  .flatMap(day => day.activities)
                  .filter(a => typeof a.lat === 'number' && typeof a.lng === 'number')
              }
              apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ''}
            />
            <h2 className="text-2xl font-medium mb-6 text-center text-blue-700">{itinerary.tripTitle}</h2>
            <div className="space-y-6">
              {itinerary.itinerary.map((day) => (
                <div key={day.day} className="rounded-xl bg-gray-50 p-6 shadow border border-slate-200">
                  <h3 className="text-lg font-medium mb-4 text-blue-600">Day {day.day}: {day.title}</h3>
                  <div className="space-y-4">
                    {day.activities.map((activity, index) => (
                      <ActivityCard key={index} activity={activity} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
            {bookingData && <BookingCard data={bookingData} />}
            {user && (
              <button
                onClick={handleSave}
                className="mt-8 bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg transition-transform transform hover:scale-105"
              >
                Save to My Library
              </button>
            )}
            {saveStatus && (
              <div className="mt-4 text-center">
                <span className={saveStatus.startsWith('Saved') ? 'text-green-400' : 'text-red-400'}>{saveStatus}</span>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}