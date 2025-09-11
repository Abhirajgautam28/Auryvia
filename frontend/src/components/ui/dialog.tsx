import * as React from "react";

import { cn } from "@/lib/utils";

export function Dialog({ open, onOpenChange, children }: { open?: boolean; onOpenChange?: (open: boolean) => void; children: React.ReactNode }) {
  return (
    <div className={cn("fixed inset-0 z-50 flex items-center justify-center", open ? "" : "hidden")}
      role="dialog"
      aria-modal="true"
      onClick={() => onOpenChange?.(false)}
    >
      <div className="bg-black/40 absolute inset-0" />
      <div className="relative z-10" onClick={e => e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
}

export function DialogContent({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl shadow-xl p-8 min-w-[320px] max-w-lg mx-auto">
      {children}
    </div>
  );
}

export function DialogHeader({ children }: { children: React.ReactNode }) {
  return <div className="mb-4">{children}</div>;
}

export function DialogTitle({ children }: { children: React.ReactNode }) {
  return <h2 className="text-xl font-bold mb-2">{children}</h2>;
}

export function DialogTrigger({ asChild, children }: { asChild?: boolean; children: React.ReactNode }) {
  return <>{children}</>;
}
