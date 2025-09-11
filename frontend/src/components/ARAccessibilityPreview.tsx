'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { motion } from 'framer-motion';
import { FaWheelchair, FaArrowDown } from 'react-icons/fa';

export default function ARAccessibilityPreview({ imageUrl }: { imageUrl: string }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative w-full max-w-2xl mx-auto">
      <img
        src={imageUrl}
        alt="Location Preview"
        className="w-full h-96 object-cover rounded-xl shadow-lg"
      />
      <Button
        className="absolute bottom-6 right-6 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-full shadow-lg"
        onClick={() => setOpen(true)}
      >
        Launch AR Preview
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="p-0 max-w-full max-h-full bg-transparent">
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
            <div className="relative w-full h-full flex items-center justify-center">
              <img
                src={imageUrl}
                alt="AR Location"
                className="absolute inset-0 w-full h-full object-cover"
                style={{ zIndex: 1 }}
              />
              {/* AR Icons and Labels */}
              <motion.div
                initial={{ opacity: 0, x: -100, y: 100 }}
                animate={{ opacity: 1, x: 80, y: 120 }}
                transition={{ delay: 0.5, duration: 0.7, type: 'spring' }}
                className="absolute"
                style={{ left: '10%', top: '60%', zIndex: 2 }}
              >
                <FaArrowDown className="text-green-400 text-5xl drop-shadow-lg" />
                <span className="block mt-2 text-white font-bold bg-green-600/80 px-3 py-1 rounded-lg shadow-lg text-lg">
                  Ramp Here
                </span>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, scale: 0.5, x: 100, y: 0 }}
                animate={{ opacity: 1, scale: 1, x: 220, y: 40 }}
                transition={{ delay: 0.8, duration: 0.7, type: 'spring' }}
                className="absolute"
                style={{ left: '60%', top: '40%', zIndex: 2 }}
              >
                <FaWheelchair className="text-blue-500 text-6xl drop-shadow-lg" />
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.2, duration: 0.7 }}
                  className="block mt-2 text-white font-bold bg-blue-600/80 px-4 py-2 rounded-lg shadow-lg text-lg"
                >
                  Step-Free Entrance
                </motion.span>
              </motion.div>
              {/* Close Button */}
              <Button
                className="absolute top-8 right-8 bg-white text-blue-600 font-bold px-4 py-2 rounded-full shadow-lg"
                onClick={() => setOpen(false)}
              >
                Close
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}