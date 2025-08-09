import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
    "inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:ring-offset-2",
    {
        variants: {
            variant: {
                default: "bg-orange-100 text-orange-800 border-orange-200",
                secondary: "bg-gray-100 text-gray-700 border-gray-200",
                destructive: "bg-red-100 text-red-800 border-red-200",
                outline: "border border-orange-200 text-orange-700 bg-white",
                success: "bg-green-100 text-green-800 border-green-200",
                warning: "bg-yellow-100 text-yellow-800 border-yellow-200",
                info: "bg-blue-100 text-blue-800 border-blue-200",
            },
        },
        defaultVariants: {
            variant: "default",
        },
    }
)

export interface BadgeProps
    extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> { }

function Badge({ className, variant, ...props }: BadgeProps) {
    return (
        <div className={cn(badgeVariants({ variant }), className)} {...props} />
    )
}

export { Badge, badgeVariants }
