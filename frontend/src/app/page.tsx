'use client';

import { useState } from 'react';
import ActivityCard from './ActivityCard';

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

  const handleClick = async () => {
    setLoading(true);
    setItinerary(null);

    const response = await fetch('http://localhost:8080/api/generate', {
      method: 'POST',
      body: idea,
    });

    const data = await response.json();
    setItinerary(data);
    setLoading(false);
  };

  return (
    <main className="flex min-h-screen flex-col items-center p-4 sm:p-12 md:p-24">
      <div className="w-full max-w-4xl text-center">
        {/* ... (The header and input form are the same) ... */}
        <h1 className="text-4xl sm:text-6xl font-extrabold mb-3 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
          WanderAI ✨
        </h1>
        <p className="text-md sm:text-xl text-slate-400 mb-8">
          Describe your perfect trip, and let our AI create the magic for you!
        </p>

        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <textarea
            value={idea}
            onChange={(e) => setIdea(e.target.value)}
            placeholder="e.g., A 5-day adventure in Kerala with backwaters, tea plantations, and spicy food"
            className="flex-grow bg-slate-800 border border-slate-700 rounded-lg p-4 focus:ring-2 focus:ring-blue-500 focus:outline-none transition w-full resize-none"
            rows={2}
          />
          <button
            onClick={handleClick}
            disabled={loading}
            className="bg-gradient-to-r from-blue-500 to-purple-600 hover:opacity-90 text-white font-bold py-4 px-8 rounded-lg shadow-lg transition-transform transform hover:scale-105 disabled:opacity-50 disabled:scale-100"
          >
            {loading ? 'Dreaming...' : 'Create My Trip'}
          </button>
        </div>
        {itinerary && (
          <div className="mt-8 text-left">
            <h2 className="text-3xl font-bold mb-6 text-center">{itinerary.tripTitle}</h2>
            <div className="space-y-8">
              {itinerary.itinerary.map((day) => (
                <div key={day.day}>
                  <h3 className="text-xl font-semibold mb-4 text-blue-400">Day {day.day}: {day.title}</h3>
                  <div className="space-y-4">
                    {day.activities.map((activity, index) => (
                      <ActivityCard key={index} activity={activity} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}