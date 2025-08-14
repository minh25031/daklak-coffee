// lib/constants/productStatus.ts

export enum ProductStatus {
  Draft = "Draft",
  Pending = "Pending",
  Approved = "Approved",
  Rejected = "Rejected",
  InStock = "InStock",
  OutOfStock = "OutOfStock",
  Archived = "Archived",
}

export type ProductStatusValue = keyof typeof ProductStatus;

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

export const ProductStatusLabel: Record<ProductStatusValue, string> = {
  Draft: "Bản nháp",
  Pending: "Chờ duyệt",
  Approved: "Đã duyệt",
  Rejected: "Bị từ chối",
  InStock: "Còn hàng",
  OutOfStock: "Hết hàng",
  Archived: "Ngừng kinh doanh",
};


