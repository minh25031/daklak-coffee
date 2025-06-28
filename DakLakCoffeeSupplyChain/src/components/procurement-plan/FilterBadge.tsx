import { cn } from '@/lib/utils';

interface FilterBadgeProps {
    icon: string;
    label: string;
    count: number;
    color: string;
    active?: boolean;
    onClick?: () => void;
}

export default function FilterBadge({ icon, label, count, color, active = false, onClick }: FilterBadgeProps) {
    return (
        <div
            className={cn(
                'flex items-center justify-between px-3 py-2 rounded-lg border cursor-pointer',
                active ? 'border-[#FD7622] bg-orange-50' : 'border-gray-200 bg-white hover:bg-gray-50'
            )}
            onClick={onClick}
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
                <span className="text-xs font-medium">{label}</span>
            </div>
            <span className="text-sm text-gray-500">{count} kế hoạch</span>
        </div>
    );
}
