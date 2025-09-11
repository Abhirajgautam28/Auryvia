import { motion } from 'framer-motion';

type Activity = {
  time: string;
  description: string;
  category: string;
};

type ActivityCardProps = {
  activity: Activity;
  isHovered?: boolean;
  isSelected?: boolean;
  onHover?: () => void;
  onUnhover?: () => void;
  refProp?: React.Ref<HTMLDivElement>;
};

export default function ActivityCard({
  activity,
  isHovered,
  isSelected,
  onHover,
  onUnhover,
  refProp,
}: ActivityCardProps) {
  return (
    <motion.div
      ref={refProp}
      className="p-4 bg-slate-800 border border-slate-700 rounded-lg flex items-center gap-4 cursor-pointer"
      initial={false}
      animate={{
        backgroundColor: isSelected
          ? "#38bdf8"
          : isHovered
          ? "#818cf8"
          : "#1e293b",
        boxShadow: isSelected
          ? "0 0 24px #38bdf8"
          : isHovered
          ? "0 0 12px #818cf8"
          : "none",
        color: isSelected || isHovered ? "#fff" : undefined,
      }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      onMouseEnter={onHover}
      onMouseLeave={onUnhover}
    >
      <div className="text-lg">⏰</div>
      <div>
        <p className="font-bold">{activity.time}</p>
        <p className="text-slate-300">{activity.description}</p>
        <p className="text-xs text-blue-400 mt-1">{activity.category}</p>
      </div>
    </motion.div>
  );
}