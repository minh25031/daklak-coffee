"use client";
import React from "react";
import {
  ProcessingStatusMap,
  ProcessingStatus,
} from "@/lib/constants/batchStatus";

interface StatusBadgeProps {
  status: number | string;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  // Đảm bảo status là number
  const numericStatus = typeof status === 'string' ? parseInt(status, 10) : status;
  
  // Sử dụng switch case để đảm bảo mapping đúng
  let info;
  switch (numericStatus) {
    case ProcessingStatus.NotStarted:
      info = ProcessingStatusMap[ProcessingStatus.NotStarted];
      break;
    case ProcessingStatus.InProgress:
      info = ProcessingStatusMap[ProcessingStatus.InProgress];
      break;
    case ProcessingStatus.Completed:
      info = ProcessingStatusMap[ProcessingStatus.Completed];
      break;
    case ProcessingStatus.AwaitingEvaluation:
      info = ProcessingStatusMap[ProcessingStatus.AwaitingEvaluation];
      break;
    case ProcessingStatus.Cancelled:
      info = ProcessingStatusMap[ProcessingStatus.Cancelled];
      break;
    default:
      info = null;
  }

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
