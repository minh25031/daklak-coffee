"use client";
import React from "react";
import {
  ProcessingStatusMap,
  ProcessingStatus,
} from "@/lib/constrant/batchStatus";

interface StatusBadgeProps {
  status: number;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const info = ProcessingStatusMap[status as ProcessingStatus];

  if (!info) {
    return (
      <span className="px-2 py-1 rounded text-xs font-semibold bg-gray-100 text-gray-700">
        Trạng thái {status}
      </span>
    );
  }

  const Icon = info.icon;

  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-semibold ${info.bgClass} ${info.textClass}`}
    >
      <Icon className="w-4 h-4" />
      {info.label}
    </span>
  );
};

export default StatusBadge;
