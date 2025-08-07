import {
  Clock4,
  Loader2,
  CheckCircle,
  XCircle,
  LucideIcon,
} from "lucide-react";

export enum ProcessingStatus {
  NotStarted = 0,
  InProgress = 1,
  Completed = 2,
  Cancelled = 3,
}

export interface ProcessingStatusInfo {
  label: string;
  icon: LucideIcon;
  bgClass: string;
  textClass: string;
}

export const ProcessingStatusMap: Record<
  ProcessingStatus,
  ProcessingStatusInfo
> = {
  [ProcessingStatus.NotStarted]: {
    label: "Chưa bắt đầu",
    icon: Clock4, // đồng hồ
    bgClass: "bg-yellow-100",
    textClass: "text-yellow-800",
  },
  [ProcessingStatus.InProgress]: {
    label: "Đang xử lý",
    icon: Loader2, // vòng quay xử lý
    bgClass: "bg-blue-100",
    textClass: "text-blue-800",
  },
  [ProcessingStatus.Completed]: {
    label: "Hoàn thành",
    icon: CheckCircle,
    bgClass: "bg-green-100",
    textClass: "text-green-800",
  },
  [ProcessingStatus.Cancelled]: {
    label: "Đã huỷ",
    icon: XCircle,
    bgClass: "bg-red-100",
    textClass: "text-red-800",
  },
};
