import api from "./axios";
import { OrderStatus } from "@/lib/constants/orderStatus";

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

// Optional: query type cho trang view list
export interface OrderQuery {
  search?: string;
  status?: OrderStatus | "ALL";
  fromDate?: string; // yyyy-MM-dd
  toDate?: string;   // yyyy-MM-dd
  page?: number;
  pageSize?: number;
}

export async function getAllOrders(): Promise<OrderViewAllDto[]> {
  const { data } = await api.get<OrderViewAllDto[]>("/orders");
  return data;
}

export async function getOrders(params?: OrderQuery): Promise<OrderViewAllDto[]> {
  const { data } = await api.get<OrderViewAllDto[]>("/orders", { params });
  return data;
}

export async function getOrderById(id: string): Promise<OrderViewAllDto> {
  const { data } = await api.get<OrderViewAllDto>(`/orders/${id}`);
  return data;
}

export async function createOrder(payload: any) {
  const { data } = await api.post("/orders", payload);
  return data;
}

export async function updateOrder(id: string, payload: any) {
  const { data } = await api.put(`/orders/${id}`, payload);
  return data;
}

export async function softDeleteOrder(id: string) {
  const { data } = await api.patch(`/orders/soft-delete/${id}`);
  return data;
}
