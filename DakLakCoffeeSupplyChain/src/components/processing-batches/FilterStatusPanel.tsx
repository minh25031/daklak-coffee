"use client";
import React from "react";
import { PackageSearch } from "lucide-react";
import FilterBadge from "./FilterBadge";
import {
  ProcessingStatusMap,
  ProcessingStatus,
} from "@/lib/constants/batchStatus";

interface FilterStatusPanelProps {
  selectedStatus: number | null;
  setSelectedStatus: (value: number | null) => void;
  statusCounts: Record<number, number>;
}

export default function FilterStatusPanel({
  selectedStatus,
  setSelectedStatus,
  statusCounts,
}: FilterStatusPanelProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-4 space-y-3">
      <h2 className="text-sm font-medium text-gray-700">Lọc theo trạng thái</h2>

      <FilterBadge
        icon={PackageSearch}
        label="Tất cả trạng thái"
        count={Object.values(statusCounts).reduce((sum, val) => sum + val, 0)}
        color="orange"
        active={selectedStatus === null}
        onClick={() => setSelectedStatus(null)}
      />

      {Object.entries(ProcessingStatusMap).map(([keyStr, info]) => {
        const key = parseInt(keyStr, 10);
        return (
          <FilterBadge
            key={key}
            icon={info.icon}
            label={info.label}
            color={info.bgClass.replace("bg-", "").replace("-100", "")}
            count={statusCounts[key] || 0}
            active={selectedStatus === key}
            onClick={() =>
              setSelectedStatus(selectedStatus === key ? null : key)
            }
          />
        );
      })}
    </div>
  );
}
