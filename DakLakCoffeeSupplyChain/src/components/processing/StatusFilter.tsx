"use client";

interface StatusInfo {
  label: string;
  color: string;
}

interface StatusFilterProps {
  selectedStatus: number | null;
  onStatusChange: (status: number | null) => void;
  statusCounts: Record<number, number>;
  statusInfoMap: (status: number) => StatusInfo;
  totalCount: number;
}

export default function StatusFilter({
  selectedStatus,
  onStatusChange,
  statusCounts,
  statusInfoMap,
  totalCount
}: StatusFilterProps) {
  return (
    <div className="flex gap-2 flex-wrap">
      <button
        onClick={() => onStatusChange(null)}
        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
          selectedStatus === null
            ? "bg-green-100 text-green-700 border border-green-300"
            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
        }`}
      >
        Tất cả ({totalCount})
      </button>
      
      {Object.entries(statusCounts).map(([status, count]) => {
        const statusNum = parseInt(status, 10);
        const statusInfo = statusInfoMap(statusNum);
        return (
          <button
            key={status}
            onClick={() => onStatusChange(statusNum)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              selectedStatus === statusNum
                ? "bg-green-100 text-green-700 border border-green-300"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            {statusInfo.label} ({count})
          </button>
        );
      })}
    </div>
  );
}
