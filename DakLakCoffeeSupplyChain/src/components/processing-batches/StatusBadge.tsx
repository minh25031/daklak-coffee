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
  // Debug: Log status để xem giá trị thực tế
  console.log("🔍 StatusBadge received status:", status, "type:", typeof status);
  
  // Xử lý status có thể là string hoặc number
  let statusString: string;
  if (typeof status === 'number') {
    // Nếu là number, chuyển đổi theo mapping
    switch (status) {
      case 0: statusString = ProcessingStatus.NotStarted; break;
      case 1: statusString = ProcessingStatus.InProgress; break;
      case 2: statusString = ProcessingStatus.Completed; break;
      case 3: statusString = ProcessingStatus.AwaitingEvaluation; break;
      case 4: statusString = ProcessingStatus.Cancelled; break;
      default: statusString = status.toString();
    }
  } else {
    statusString = status;
  }
  
  console.log("🔍 Converted statusString:", statusString);
  console.log("🔍 Available enum values:", Object.values(ProcessingStatus));
  
  // Kiểm tra xem status có trong enum không
  const isValidStatus = Object.values(ProcessingStatus).includes(statusString as ProcessingStatus);
  
  console.log("🔍 Is valid status:", isValidStatus);
  
  if (!isValidStatus) {
    return (
      <span className="px-2 py-1 rounded text-xs font-semibold bg-gray-100 text-gray-700">
        Không xác định ({statusString})
      </span>
    );
  }

  const info = ProcessingStatusMap[statusString as ProcessingStatus];



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
