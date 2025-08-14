import { cn } from '@/lib/utils';

interface FilterBadgeProps {
  icon: string;
  label: string;
  count: number;
  color: string;
  active?: boolean;
  unitLabel?: string;
  onClick?: () => void;
}

export default function FilterBadge({
  icon,
  label,
  count,
  color,
  active = false,
  unitLabel = '',
  onClick,
}: FilterBadgeProps) {
  const getColorClasses = (color: string, active: boolean) => {
    const colorMap: Record<string, { bg: string; text: string; border: string; hover: string }> = {
      orange: {
        bg: active ? 'bg-orange-100' : 'bg-white',
        text: active ? 'text-orange-800' : 'text-gray-700',
        border: active ? 'border-orange-300' : 'border-orange-200',
        hover: 'hover:bg-orange-50'
      },
      green: {
        bg: active ? 'bg-green-100' : 'bg-white',
        text: active ? 'text-green-800' : 'text-gray-700',
        border: active ? 'border-green-300' : 'border-green-200',
        hover: 'hover:bg-green-50'
      },
      yellow: {
        bg: active ? 'bg-yellow-100' : 'bg-white',
        text: active ? 'text-yellow-800' : 'text-gray-700',
        border: active ? 'border-yellow-300' : 'border-yellow-200',
        hover: 'hover:bg-yellow-50'
      },
      red: {
        bg: active ? 'bg-red-100' : 'bg-white',
        text: active ? 'text-red-800' : 'text-gray-700',
        border: active ? 'border-red-300' : 'border-red-200',
        hover: 'hover:bg-red-50'
      },
      blue: {
        bg: active ? 'bg-blue-100' : 'bg-white',
        text: active ? 'text-blue-800' : 'text-gray-700',
        border: active ? 'border-blue-300' : 'border-blue-200',
        hover: 'hover:bg-blue-50'
      },
      purple: {
        bg: active ? 'bg-purple-100' : 'bg-white',
        text: active ? 'text-purple-800' : 'text-gray-700',
        border: active ? 'border-purple-300' : 'border-purple-200',
        hover: 'hover:bg-purple-50'
      }
    };

    return colorMap[color] || colorMap.orange;
  };

  const colors = getColorClasses(color, active);

  return (
    <div
      className={cn(
        'flex items-center justify-between px-3 py-2 rounded-lg border cursor-pointer transition-all duration-200 shadow-sm',
        colors.bg,
        colors.border,
        colors.text,
        !active && colors.hover,
        active && 'shadow-md'
      )}
      onClick={onClick}
    >
      <div className="flex items-center gap-2">
        <span
          className={cn(
            'w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-200',
            active
              ? `bg-${color}-500 text-white`
              : `bg-${color}-100 text-${color}-700`
          )}
        >
          {icon}
        </span>
        <span className="font-medium text-xs">{label}</span>
      </div>
      <span className={cn(
        'text-xs font-semibold px-2 py-1 rounded-full',
        active
          ? `bg-${color}-200 text-${color}-800`
          : 'bg-gray-100 text-gray-600'
      )}>
        {count} {unitLabel}
      </span>
    </div>
  );
}
