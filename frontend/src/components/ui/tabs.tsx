import * as React from "react";
import { cn } from "@/lib/utils";

export function Tabs({ defaultValue, className, children }: { defaultValue?: string; className?: string; children: React.ReactNode }) {
  const [value, setValue] = React.useState(defaultValue || "");
  return (
    <div className={cn("w-full", className)}>
      {React.Children.map(children, child => {
        if (React.isValidElement(child) && child.type === TabsList) {
          return React.cloneElement(child, { value, setValue });
        }
        if (React.isValidElement(child) && child.type === TabsContent) {
          return value === child.props.value ? child : null;
        }
        return child;
      })}
    </div>
  );
}

export function TabsList({ children, value, setValue, className }: { children: React.ReactNode; value?: string; setValue?: (v: string) => void; className?: string }) {
  return (
    <div className={cn("flex gap-2", className)}>
      {React.Children.map(children, child => {
        if (React.isValidElement(child) && child.type === TabsTrigger) {
          return React.cloneElement(child, { active: value === child.props.value, onClick: () => setValue?.(child.props.value) });
        }
        return child;
      })}
    </div>
  );
}

export function TabsTrigger({ value, children, active, onClick, className }: { value: string; children: React.ReactNode; active?: boolean; onClick?: () => void; className?: string }) {
  return (
    <button
      className={cn(
        "px-4 py-2 rounded-lg font-semibold transition-all",
        active ? "bg-blue-500 text-white shadow" : "bg-gray-200 text-gray-700",
        className
      )}
      onClick={onClick}
      type="button"
    >
      {children}
    </button>
  );
}

export function TabsContent({ value, children, className }: { value: string; children: React.ReactNode; className?: string }) {
  return <div className={cn("mt-2", className)}>{children}</div>;
}
