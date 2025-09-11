import { APIProvider, Map } from '@vis.gl/react-google-maps';
import { motion } from 'framer-motion';

type Activity = {
  lat: number;
  lng: number;
  time: string;
  description: string;
  category: string;
};

type Props = {
  activities: Activity[];
  apiKey: string;
  hoveredIdx: number | null;
  selectedIdx: number | null;
  onMarkerClick: (idx: number) => void;
};

export default function InteractiveMap({
  activities,
  apiKey,
  hoveredIdx,
  selectedIdx,
  onMarkerClick,
}: Props) {
  if (!activities || activities.length === 0) return null;
  const center = { lat: activities[0].lat, lng: activities[0].lng };

  return (
    <div className="w-full h-full">
      <APIProvider apiKey={apiKey}>
        <Map
          style={{ width: '100%', height: '100%' }}
          center={center}
          zoom={13}
          disableDefaultUI={false}
        >
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
        </Map>
      </APIProvider>
    </div>
  );
}