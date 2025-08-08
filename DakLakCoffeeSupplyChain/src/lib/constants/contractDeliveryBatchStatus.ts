// lib/constants/contractDeliveryBatchStatus.ts

export enum ContractDeliveryBatchStatus {
  Planned = "Planned",        // Đã lên kế hoạch
  InProgress = "InProgress",  // Đang giao hàng
  Fulfilled = "Fulfilled",    // Đã hoàn thành
  Cancelled = "Cancelled",    // Huỷ
}

// Optional: Nếu bạn cần ánh xạ sang tiếng Việt để hiển thị dễ hơn
export const ContractDeliveryBatchStatusLabel: Record<ContractDeliveryBatchStatus, string> = {
  [ContractDeliveryBatchStatus.Planned]: 'Chuẩn bị giao',
  [ContractDeliveryBatchStatus.InProgress]: 'Đang thực hiện',
  [ContractDeliveryBatchStatus.Fulfilled]: 'Hoàn thành',
  [ContractDeliveryBatchStatus.Cancelled]: 'Đã hủy',
};

export const deliveryBatchDisplayMap: Record<
  ContractDeliveryBatchStatus | "ALL",
  {
    label: string;
    color: string;
    icon: string; // thêm dòng này
  }
> = {
  ALL: {
    label: "Tất cả trạng thái",
    color: "gray",
    icon: "📝",
  },
  [ContractDeliveryBatchStatus.Planned]: {
    label: "Chuẩn bị giao",
    color: "purple",
    icon: "📦",
  },
  [ContractDeliveryBatchStatus.InProgress]: {
    label: "Đang thực hiện",
    color: "green",
    icon: "🚚",
  },
  [ContractDeliveryBatchStatus.Fulfilled]: {
    label: "Hoàn thành",
    color: "blue",
    icon: "✅",
  },
  [ContractDeliveryBatchStatus.Cancelled]: {
    label: "Đã huỷ",
    color: "red",
    icon: "❌",
  },
};