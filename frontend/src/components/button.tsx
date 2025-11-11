import * as React from "react";
import { cn } from "@/lib/utils";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline";
}

export function Button({ children, variant = "default", className, ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        "px-4 py-2 rounded-md transition font-medium flex items-center justify-center",
        variant === "default" && "bg-[var(--primary)] text-[var(--primary-foreground)] hover:opacity-90",
        variant === "outline" && "border border-gray-300 bg-transparent hover:bg-gray-100",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
