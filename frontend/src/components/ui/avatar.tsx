import * as React from "react";

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string;
  alt?: string;
  children?: React.ReactNode;
}

export function Avatar({ src, alt, children, ...props }: AvatarProps) {
  return (
    <div
      {...props}
      className={
        "inline-flex items-center justify-center w-12 h-12 rounded-full bg-gray-200 overflow-hidden " +
        (props.className || "")
      }
    >
      {src ? <AvatarImage src={src} alt={alt} /> : children}
    </div>
  );
}

export function AvatarImage({ src, alt }: { src?: string; alt?: string }) {
  return (
    <img
      src={src}
      alt={alt}
      className="w-full h-full object-cover rounded-full"
      loading="lazy"
    />
  );
}

export function AvatarFallback({ children }: { children?: React.ReactNode }) {
  return (
    <span className="text-lg font-bold text-gray-500">{children}</span>
  );
}
