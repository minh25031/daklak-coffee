import api from "./axios";
import { OrderStatus } from "@/lib/constants/orderStatus";
import { OrderItemViewDto } from "@/lib/api/orderItems";

// DTO: Dữ liệu hiển thị của đơn hàng (trang View All)
export interface OrderViewAllDto {
  orderId: string;
  orderCode: string;
  deliveryRound?: number | null;
  orderDate?: string | null; // ISO string
  actualDeliveryDate?: string | null; // ISO string (yyyy-MM-dd from API)
  totalAmount?: number | null;
  status: OrderStatus;
  deliveryBatchCode: string;
  contractNumber: string;
}

// DTO: Tham số query khi lấy danh sách đơn hàng
export interface OrderQuery {
  search?: string;
  status?: OrderStatus | "ALL";
  fromDate?: string; // yyyy-MM-dd
  toDate?: string;   // yyyy-MM-dd
  page?: number;
  pageSize?: number;
}

// DTO: Chi tiết đơn hàng kèm danh sách mặt hàng
export interface OrderViewDetailsDto {
  orderId: string;
  orderCode: string;
  deliveryRound?: number | null;
  orderDate?: string | null;         // ISO
  actualDeliveryDate?: string | null;// yyyy-MM-dd
  totalAmount?: number | null;
  note: string;
  status: OrderStatus;
  cancelReason: string;
  deliveryBatchId: string;
  deliveryBatchCode: string;
  contractNumber: string;
  orderItems: OrderItemViewDto[];
}

// API: Lấy toàn bộ danh sách đơn hàng
export async function getAllOrders(): Promise<OrderViewAllDto[]> {
  const { data } = await api.get<OrderViewAllDto[]>("/orders");
  return data;
}

// API: Lấy danh sách đơn hàng với filter & phân trang
export async function getOrders(params?: OrderQuery): Promise<OrderViewAllDto[]> {
  const { data } = await api.get<OrderViewAllDto[]>("/orders", { params });
  return data;
}

// API: Lấy thông tin chi tiết một đơn hàng theo ID
export async function getOrderDetails(id: string): Promise<OrderViewDetailsDto> {
  const { data } = await api.get<OrderViewDetailsDto>(`/orders/${id}`);
  return data;
}

// API: Tạo mới một đơn hàng
export async function createOrder(payload: any) {
  const { data } = await api.post("/orders", payload);
  return data;
}

// API: Cập nhật một đơn hàng
export async function updateOrder(id: string, payload: any) {
  const { data } = await api.put(`/orders/${id}`, payload);
  return data;
}

// API: Xoá mềm một đơn hàng
export async function softDeleteOrder(id: string) {
  const { data } = await api.patch(`/orders/soft-delete/${id}`);
  return data;
}
