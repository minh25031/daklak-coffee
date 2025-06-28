import { ProcurementPlanStatusMap, ProcurementPlanStatusValue } from '@/lib/constrant/procurementPlanStatus';
import FilterBadge from './FilterBadge';

interface FilterStatusPanelProps {
    selectedStatus: string | null;
    setSelectedStatus: (value: string | null) => void;
    statusCounts: Record<ProcurementPlanStatusValue, number>;
}

export default function FilterStatusPanel({ selectedStatus, setSelectedStatus, statusCounts }: FilterStatusPanelProps) {
    return (
        <div className="bg-white rounded-xl shadow-sm p-4 space-y-3">
            <h2 className="text-sm font-medium text-gray-700">Lọc theo trạng thái</h2>
            {Object.entries(ProcurementPlanStatusMap).map(([key, { label, color, icon }]) => (
                <FilterBadge
                    key={key}
                    icon={icon}
                    label={label}
                    color={color}
                    count={statusCounts[key as ProcurementPlanStatusValue]}
                    active={selectedStatus === key}
                    onClick={() => setSelectedStatus(key === selectedStatus ? null : key)}
                />
            ))}
        </div>
    );
}
