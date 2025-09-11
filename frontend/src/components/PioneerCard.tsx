import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { FaQuoteLeft } from "react-icons/fa";

type PioneerTrip = {
  tripTitle: string;
  destination: string;
  userName?: string;
  userAvatar?: string;
  keyInsight?: string;
};

export default function PioneerCard({ trip }: { trip: PioneerTrip }) {
  return (
    <Card className="bg-white border-0 shadow-lg rounded-xl p-6 flex flex-col min-h-[220px]">
      <CardHeader className="flex flex-row items-center gap-4 mb-2">
        <Avatar>
          {trip.userAvatar ? (
            <AvatarImage src={trip.userAvatar} alt={trip.userName || "User"} />
          ) : (
            <AvatarFallback>
              {trip.userName ? trip.userName[0] : "U"}
            </AvatarFallback>
          )}
        </Avatar>
        <div>
          <CardTitle className="text-lg font-bold">{trip.tripTitle}</CardTitle>
          <div className="text-sm text-gray-500">{trip.destination}</div>
          <div className="text-xs text-blue-500 mt-1">
            Shared by {trip.userName || "Auryvia Pioneer"}
          </div>
        </div>
      </CardHeader>
      <CardContent className="mt-2 flex items-center gap-2">
        <FaQuoteLeft className="text-blue-400 text-xl mr-2" />
        <span className="italic text-gray-