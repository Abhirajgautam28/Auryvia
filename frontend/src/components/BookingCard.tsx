type BookingData = {
  flights: {
    airline: string;
    price: number;
  };
  hotels: {
    name: string;
    price_per_night: number;
  };
};

export default function BookingCard({ data }: { data: BookingData }) {
  return (
    <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 mt-6 shadow-lg flex flex-col items-center max-w-md mx-auto">
      <h3 className="text-2xl font-bold mb-4 text-blue-400">Prices from...</h3>
      <div className="w-full mb-4">
        <div className="mb-2">
          <span className="font-semibold text-white">Flight:</span>
          <span className="ml-2 text-slate-300">{data.flights.airline}</span>
          <span className="ml-2 text-green-400 font-bold">₹{data.flights.price}</span>
        </div>
        <div>
          <span className="font-semibold text-white">Hotel:</span>
          <span className="ml-2 text-slate-300">{data.hotels.name}</span>
          <span className="ml-2 text-green-400 font-bold">₹{data.hotels.price_per_night}/night</span>
        </div>
      </div>
      <button
        className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-6 rounded-lg shadow transition mt-2"
        disabled
      >
        Book Now
      </button>
    </div>
  );
}