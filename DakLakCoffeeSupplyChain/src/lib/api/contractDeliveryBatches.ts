import api from "./axios";
import { ContractDeliveryBatchStatus } from "@/lib/constants/contractDeliveryBatchStatus";

// DTO: Thông tin cơ bản của đợt giao hàng (hiển thị ở danh sách)
export type ContractDeliveryBatchViewAllDto = {
  deliveryBatchId: string;
  deliveryBatchCode: string;
  contractId: string;
  contractNumber: string;
  deliveryRound: number;
  expectedDeliveryDate: string | null;
  totalPlannedQuantity: number | null;
  status: ContractDeliveryBatchStatus;
  createdAt: string | null;
  updatedAt: string | null;
};

// DTO: Thông tin từng mặt hàng trong đợt giao hàng
export type ContractDeliveryItemViewDto = {
  deliveryItemId: string;
  deliveryItemCode: string;
  contractItemId: string;
  coffeeTypeName: string;
  plannedQuantity: number;
  fulfilledQuantity: number | null;
  note: string;
};

// DTO: Thông tin chi tiết của 1 đợt giao hàng (dùng trong trang chi tiết)
export type ContractDeliveryBatchViewDetailsDto = {
  deliveryBatchId: string;
  deliveryBatchCode: string;
  contractId: string;
  contractNumber: string;
  contractTitle: string;
  deliveryRound: number;
  expectedDeliveryDate: string | null;
  totalPlannedQuantity: number | null;
  status: ContractDeliveryBatchStatus;
  createdAt: string | null;
  updatedAt: string | null;
  contractDeliveryItems: ContractDeliveryItemViewDto[];
};

// API: Lấy danh sách tất cả đợt giao hàng
export async function getAllContractDeliveryBatches(): Promise<ContractDeliveryBatchViewAllDto[]> {
  const response = await api.get<ContractDeliveryBatchViewAllDto[]>("/ContractDeliveryBatchs");
  return response.data;
}

// API: Lấy thông tin chi tiết của một đợt giao hàng theo ID
export async function getContractDeliveryBatchById(
  id: string
): Promise<ContractDeliveryBatchViewDetailsDto> {
  const response = await api.get<ContractDeliveryBatchViewDetailsDto>(`/ContractDeliveryBatchs/${id}`);
  return response.data;
}

// API: Xoá mềm đợt giao hàng theo ID
export async function softDeleteContractDeliveryBatch(id: string): Promise<void> {
  await api.patch(`/ContractDeliveryBatchs/soft-delete/${id}`);
}
