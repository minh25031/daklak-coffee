"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "file:text-foreground placeholder:text-gray-500 selection:bg-orange-200 selection:text-orange-900 border-orange-200 flex h-9 w-full min-w-0 rounded-lg border bg-white px-3 py-2 text-sm shadow-sm transition-all duration-200 outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
        "focus-visible:border-orange-500 focus-visible:ring-2 focus-visible:ring-orange-500/50 focus-visible:ring-offset-2",
        "aria-invalid:ring-red-500/20 aria-invalid:border-red-500",
        "hover:border-orange-300",
        className
      )}
      {...props}
    />
  );
}

export { Input };
