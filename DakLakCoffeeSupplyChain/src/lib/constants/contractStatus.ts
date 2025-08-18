// lib/constants/contractStatus.ts

export type ContractStatusValue =
  | "NotStarted"
  | "PreparingDelivery"
  | "InProgress"
  | "PartialCompleted"
  | "Completed"
  | "Cancelled"
  | "Expired";

export const ContractStatusMap: Record<ContractStatusValue, {
  label: string;
  color: string;
  icon: string;
}> = {
  NotStarted: { label: "Chưa bắt đầu", color: "gray", icon: "⏳" },
  PreparingDelivery: { label: "Chuẩn bị giao", color: "purple", icon: "📦" },
  InProgress: { label: "Đang thực hiện", color: "green", icon: "🚚" },
  PartialCompleted: { label: "Hoàn thành một phần", color: "yellow", icon: "🧩" },
  Completed: { label: "Hoàn thành", color: "blue", icon: "✅" },
  Cancelled: { label: "Đã hủy", color: "red", icon: "❌" },
  Expired: { label: "Quá hạn", color: "orange", icon: "⌛" },
};

export enum ContractStatus {
  NotStarted = "NotStarted",
  PreparingDelivery = "PreparingDelivery",
  InProgress = "InProgress",
  PartialCompleted = "PartialCompleted",
  Completed = "Completed",
  Cancelled = "Cancelled",
  Expired = "Expired",
}

// Nhãn tiếng Việt -> tên enum
export const ViLabelToStatus: Record<string, ContractStatus> = {
  "Chưa bắt đầu": ContractStatus.NotStarted,
  "Chuẩn bị giao": ContractStatus.PreparingDelivery,
  "Đang thực hiện": ContractStatus.InProgress,
  "Hoàn thành một phần": ContractStatus.PartialCompleted,
  "Hoàn thành": ContractStatus.Completed,
  "Đã hủy": ContractStatus.Cancelled,
  "Quá hạn": ContractStatus.Expired,
};

// Chuẩn hoá giá trị để gửi lên API (form-data)
export function normalizeStatusForApi(input: string | ContractStatus): string {
  // Nếu đã là tên enum -> dùng luôn
  if ((Object.values(ContractStatus) as string[]).includes(input as string)) {
    return input as string; // "InProgress", "Cancelled", ...
  }
  // Nếu là nhãn TV -> map sang tên enum
  const mapped = ViLabelToStatus[input];
  return (mapped ?? ContractStatus.NotStarted) as string;
}

export function convertEnumStatusToApi(
  status: ContractStatus
): "open" | "in_progress" | "completed" {
  switch (status) {
    case ContractStatus.NotStarted:
    case ContractStatus.PreparingDelivery:
      return "open";
    case ContractStatus.InProgress:
    case ContractStatus.PartialCompleted:
      return "in_progress";
    case ContractStatus.Completed:
      return "completed";
    default:
      return "open"; // fallback
  }
}