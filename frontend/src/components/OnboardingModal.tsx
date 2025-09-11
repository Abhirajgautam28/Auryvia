'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { auth } from '@/lib/firebase';
import { getAuth } from 'firebase/auth';
import { motion, AnimatePresence } from 'framer-motion';

type MobilityPrefs = {
  wheelchair: boolean;
  avoidStairs: boolean;
  frequentRests: boolean;
};

type SensoryPrefs = {
  noise: number;
  visual: number;
};

export default function OnboardingModal({ onComplete }: { onComplete: () => void }) {
  const [step, setStep] = useState(0);
  const [mobility, setMobility] = useState<MobilityPrefs>({
    wheelchair: false,
    avoidStairs: false,
    frequentRests: false,
  });
  const [sensory, setSensory] = useState<SensoryPrefs>({ noise: 0, visual: 0 });
  const [dietary, setDietary] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [saving, setSaving] = useState(false);

  const user = getAuth(auth).currentUser;

  const saveProfile = async () => {
    if (!user) return;
    setSaving(true);
    const idToken = await user.getIdToken();
    await fetch('http://localhost:8080/api/save-profile', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${idToken}`,
      },
      body: JSON.stringify({
        mobility,
        sensory,
        dietary,
      }),
    });
    setSaving(false);
    onComplete();
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -30 }}
          transition={{ duration: 0.4 }}
        >
          <Card className="w-[380px] p-6">
            <CardHeader>
              <CardTitle>
                {step === 0 && "Mobility Needs"}
                {step === 1 && "Sensory Preferences"}
                {step === 2 && "Dietary Needs"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {step === 0 && (
                <div className="flex flex-col gap-4">
                  <p className="text-slate-600 mb-2">Let us know how we can make your journey easier.</p>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={mobility.wheelchair}
                      onChange={e => setMobility(m => ({ ...m, wheelchair: e.target.checked }))}
                    />
                    Wheelchair User
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={mobility.avoidStairs}
                      onChange={e => setMobility(m => ({ ...m, avoidStairs: e.target.checked }))}
                    />
                    Avoid Stairs
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={mobility.frequentRests}
                      onChange={e => setMobility(m => ({ ...m, frequentRests: e.target.checked }))}
                    />
                    Need Frequent Rests
                  </label>
                </div>
              )}
              {step === 1 && (
                <div className="flex flex-col gap-6">
                  <p className="text-slate-600 mb-2">We’ll help you find places that match your comfort.</p>
                  <div>
                    <label className="block mb-1 font-medium">Noise Levels</label>
                    <input
                      type="range"
                      min={0}
                      max={100}
                      value={sensory.noise}
                      onChange={e => setSensory(s => ({ ...s, noise: Number(e.target.value) }))}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs mt-1 text-slate-500">
                      <span>Prefer Quiet</span>
                      <span>Can Handle Crowds</span>
                    </div>
                  </div>
                  <div>
                    <label className="block mb-1 font-medium">Visual Stimulation</label>
                    <input
                      type="range"
                      min={0}
                      max={100}
                      value={sensory.visual}
                      onChange={e => setSensory(s => ({ ...s, visual: Number(e.target.value) }))}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs mt-1 text-slate-500">
                      <span>Prefer Calm</span>
                      <span>Love Vibrant</span>
                    </div>
                  </div>
                </div>
              )}
              {step === 2 && (
                <div className="flex flex-col gap-4">
                  <p className="text-slate-600 mb-2">Let us know about any allergies or dietary restrictions.</p>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={tagInput}
                      onChange={e => setTagInput(e.target.value)}
                      className="border rounded px-2 py-1 flex-1"
                      placeholder="e.g. gluten, peanuts"
                      onKeyDown={e => {
                        if (e.key === 'Enter' && tagInput.trim()) {
                          setDietary([...dietary, tagInput.trim()]);
                          setTagInput('');
                          e.preventDefault();
                        }
                      }}
                    />
                    <Button
                      size="sm"
                      onClick={() => {
                        if (tagInput.trim()) {
                          setDietary([...dietary, tagInput.trim()]);
                          setTagInput('');
                        }
                      }}
                    >
                      Add
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {dietary.map((tag, idx) => (
                      <span key={idx} className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm flex items-center gap-1">
                        {tag}
                        <button
                          type="button"
                          className="ml-1 text-xs text-blue-700"
                          onClick={() => setDietary(dietary.filter((_, i) => i !== idx))}
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
            <div className="flex justify-between mt-6">
              {step > 0 ? (
                <Button variant="ghost" onClick={() => setStep(step - 1)}>
                  Back
                </Button>
              ) : <span />}
              {step < 2 ? (
                <Button onClick={() => setStep(step + 1)}>
                  Next
                </Button>
              ) : (
                <Button onClick={saveProfile} disabled={saving}>
                  {saving ? 'Saving...' : 'Finish'}
                </Button>
              )}
            </div>
          </Card>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}