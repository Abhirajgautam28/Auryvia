'use client';

import { useState } from 'react';

export default function Home() {
  const [idea, setIdea] = useState('');
  const [itinerary, setItinerary] = useState('');
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    if (!idea) {
      alert('Please enter a trip idea!');
      return;
    }
    setLoading(true);
    setItinerary('');

    try {
      const response = await fetch('http://localhost:8080/api/generate', {
        method: 'POST',
        body: idea,
      });

      const data = await response.text();
      setItinerary(data);
    } catch (error) {
      console.error("Oops, couldn't talk to the engine:", error);
      alert("Oops! Something went wrong. Make sure the backend engine is running!");
    }

    setLoading(false);
  };

  return (
    <main className="flex min-h-screen flex-col items-center p-4 sm:p-12 md:p-24">
      <div className="w-full max-w-4xl text-center">
        <h1 className="text-4xl sm:text-6xl font-extrabold mb-3 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
          Auryvia ✨
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

        {loading && (
          <div className="text-center">
            <p>Our AI is crafting your unique adventure... 🗺️</p>
          </div>
        )}

        {itinerary && (
          <div className="mt-8 text-left p-6 bg-slate-800/50 border border-slate-700 rounded-lg shadow-inner">
            <pre className="whitespace-pre-wrap font-sans text-slate-200">{itinerary}</pre>
          </div>
        )}
      </div>
    </main>
  );
}