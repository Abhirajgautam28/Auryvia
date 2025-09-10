'use client'; // A special spell for Next.js!

import { useState } from 'react';

export default function Home() {
  // This is where we'll keep the message from our engine room
  const [message, setMessage] = useState('');

  // This function happens when we click the button
  const handleClick = async () => {
    setMessage('Calling the engine room...');
    // We use our telephone (fetch) to call the backend's special door
    const response = await fetch('http://localhost:8080/api/hello');
    const data = await response.text();
    setMessage(data); // Put the message on the screen!
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="text-center">
        <h1 className="text-5xl font-bold mb-4">WanderAI ✨</h1>
        <p className="text-lg text-slate-400 mb-8">Your Magical Trip Planner</p>

        <button
          onClick={handleClick}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg transition-transform transform hover:scale-105"
        >
          Talk to the Backend Engine
        </button>

        {message && (
          <div className="mt-8 p-4 bg-slate-800 rounded-lg">
            <p>Message from the Engine Room:</p>
            <p className="font-mono text-green-400">{message}</p>
          </div>
        )}
      </div>
    </main>
  );
}