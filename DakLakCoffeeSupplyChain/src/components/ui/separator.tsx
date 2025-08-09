import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const separatorVariants = cva(
    "shrink-0 bg-orange-200",
    {
        variants: {
            orientation: {
                horizontal: "h-[1px] w-full",
                vertical: "h-full w-[1px]",
            },
        },
        defaultVariants: {
            orientation: "horizontal",
        },
    }
)

export interface SeparatorProps
    extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof separatorVariants> { }

const Separator = React.forwardRef<HTMLDivElement, SeparatorProps>(
    ({ className, orientation, ...props }, ref) => (
        <div
            ref={ref}
            {...props}
            className={cn(separatorVariants({ orientation }), className)}
        />
    )
)
Separator.displayName = "Separator"

export { Separator }
