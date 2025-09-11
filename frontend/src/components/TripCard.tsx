import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { FaWheelchair, FaBrain, FaLeaf, FaPlaneDeparture } from "react-icons/fa";
import { useState } from "react";

type Trip = {
  id: string;
  tripTitle: string;
  destination: string;
  startDate?: string;
  endDate?: string;
  accessibility?: {
    mobility?: boolean;
    sensory?: boolean;
    dietary?: boolean;
  };
  imageUrl?: string;
};

export default function TripCard({
  trip,
  showChecklist,
}: {
  trip: Trip;
  showChecklist?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [checklist, setChecklist] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const handleChecklist = async () => {
    setLoading(true);
    setChecklist([]);
    const res = await fetch("http://localhost:8080/api/generate-checklist", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        destination: trip.destination,
        tripTitle: trip.tripTitle,
        accessibility: trip.accessibility,
      }),
    });
    const data = await res.json();
    setChecklist(Array.isArray(data.checklist) ? data.checklist : []);
    setLoading(false);
  };

  return (
    <Card className="overflow-hidden shadow-lg rounded-xl flex flex-col">
      <CardHeader className="p-0">
        <div className="w-full h-36 bg-gray-100 flex items-center justify-center">
          {trip.imageUrl ? (
            <img src={trip.imageUrl} alt={trip.destination} className="object-cover w-full h-full" />
          ) : (
            <img src="/globe.svg" alt="Map" className="h-20 w-20 opacity-70" />
          )}
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col justify-between p-4">
        <div>
          <CardTitle className="text-xl font-bold mb-1">{trip.tripTitle}</CardTitle>
          <div className="text-sm text-gray-600 mb-2">{trip.destination}</div>
          {trip.startDate && trip.endDate && (
            <div className="text-xs text-gray-400 mb-2">
              {trip.startDate} - {trip.endDate}
            </div>
          )}
        </div>
        <div className="flex items-center justify-between mt-4">
          <div className="flex gap-2">
            {trip.accessibility?.mobility && <FaWheelchair className="text-blue-500" title="Mobility" />}
            {trip.accessibility?.sensory && <FaBrain className="text-purple-500" title="Sensory" />}
            {trip.accessibility?.dietary && <FaLeaf className="text-green-500" title="Dietary" />}
          </div>
          {showChecklist && (
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                  onClick={handleChecklist}
                >
                  <FaPlaneDeparture />
                  Preparation Checklist
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Pre-Flight Checklist</DialogTitle>
                </DialogHeader>
                {loading ? (
                  <div className="text-center py-6 text-blue-500">Generating checklist...</div>
                ) : (
                  <ul className="list-disc pl-6 space-y-2">
                    {checklist.map((item, idx) => (
                      <li key={idx} className="text-base text-gray-700">{item}</li>
                    ))}
                  </ul>
                )}
              </DialogContent>
            </Dialog>
          )}
        </div>
      </CardContent>
    </Card>
  );
}