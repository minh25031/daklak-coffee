import api from "./axios";
import { ContractDeliveryBatchStatus } from "@/lib/constants/contractDeliveryBatchStatus";

export type ContractDeliveryBatchViewAllDto = {
  deliveryBatchId: string;
  deliveryBatchCode: string;
  contractId: string;
  deliveryRound: number;
  expectedDeliveryDate: string | null;
  totalPlannedQuantity: number | null;
  status: ContractDeliveryBatchStatus;
  createdAt: string | null;
  updatedAt: string | null;
};

// Lấy tất cả đợt giao hàng từ API
export async function getAllContractDeliveryBatches(): Promise<ContractDeliveryBatchViewAllDto[]> {
  const response = await api.get<ContractDeliveryBatchViewAllDto[]>("/ContractDeliveryBatchs");
  return response.data;
}