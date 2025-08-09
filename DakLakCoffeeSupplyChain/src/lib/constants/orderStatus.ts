// lib/constants/orderStatus.ts

export enum OrderStatus {
  Pending = "Pending",       // Đơn hàng mới tạo, chưa xử lý
  Preparing = "Preparing",   // Đang chuẩn bị giao (xuất kho, đóng gói)
  Shipped = "Shipped",       // Đã xuất hàng
  Delivered = "Delivered",   // Giao hàng hoàn tất
  Cancelled = "Cancelled",   // Bị huỷ do lý do nội bộ hoặc khách
  Failed = "Failed",         // Giao hàng thất bại
}

// Ánh xạ sang tiếng Việt để hiển thị
export const OrderStatusLabel: Record<OrderStatus, string> = {
  [OrderStatus.Pending]: "Chờ xử lý",
  [OrderStatus.Preparing]: "Đang chuẩn bị",
  [OrderStatus.Shipped]: "Đã xuất hàng",
  [OrderStatus.Delivered]: "Đã giao hàng",
  [OrderStatus.Cancelled]: "Đã huỷ",
  [OrderStatus.Failed]: "Giao thất bại",
};

// Map hiển thị kèm màu & icon
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
