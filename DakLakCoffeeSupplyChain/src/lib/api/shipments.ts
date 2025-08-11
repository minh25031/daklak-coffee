import api from "./axios";
import { ShipmentDeliveryStatusValue } from "@/lib/constants/shipmentDeliveryStatus";

// DTO tương ứng với ShipmentViewAllDto từ backend
export interface ShipmentViewAllDto {
  shipmentId: string;
  shipmentCode: string;
  orderId: string;
  orderCode: string;
  deliveryStaffId: string;
  deliveryStaffName: string;
  shippedQuantity?: number | null;
  shippedAt?: string | null;
  deliveryStatus: ShipmentDeliveryStatusValue;
  receivedAt?: string | null;
  createdAt: string;
}

export async function getAllShipments(): Promise<ShipmentViewAllDto[]> {
  const { data } = await api.get<ShipmentViewAllDto[]>("/Shipments");
  return data;
}

// DTO chi tiết lô giao hàng
export interface ShipmentDetailViewDto {
  shipmentDetailId: string;
  orderItemId: string;
  productName: string;
  quantity?: number | null;
  unit: string; // ProductUnit as string
  note: string;
  createdAt: string;
}

export interface ShipmentDetailCreateDto {
  shipmentId: string;
  orderItemId: string;
  quantity: number;
  unit: string; // ProductUnit as string
  note?: string;
}

export interface ShipmentDetailUpdateDto extends ShipmentDetailCreateDto {
  shipmentDetailId: string;
}

export interface ShipmentViewDetailsDto {
  shipmentId: string;
  shipmentCode: string;
  orderId: string;
  orderCode: string;
  deliveryStaffId: string;
  deliveryStaffName: string;
  shippedQuantity?: number | null;
  shippedAt?: string | null;
  deliveryStatus: ShipmentDeliveryStatusValue;
  receivedAt?: string | null;
  createdAt: string;
  createdByName: string;
  shipmentDetails: ShipmentDetailViewDto[];
  // optional: include order items for selection when adding shipment details
  orderItems?: {
    orderItemId: string;
    productName: string;
  }[];
}

export async function getShipmentDetails(
  shipmentId: string
): Promise<ShipmentViewDetailsDto> {
  const { data } = await api.get<ShipmentViewDetailsDto>(
    `/Shipments/${shipmentId}`
  );
  return data;
}

// Xoá mềm một dòng chi tiết lô giao
export async function softDeleteShipmentDetail(
  shipmentDetailId: string
): Promise<void> {
  await api.patch(`/ShipmentDetails/soft-delete/${shipmentDetailId}`);
}

export async function createShipmentDetail(
  payload: ShipmentDetailCreateDto
): Promise<ShipmentDetailViewDto> {
  const { data } = await api.post<ShipmentDetailViewDto>(
    "/ShipmentDetails",
    payload
  );
  return data;
}

export async function updateShipmentDetail(
  payload: ShipmentDetailUpdateDto
): Promise<ShipmentDetailViewDto> {
  const { data } = await api.put<ShipmentDetailViewDto>(
    `/ShipmentDetails/${payload.shipmentDetailId}`,
    payload
  );
  return data;
}

// Xoá mềm một lô giao
export async function softDeleteShipment(shipmentId: string): Promise<void> {
  await api.patch(`/Shipments/soft-delete/${shipmentId}`);
}
