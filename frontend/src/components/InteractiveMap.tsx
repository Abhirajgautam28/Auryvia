'use client';

import { GoogleMap, Marker, useApiIsLoaded } from '@vis.gl/react-google-maps';

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
  const isLoaded = useApiIsLoaded();

  if (!activities || activities.length === 0) return null;
  const center = { lat: activities[0].lat, lng: activities[0].lng };

  return (
    <div className="w-full h-[400px] mb-8 rounded-lg overflow-hidden border border-slate-700">
      <GoogleMap
        apiKey={apiKey}
        style={{ width: '100%', height: '100%' }}
        center={center}
        zoom={13}
        disableDefaultUI={false}
      >
        {activities.map((activity, idx) => (
          <Marker
            key={idx}
            position={{ lat: activity.lat, lng: activity.lng }}
            title={activity.description}
          />
        ))}
      </GoogleMap>
    </div>
  );
}