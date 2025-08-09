import api from "./axios";

export interface OrderItemViewDto {
  orderItemId: string;
  productId: string;
  productName: string;
  quantity?: number | null;
  unitPrice?: number | null;
  discountAmount?: number | null;
  totalPrice?: number | null;
  note: string;
}

export async function softDeleteOrderItem(orderItemId: string): Promise<void> {
  await api.patch(`/OrderItems/soft-delete/${orderItemId}`);
}