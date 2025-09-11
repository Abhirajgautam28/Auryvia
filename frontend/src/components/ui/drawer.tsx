import * as React from "react";
import { cn } from "@/lib/utils";

export function Drawer({ open, onOpenChange, children }: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
}) {
  return open ? (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center">
      <div
        className="fixed inset-0 bg-black/40 transition-opacity"
        onClick={() => onOpenChange(false)}
        aria-label="Close Drawer"
      />
      <div className="relative w-full md:max-w-md bg-white rounded-t-2xl md:rounded-2xl shadow-lg animate-slideInUp">
        {children}
      </div>
    </div>
  ) : null;
}

export function DrawerContent({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("p-0", className)}>{children}</div>;
}

export function DrawerHeader({ children }: { children: React.ReactNode }) {
  return <div className="px-6 pt-6 pb-2 border-b border-slate-100">{children}</div>;
}

export function DrawerTitle({ children, className }: { children: React.ReactNode; className?: string }) {
  return <h2 className={cn("text-xl font-bold", className)}>{children}</h2>;
}

export function DrawerClose({ children, asChild }: { children: React.ReactNode; asChild?: boolean }) {
  return asChild ? children : (
    <button className="absolute top-4 right-4 text-gray-500 hover:text-gray-700" aria-label="Close Drawer">
      {children}
    </button>
  );
}

// Add basic slide-in animation
const style = document.createElement('style');
style.innerHTML = `
@keyframes slideInUp {
  from { transform: translateY(100%); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}
.animate-slideInUp {
  animation: slideInUp 0.3s cubic-bezier(0.4,0,0.2,1);
}
`;
document.head.appendChild(style);
