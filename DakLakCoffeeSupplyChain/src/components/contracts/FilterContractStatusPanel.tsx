import { ContractStatusMap, ContractStatusValue } from '@/lib/constants/contractStatus';
import FilterBadge from '../crop-seasons/FilterBadge';

interface FilterContractStatusPanelProps {
  selectedStatus: string | null;
  setSelectedStatus: (value: string | null) => void;
  statusCounts: Record<string, number>;
}

export default function FilterContractStatusPanel({
  selectedStatus,
  setSelectedStatus,
  statusCounts,
}: FilterContractStatusPanelProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-4 space-y-3">
      <h2 className="text-sm font-medium text-gray-700">Lọc theo trạng thái</h2>

      <FilterBadge
        icon="📄"
        label="Tất cả trạng thái"
        count={Object.values(statusCounts).reduce((sum, val) => sum + val, 0)}
        color="orange"
        active={selectedStatus === null}
        onClick={() => setSelectedStatus(null)}
      />

      {/* Chỉ hiển thị các trạng thái cần thiết */}
      {[
        { key: "NotStarted", ...ContractStatusMap.NotStarted },
        { key: "InProgress", ...ContractStatusMap.InProgress },
        { key: "Completed", ...ContractStatusMap.Completed },
        { key: "Cancelled", ...ContractStatusMap.Cancelled },
        { key: "Expired", ...ContractStatusMap.Expired },
      ].map(({ key, label, color, icon }) => (
        <FilterBadge
          key={key}
          icon={icon}
          label={label}
          color={color}
          count={statusCounts[key as ContractStatusValue] || 0}
          active={selectedStatus === key}
          onClick={() => setSelectedStatus(key === selectedStatus ? null : key)}
        />
      ))}
    </div>
  );
}
