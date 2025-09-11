
import { APIProvider, Map } from '@vis.gl/react-google-maps';

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
};

export default function InteractiveMap({ activities, apiKey }: Props) {
  if (!activities || activities.length === 0) return null;
  const center = { lat: activities[0].lat, lng: activities[0].lng };

  return (
    <div className="w-full h-[400px] mb-8 rounded-lg overflow-hidden border border-slate-700">
      <APIProvider apiKey={apiKey}>
        <Map
          style={{ width: '100%', height: '100%' }}
          center={center}
          zoom={13}
          disableDefaultUI={false}
        >
          {/* Render markers using native Google Maps API */}
          {activities.map((activity, idx) => (
            <div
              key={idx}
              style={{
                position: 'absolute',
                left: `${activity.lng}%`,
                top: `${activity.lat}%`,
                transform: 'translate(-50%, -100%)',
                pointerEvents: 'none',
                zIndex: 2,
              }}
              title={activity.description}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="red" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="10" />
              </svg>
            </div>
          ))}
        </Map>
      </APIProvider>
    </div>
  );
}