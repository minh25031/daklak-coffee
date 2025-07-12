import React from 'react';

interface BatchStatusMapType {
  [key: string]: { label: string; color: string; icon: string };
}

export const BatchStatusMap: BatchStatusMapType = {
  Active: { label: 'Đang hoạt động', color: 'green', icon: 'Đ' },
  Completed: { label: 'Hoàn thành', color: 'blue', icon: 'H' },
  Cancelled: { label: 'Đã hủy', color: 'red', icon: 'Đ' },
  Pending: { label: 'Chờ duyệt', color: 'yellow', icon: 'P' },
};

interface FilterStatusPanelProps {
  selectedStatus: string | null;
  setSelectedStatus: (value: string | null) => void;
  statusCounts: Record<string, number>;
}

function FilterBadge({ icon, label, count, color, active, onClick }: any) {
  return (
    <button
      className={`flex items-center gap-2 w-full px-3 py-2 rounded-lg border text-left transition font-medium ${
        active ? `border-${color}-500 bg-${color}-50 text-${color}-700` : 'border-transparent text-gray-700'
      }`}
      onClick={onClick}
    >
      <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold bg-${color}-100 text-${color}-700`}>
        {icon}
      </span>
      <span className="flex-1">{label}</span>
      <span className="text-xs font-semibold">{count} lô</span>
    </button>
  );
}

export default function FilterStatusPanel({ selectedStatus, setSelectedStatus, statusCounts }: FilterStatusPanelProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-4 space-y-3">
      <h2 className="text-sm font-medium text-gray-700">Lọc theo trạng thái</h2>
      <FilterBadge
        icon="Đ"
        label="Tất cả trạng thái"
        count={Object.values(statusCounts).reduce((sum, val) => sum + val, 0)}
        color="orange"
        active={selectedStatus === null}
        onClick={() => setSelectedStatus(null)}
      />
      {Object.entries(BatchStatusMap).map(([key, { label, color, icon }]) => (
        <FilterBadge
          key={key}
          icon={icon}
          label={label}
          color={color}
          count={statusCounts[key] || 0}
          active={selectedStatus === key}
          onClick={() => setSelectedStatus(key === selectedStatus ? null : key)}
        />
      ))}
    </div>
  );
} 