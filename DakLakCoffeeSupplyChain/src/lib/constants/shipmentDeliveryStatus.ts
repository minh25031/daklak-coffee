// lib/constants/shipmentDeliveryStatus.ts

export type ShipmentDeliveryStatusValue =
  | "Pending"
  | "InTransit"
  | "Delivered"
  | "Failed"
  | "Returned"
  | "Canceled";

export const ShipmentDeliveryStatusMap: Record<
  ShipmentDeliveryStatusValue,
  { label: string; color: string; icon: string }
> = {
  Pending: { label: "Đang chờ", color: "gray", icon: "⏳" },
  InTransit: { label: "Đang giao", color: "purple", icon: "🚚" },
  Delivered: { label: "Đã giao", color: "green", icon: "✅" },
  Failed: { label: "Thất bại", color: "red", icon: "❌" },
  Returned: { label: "Hoàn trả", color: "orange", icon: "↩️" },
  Canceled: { label: "Đã huỷ", color: "red", icon: "🛑" },
};

