// lib/constants/productStatus.ts

export type ProductStatusValue =
  | "Draft"
  | "Pending"
  | "Approved"
  | "Rejected"
  | "InStock"
  | "OutOfStock"
  | "Archived";

export const ProductStatusMap: Record<
  ProductStatusValue,
  { label: string; color: string; icon: string }
> = {
  Draft: { label: "Bản nháp", color: "gray", icon: "📝" },
  Pending: { label: "Chờ duyệt", color: "yellow", icon: "⏳" },
  Approved: { label: "Đã duyệt", color: "green", icon: "✅" },
  Rejected: { label: "Bị từ chối", color: "red", icon: "❌" },
  InStock: { label: "Còn hàng", color: "blue", icon: "📦" },
  OutOfStock: { label: "Hết hàng", color: "orange", icon: "🚫" },
  Archived: { label: "Ngừng kinh doanh", color: "gray", icon: "📁" },
};


