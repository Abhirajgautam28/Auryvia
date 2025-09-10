type Activity = {
  time: string;
  description: string;
  category: string;
};

// The component itself
export default function ActivityCard({ activity }: { activity: Activity }) {
  return (
    <div className="p-4 bg-slate-800 border border-slate-700 rounded-lg flex items-center gap-4">
      <div className="text-lg">⏰</div> {/* We can replace this with a real icon later! */}
      <div>
        <p className="font-bold">{activity.time}</p>
        <p className="text-slate-300">{activity.description}</p>
        <p className="text-xs text-blue-400 mt-1">{activity.category}</p>
      </div>
    </div>
  );
}