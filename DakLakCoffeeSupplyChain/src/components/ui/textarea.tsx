import * as React from "react"

import { cn } from "@/lib/utils"

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "border-orange-200 placeholder:text-gray-500 focus-visible:border-orange-500 focus-visible:ring-2 focus-visible:ring-orange-500/50 focus-visible:ring-offset-2 aria-invalid:ring-red-500/20 aria-invalid:border-red-500 bg-white flex field-sizing-content min-h-16 w-full rounded-lg border px-3 py-2 text-sm shadow-sm transition-all duration-200 outline-none disabled:cursor-not-allowed disabled:opacity-50 hover:border-orange-300",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }
