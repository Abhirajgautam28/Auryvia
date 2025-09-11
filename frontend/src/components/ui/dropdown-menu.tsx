import * as React from "react";
import { cn } from "@/lib/utils";

export function DropdownMenu({ children }: { children: React.ReactNode }) {
  return <div className="relative inline-block">{children}</div>;
}

export function DropdownMenuTrigger({ asChild, children }: { asChild?: boolean; children: React.ReactNode }) {
  return <>{children}</>;
}

export function DropdownMenuContent({ children }: { children: React.ReactNode }) {
  return (
    <div className="absolute left-0 mt-2 w-56 bg-white border border-gray-200 rounded-xl shadow-lg z-50">
      {children}
    </div>
  );
}

export function DropdownMenuCheckboxItem({ checked, onCheckedChange, children }: { checked?: boolean; onCheckedChange?: (checked: boolean) => void; children: React.ReactNode }) {
  return (
    <label className="flex items-center gap-2 px-4 py-2 cursor-pointer hover:bg-gray-100">
      <input
        type="checkbox"
        checked={checked}
        onChange={e => onCheckedChange?.(e.target.checked)}
        className="form-checkbox h-4 w-4 text-blue-600 rounded"
      />
      <span className="text-gray-700 text-sm">{children}</span>
    </label>
  );
}
