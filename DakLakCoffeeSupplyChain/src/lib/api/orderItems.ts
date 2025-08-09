import api from "./axios";

// DTO: Thông tin chi tiết của một mặt hàng trong đơn hàng
export interface OrderItemViewDto {
  orderItemId: string;
  contractDeliveryItemId: string;
  productId: string;
  productName: string;
  quantity?: number | null;
  unitPrice?: number | null;
  discountAmount?: number | null;
  totalPrice?: number | null;
  note: string;
}

// DTO: Payload tạo mới mặt hàng trong đơn hàng
export interface OrderItemCreateDto {
  orderId: string;
  contractDeliveryItemId: string;
  productId: string;
  quantity: number;
  unitPrice: number;
  discountAmount?: number | null;
  note?: string | null;
}

// DTO: Payload cập nhật mặt hàng trong đơn hàng
export interface OrderItemUpdateDto {
  orderItemId: string;
  orderId: string;
  contractDeliveryItemId: string;
  productId: string;
  quantity: number;
  unitPrice: number;
  discountAmount?: number | null;
  note?: string | null;
}

// API: Tạo mới mặt hàng đơn hàng
export async function createOrderItem(payload: OrderItemCreateDto): Promise<OrderItemViewDto> {
  const res = await api.post("/OrderItems", payload);
  return res.data as OrderItemViewDto;
}

// API: Cập nhật mặt hàng đơn hàng
export async function updateOrderItem(payload: OrderItemUpdateDto): Promise<OrderItemViewDto> {
  const res = await api.put(`/OrderItems/${payload.orderItemId}`, payload);
  return res.data as OrderItemViewDto;
}

// API: Xoá mềm mặt hàng đơn hàng
export async function softDeleteOrderItem(orderItemId: string): Promise<void> {
  await api.patch(`/OrderItems/soft-delete/${orderItemId}`);
}