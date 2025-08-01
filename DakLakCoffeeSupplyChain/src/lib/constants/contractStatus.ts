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
