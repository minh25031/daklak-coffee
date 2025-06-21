import { cn } from '@/lib/utils';

interface FilterBadgeProps {
    icon: string;
    label: string;
    count: number;
    active?: boolean;
    color: string;
    onClick?: () => void;
}

export default function FilterBadge({ icon, label, count, active = false, color, onClick }: FilterBadgeProps) {
    return (
        <div
            onClick={onClick}
            className={cn(
                'flex items-center justify-between px-3 py-2 rounded-lg border cursor-pointer transition-colors',
                active ? 'border-green-600 bg-green-50' : 'border-gray-200 hover:bg-gray-50'
            )}
        >
            <div className="flex items-center gap-2">
                <span
                    className={cn(
                        'w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold',
                        `bg-${color}-100 text-${color}-800`
                    )}
                >
                    {icon}
                </span>
                <span className="text-sm">{label}</span>
            </div>
            <span className="text-sm text-gray-500">{count} mùa vụ</span>
        </div>
    );
}
