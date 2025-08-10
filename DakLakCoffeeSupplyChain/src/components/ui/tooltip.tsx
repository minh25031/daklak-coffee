"use client";

import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import React, { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface TooltipProps {
  content: ReactNode;
  side?: "top" | "right" | "bottom" | "left";
  align?: "start" | "center" | "end";
  children: ReactNode;
  className?: string;
}

export function Tooltip({
  content,
  side = "top",
  align = "center",
  children,
  className,
}: TooltipProps) {
  return (
    <TooltipPrimitive.Provider>
      <TooltipPrimitive.Root>
        <TooltipPrimitive.Trigger asChild>{children}</TooltipPrimitive.Trigger>
        <TooltipPrimitive.Content
          side={side}
          align={align}
          className={cn(
            "bg-gray-800 text-white text-xs rounded-lg px-3 py-2 shadow-lg z-50 select-none border border-gray-700",
            className
          )}
          sideOffset={4}
        >
          {content}
          <TooltipPrimitive.Arrow className='fill-gray-800' />
        </TooltipPrimitive.Content>
      </TooltipPrimitive.Root>
    </TooltipPrimitive.Provider>
  );
}
