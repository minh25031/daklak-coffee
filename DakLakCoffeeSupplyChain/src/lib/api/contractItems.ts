import api from "./axios";

export interface ContractItemCreateDto {
  contractId: string;
  coffeeTypeId: string;
  quantity: number;
  unitPrice: number;
  discountAmount?: number; // default: 0
  note?: string;           // default: ''
}

export interface ContractItemUpdateDto {
  contractItemId: string;
  contractId: string;
  coffeeTypeId: string;
  quantity: number;
  unitPrice: number;
  discountAmount?: number;
  note?: string;
}

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

// Create contract item
export async function createContractItem(data: ContractItemCreateDto): Promise<void> {
  await api.post("/ContractItems", data);
}

// Update contract item
export async function updateContractItem(data: ContractItemUpdateDto): Promise<void> {
  await api.put(`/ContractItems/${data.contractItemId}`, data);
}

// Soft delete contract item
export async function softDeleteContractItem(contractItemId: string): Promise<void> {
  await api.patch(`/ContractItems/soft-delete/${contractItemId}`);
}
