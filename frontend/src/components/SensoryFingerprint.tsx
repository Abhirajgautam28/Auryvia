'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

type SensoryProfile = {
  audio: number;
  visual: number;
  crowds: number;
  summary: string;
};

export default function SensoryFingerprint({ location }: { location: string }) {
  const [profile, setProfile] = useState<SensoryProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch('http://localhost:8080/api/sensory-profile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ location }),
    })
      .then(res => res.json())
      .then(data => {
        setProfile(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [location]);

  const chart = (label: string, value: number, color: string) => (
    <div className="flex flex-col items-center mx-2">
      <div className="relative w-20 h-20 mb-2">
        <svg width="80" height="80">
          <circle
            cx="40"
            cy="40"
            r="32"
            stroke="#e5e7eb"
            strokeWidth="8"
            fill="none"
          />
          <motion.circle
            cx="40"
            cy="40"
            r="32"
            stroke={color}
            strokeWidth="8"
            fill="none"
            strokeDasharray={2 * Math.PI * 32}
            strokeDashoffset={2 * Math.PI * 32}
            animate={{
              strokeDashoffset: 2 * Math.PI * 32 * (1 - value / 100),
            }}
            transition={{ duration: 1.2, ease: 'easeOut' }}
          />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center text-xl font-bold text-gray-700">
          {value}
        </span>
      </div>
      <span className="text-sm font-medium text-gray-600">{label}</span>
    </div>
  );

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 flex flex-col items-center min-w-[320px]">
      <h3 className="text-lg font-bold mb-4 text-blue-500">Sensory Fingerprint</h3>
      {loading || !profile ? (
        <div className="flex gap-6 mb-4">
          {chart('Auditory Complexity', 0, '#3b82f6')}
          {chart('Visual Stimulation', 0, '#a78bfa')}
          {chart('Crowd Density', 0, '#f59e42')}
        </div>
      ) : (
        <motion.div
          className="flex gap-6 mb-4"
          initial="hidden"
          animate="visible"
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: 0.2 } },
          }}
        >
          {chart('Auditory Complexity', profile.audio, '#3b82f6')}
          {chart('Visual Stimulation', profile.visual, '#a78bfa')}
          {chart('Crowd Density', profile.crowds, '#f59e42')}
        </motion.div>
      )}
      <div className="text-gray-700 text-base text-center mt-2">
        {profile?.summary || 'Analyzing sensory profile...'}
      </div>
    </div>
  );
}