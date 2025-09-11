'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { motion } from 'framer-motion';

export default function EnergyMonitor({ itinerary, onReshuffle }: { itinerary: any, onReshuffle: (suggestion: any) => void }) {
  // Use a constant mock value for demo, but keep state for future extensibility
  const energy = 75;
  const [modalOpen, setModalOpen] = useState(false);
  const [suggestion, setSuggestion] = useState<{ replace: string; suggestion: string } | null>(null);
  const [loading, setLoading] = useState(false);

  const handleReshuffle = async () => {
    setLoading(true);
    setModalOpen(true);
    setSuggestion(null);
    try {
      const res = await fetch('http://localhost:8080/api/reshuffle-day', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itinerary, constraint: 'low-energy' }),
      });
      const data = await res.json();
      setSuggestion(data);
      if (onReshuffle) onReshuffle(data);
    } catch (e) {
      setSuggestion(null);
    }
    setLoading(false);
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-4 flex flex-col items-center min-w-[220px]">
      <div className="flex items-center gap-2 mb-2">
        <span className="font-bold text-blue-600">Live Energy Level</span>
        <span className="text-lg font-bold">{energy}%</span>
      </div>
      <div className="w-full h-6 bg-gray-200 rounded-full overflow-hidden mb-4">
        <motion.div
          className="h-full bg-blue-500"
          initial={{ width: 0 }}
          animate={{ width: `${energy}%` }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
          style={{ width: `${energy}%` }}
        />
      </div>
      <Button
        variant="ghost"
        className="bg-purple-600 hover:bg-purple-700 text-white rounded-full px-4 py-2"
        onClick={handleReshuffle}
      >
        Feeling tired? Reshuffle my day.
      </Button>
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Bio-Sync Energy Pacing</DialogTitle>
          </DialogHeader>
          {loading ? (
            <div className="text-center py-6 text-blue-500">Checking for a relaxing alternative...</div>
          ) : suggestion ? (
            <div className="space-y-4">
              <div className="text-lg text-gray-700">
                I see your energy is low. How about we swap <span className="font-semibold text-blue-600">{suggestion.replace}</span> with <span className="font-semibold text-green-600">{suggestion.suggestion}</span> instead?
              </div>
              <div className="flex gap-4 justify-center mt-4">
                <Button
                  variant="ghost"
                  className="bg-green-600 hover:bg-green-700 text-white"
                  onClick={() => setModalOpen(false)}
                >
                  Accept
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => setModalOpen(false)}
                >
                  Decline
                </Button>
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}