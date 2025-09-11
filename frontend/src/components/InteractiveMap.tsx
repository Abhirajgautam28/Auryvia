import { useState } from 'react';
import { APIProvider, Map } from '@vis.gl/react-google-maps';
import { motion } from 'framer-motion';
import { Switch } from '@/components/ui/switch';
import { FaToilet, FaVolumeMute } from 'react-icons/fa';

type Activity = {
  lat: number;
  lng: number;
  time: string;
  description: string;
  category: string;
};

type ReliefPoint = {
  lat: number;
  lng: number;
  type: 'restroom' | 'quiet';
  label: string;
};

type Props = {
  activities: Activity[];
  apiKey: string;
  hoveredIdx: number | null;
  selectedIdx: number | null;
  onMarkerClick: (idx: number) => void;
};

const mockReliefPoints: ReliefPoint[] = [
  { lat: 12.935, lng: 77.619, type: 'restroom', label: 'Accessible Restroom - Central Park' },
  { lat: 12.938, lng: 77.622, type: 'restroom', label: 'Accessible Restroom - Museum' },
  { lat: 12.932, lng: 77.615, type: 'quiet', label: 'Quiet Zone - Library' },
  { lat: 12.936, lng: 77.617, type: 'quiet', label: 'Quiet Zone - Botanical Garden' },
];

export default function InteractiveMap({
  activities,
  apiKey,
  hoveredIdx,
  selectedIdx,
  onMarkerClick,
}: Props) {
  const [showRestrooms, setShowRestrooms] = useState(false);
  const [showQuietZones, setShowQuietZones] = useState(false);

  if (!activities || activities.length === 0) return null;
  const center = { lat: activities[0].lat, lng: activities[0].lng };

  return (
    <div className="w-full h-full relative">
      {/* Relief View Toggle UI */}
      <div className="absolute top-4 left-4 z-20 bg-white/90 rounded-xl shadow-lg p-4 flex flex-col gap-4">
        <label className="flex items-center gap-2">
          <Switch checked={showRestrooms} onCheckedChange={setShowRestrooms} />
          <FaToilet className="text-blue-500" />
          <span className="text-sm font-medium text-slate-700">Accessible Restrooms</span>
        </label>
        <label className="flex items-center gap-2">
          <Switch checked={showQuietZones} onCheckedChange={setShowQuietZones} />
          <FaVolumeMute className="text-purple-500" />
          <span className="text-sm font-medium text-slate-700">Quiet Zones</span>
        </label>
      </div>
      <APIProvider apiKey={apiKey}>
        <Map
          style={{ width: '100%', height: '100%' }}
          center={center}
          zoom={13}
          disableDefaultUI={false}
        >
          {/* Activity markers */}
          {activities.map((activity, idx) => {
            const isHovered = hoveredIdx === idx;
            const isSelected = selectedIdx === idx;
            return (
              <motion.div
                key={idx}
                style={{
                  position: 'absolute',
                  left: `${activity.lng}%`,
                  top: `${activity.lat}%`,
                  transform: 'translate(-50%, -100%)',
                  pointerEvents: 'auto',
                  zIndex: isSelected ? 10 : 2,
                  cursor: 'pointer',
                }}
                animate={{
                  scale: isHovered || isSelected ? 1.5 : 1,
                  filter: isSelected
                    ? 'drop-shadow(0 0 8px #38bdf8)'
                    : isHovered
                    ? 'drop-shadow(0 0 4px #818cf8)'
                    : 'none',
                }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                onClick={() => onMarkerClick(idx)}
              >
                <svg width="32" height="32" viewBox="0 0 24 24" fill={isSelected ? "#38bdf8" : isHovered ? "#818cf8" : "red"} xmlns="http://www.w3.org/2000/svg">
                  <circle cx="12" cy="12" r="10" />
                </svg>
              </motion.div>
            );
          })}
          {/* Relief View markers */}
          {showRestrooms &&
            mockReliefPoints
              .filter(p => p.type === 'restroom')
              .map((p, idx) => (
                <motion.div
                  key={`restroom-${idx}`}
                  style={{
                    position: 'absolute',
                    left: `${p.lng}%`,
                    top: `${p.lat}%`,
                    transform: 'translate(-50%, -100%)',
                    pointerEvents: 'auto',
                    zIndex: 5,
                  }}
                  animate={{ scale: 1.2 }}
                  transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                  title={p.label}
                >
                  <FaToilet className="text-blue-500 text-2xl" />
                </motion.div>
              ))}
          {showQuietZones &&
            mockReliefPoints
              .filter(p => p.type === 'quiet')
              .map((p, idx) => (
                <motion.div
                  key={`quiet-${idx}`}
                  style={{
                    position: 'absolute',
                    left: `${p.lng}%`,
                    top: `${p.lat}%`,
                    transform: 'translate(-50%, -100%)',
                    pointerEvents: 'auto',
                    zIndex: 5,
                  }}
                  animate={{ scale: 1.2 }}
                  transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                  title={p.label}
                >
                  <FaVolumeMute className="text-purple-500 text-2xl" />
                </motion.div>
              ))}
        </Map>
      </APIProvider>
    </div>
  );
}