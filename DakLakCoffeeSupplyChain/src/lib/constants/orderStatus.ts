// lib/constants/orderStatus.ts

// ENUM: Trạng thái đơn hàng
export enum OrderStatus {
  Pending = "Pending",       // Đơn hàng mới tạo, chưa xử lý
  Preparing = "Preparing",   // Đang chuẩn bị giao (xuất kho, đóng gói)
  Shipped = "Shipped",       // Đã xuất hàng
  Delivered = "Delivered",   // Giao hàng hoàn tất
  Cancelled = "Cancelled",   // Bị huỷ do lý do nội bộ hoặc khách
  Failed = "Failed",         // Giao hàng thất bại
}

// MAP: OrderStatus -> nhãn hiển thị (tiếng Việt)
export const OrderStatusLabel: Record<OrderStatus, string> = {
  [OrderStatus.Pending]: "Chờ xử lý",
  [OrderStatus.Preparing]: "Đang chuẩn bị",
  [OrderStatus.Shipped]: "Đã xuất hàng",
  [OrderStatus.Delivered]: "Đã giao hàng",
  [OrderStatus.Cancelled]: "Đã huỷ",
  [OrderStatus.Failed]: "Giao thất bại",
};

// MAP: OrderStatus -> lớp Tailwind cho badge trạng thái
export const OrderStatusBadgeClass: Record<OrderStatus, string> = {
  [OrderStatus.Pending]:   "bg-slate-100 text-slate-700 border-slate-200",
  [OrderStatus.Preparing]: "bg-blue-100 text-blue-700 border-blue-200",
  [OrderStatus.Shipped]:   "bg-amber-100 text-amber-700 border-amber-200",
  [OrderStatus.Delivered]: "bg-emerald-100 text-emerald-700 border-emerald-200",
  [OrderStatus.Cancelled]: "bg-red-100 text-red-700 border-red-200",
  [OrderStatus.Failed]:    "bg-rose-100 text-rose-700 border-rose-200",
};

// MAP: OrderStatus | "ALL" -> thông tin hiển thị (label/color/icon) dùng cho filter & UI
export const orderStatusDisplayMap: Record<
  OrderStatus | "ALL",
  {
    label: string;
    color: string;
    icon: string;
  }
> = {
  ALL: {
    label: "Tất cả trạng thái",
    color: "gray",
    icon: "📋",
  },
  [OrderStatus.Pending]: {
    label: "Chờ xử lý",
    color: "purple",
    icon: "⏳",
  },
  [OrderStatus.Preparing]: {
    label: "Đang chuẩn bị",
    color: "blue",
    icon: "📦",
  },
  [OrderStatus.Shipped]: {
    label: "Đã xuất hàng",
    color: "orange",
    icon: "🚚",
  },
  [OrderStatus.Delivered]: {
    label: "Đã giao hàng",
    color: "green",
    icon: "✅",
  },
  [OrderStatus.Cancelled]: {
    label: "Đã huỷ",
    color: "red",
    icon: "❌",
  },
  [OrderStatus.Failed]: {
    label: "Giao thất bại",
    color: "rose",
    icon: "⚠️",
  },
};
