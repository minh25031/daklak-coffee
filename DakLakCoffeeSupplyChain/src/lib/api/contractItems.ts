import api from "./axios";

// DTO: Tạo mới mặt hàng trong hợp đồng
export interface ContractItemCreateDto {
  contractId?: string;
  coffeeTypeId: string;
  quantity: number;
  unitPrice: number;
  discountAmount?: number; // default: 0
  note?: string;           // default: ''
}

// DTO: Cập nhật mặt hàng trong hợp đồng
export interface ContractItemUpdateDto {
  contractItemId: string;
  contractId: string;
  coffeeTypeId: string;
  quantity: number;
  unitPrice: number;
  discountAmount?: number;
  note?: string;
}

// DTO: Dữ liệu hiển thị mặt hàng hợp đồng
export interface ContractItemViewDto {
  contractItemId: string;
  contractItemCode: string;
  coffeeTypeId: string;
  coffeeTypeName: string;
  quantity: number;
  unitPrice: number;
  discountAmount: number;
  note: string;
}

// API: Tạo mới một mặt hàng trong hợp đồng
export async function createContractItem(data: ContractItemCreateDto): Promise<void> {
  await api.post("/ContractItems", data);
}

// API: Cập nhật một mặt hàng trong hợp đồng
export async function updateContractItem(data: ContractItemUpdateDto): Promise<void> {
  await api.put(`/ContractItems/${data.contractItemId}`, data);
}

// API: Xoá mềm một mặt hàng trong hợp đồng
export async function softDeleteContractItem(contractItemId: string): Promise<void> {
  await api.patch(`/ContractItems/soft-delete/${contractItemId}`);
}
