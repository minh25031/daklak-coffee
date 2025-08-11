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

