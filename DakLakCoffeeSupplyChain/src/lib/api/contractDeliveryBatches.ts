import api from "./axios";
import { ContractDeliveryBatchStatus } from "@/lib/constants/contractDeliveryBatchStatus";
import { ContractDeliveryItemCreateDto, ContractDeliveryItemUpdateDto} from "@/lib/api/contractDeliveryItems";
import { toDateOnly } from "@/lib/utils";

// DTO: Thông tin hiển thị của một đợt giao hàng trong danh sách
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

// DTO: Thông tin chi tiết của một đợt giao hàng (bao gồm danh sách mặt hàng)
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

// DTO: Tạo mới một đợt giao hàng
export type ContractDeliveryBatchCreateDto = {
  contractId: string;                     // Guid
  deliveryRound: number;                  // >= 1
  expectedDeliveryDate: Date | string;    // Date or 'YYYY-MM-DD'
  totalPlannedQuantity: number;           // > 0
  status: ContractDeliveryBatchStatus;    // default Planned
  contractDeliveryItems: ContractDeliveryItemCreateDto[];
};

// DTO: Cập nhật một đợt giao hàng
export type ContractDeliveryBatchUpdateDto = {
  deliveryBatchId: string;                // Guid
  contractId: string;                     // Guid
  deliveryRound: number;                  // >= 1
  expectedDeliveryDate: Date | string;    // Date or 'YYYY-MM-DD'
  totalPlannedQuantity: number;           // > 0
  status: ContractDeliveryBatchStatus;
  contractDeliveryItems: ContractDeliveryItemUpdateDto[];
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

// API: Tạo mới một đợt giao hàng
export async function createContractDeliveryBatch(dto: ContractDeliveryBatchCreateDto) {
  return api.post("/ContractDeliveryBatchs", {
    ...dto,
    expectedDeliveryDate: toDateOnly(dto.expectedDeliveryDate),
  });
}

// API: Cập nhật một đợt giao hàng theo ID
export async function updateContractDeliveryBatch(id: string, dto: ContractDeliveryBatchUpdateDto) {
  return api.put(`/ContractDeliveryBatchs/${id}`, {
    ...dto,
    expectedDeliveryDate: toDateOnly(dto.expectedDeliveryDate),
  });
}

// API: Xoá mềm đợt giao hàng theo ID
export async function softDeleteContractDeliveryBatch(id: string): Promise<void> {
  await api.patch(`/ContractDeliveryBatchs/soft-delete/${id}`);
}
