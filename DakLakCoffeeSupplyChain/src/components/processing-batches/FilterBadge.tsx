import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface FilterBadgeProps {
  icon: LucideIcon;
  label: string;
  count: number;
  color: string;
  active?: boolean;
  unitLabel?: string;
  onClick?: () => void;
}

export default function FilterBadge({
  icon: Icon,
  label,
  count,
  color,
  active = false,
  unitLabel = "",
  onClick,
}: FilterBadgeProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-between px-3 py-2 rounded-lg border cursor-pointer",
        active
          ? "border-[#FD7622] bg-orange-50"
          : "border-gray-200 bg-white hover:bg-gray-50"
      )}
      onClick={onClick}
    >
      <div className="flex items-center gap-2">
        <span
          className={cn(
            "w-6 h-6 rounded-full flex items-center justify-center text-xs",
            `bg-${color}-100 text-${color}-800`
          )}
        >
          <Icon className="w-4 h-4" />
        </span>
        <span className="text-xs font-medium">{label}</span>
      </div>
      <span className="text-sm text-gray-500">
        {count} {unitLabel}
      </span>
    </div>
  );
}
