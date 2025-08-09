import api from "./axios";
import { ContractStatus } from "@/lib/constants/contractStatus";
import { ContractItemCreateDto } from "@/lib/api/contractItems";
import { ContractItemUpdateDto } from "@/lib/api/contractItems";

// DTO: Hợp đồng (mock dùng cho demo)
export interface Contract {
  id: string;
  title: string;
  business: string;
  location: string;
  coffeeType: string;
  quantity: number;
  price: number;
  deadline: string;
  status: "open" | "in_progress" | "completed";
  requirements: string[];
  support: {
    technical: boolean;
    financial: boolean;
    equipment: boolean;
  };
  createdAt: string;
  updatedAt: string;
}

// DTO: Dữ liệu hiển thị danh sách hợp đồng
export interface ContractViewAllDto {
  contractId: string;
  contractCode: string;
  contractNumber: string;
  contractTitle: string;
  sellerName: string;
  buyerName: string;
  deliveryRounds?: number;
  totalQuantity?: number;
  totalValue?: number;
  startDate?: string; // DateOnly as string
  endDate?: string;   // DateOnly as string
  status: string; // ContractStatus as string
}

// DTO: Thông tin mặt hàng trong hợp đồng
export interface ContractItemViewDto {
  contractItemId: string;
  contractItemCode: string;
  coffeeTypeId: string;
  coffeeTypeName: string;
  quantity?: number;
  unitPrice?: number;
  discountAmount?: number;
  note: string;
}

// DTO: Dữ liệu chi tiết hợp đồng
export interface ContractViewDetailsDto {
  contractId: string;
  contractCode: string;
  contractNumber: string;
  contractTitle: string;
  contractFileUrl: string;
  sellerName: string;
  buyerId: string;
  buyerName: string;
  deliveryRounds?: number;
  totalQuantity?: number;
  totalValue?: number;
  startDate?: string;
  endDate?: string;
  signedAt?: string;
  status: string;
  cancelReason: string;
  createdAt: string;
  updatedAt: string;
  contractItems: ContractItemViewDto[];
}

// DTO: Tạo mới hợp đồng
export interface ContractCreateDto {
  buyerId: string;
  contractNumber: string;
  contractTitle: string;
  contractFileUrl?: string;
  deliveryRounds?: number;
  totalQuantity?: number;
  totalValue?: number;
  startDate?: string; // hoặc DateOnly/Date tuỳ định dạng
  endDate?: string;
  signedAt?: string;
  status: ContractStatus;
  cancelReason: string;
  contractItems: ContractItemCreateDto[];
}

// DTO: Cập nhật hợp đồng
export interface ContractUpdateDto extends ContractCreateDto {
  contractId: string;
  contractItems: ContractItemUpdateDto[]; // override để dùng loại Update thay vì Create
}

// Mock: Danh sách hợp đồng mẫu (chỉ dùng test UI)
export const mockContracts: Contract[] = [
  {
    id: "1",
    title: "Hợp đồng thu mua Arabica Premium 2025",
    business: "Công ty TNHH Cà Phê Đắk Lắk",
    location: "Buôn Ma Thuột, Đắk Lắk",
    coffeeType: "Arabica",
    quantity: 5000,
    price: 120000,
    deadline: "2025-08-30",
    status: "open",
    requirements: [
      "Diện tích tối thiểu: 1ha",
      "Chứng nhận VietGAP",
      "Cam kết chất lượng đạt chuẩn",
    ],
    support: {
      technical: true,
      financial: true,
      equipment: false,
    },
    createdAt: "2024-03-15T08:00:00Z",
    updatedAt: "2024-03-15T08:00:00Z",
  },
  {
    id: "2",
    title: "Hợp đồng Robusta Special 2025",
    business: "Công ty Cà Phê Trung Nguyên",
    location: "Cư M'gar, Đắk Lắk",
    coffeeType: "Robusta",
    quantity: 8000,
    price: 95000,
    deadline: "2025-09-15",
    status: "open",
    requirements: [
      "Diện tích tối thiểu: 2ha",
      "Chứng nhận hữu cơ",
      "Cam kết sản lượng",
    ],
    support: {
      technical: true,
      financial: false,
      equipment: true,
    },
    createdAt: "2024-03-14T10:30:00Z",
    updatedAt: "2024-03-14T10:30:00Z",
  },
];

// API: Lấy toàn bộ danh sách hợp đồng
export async function getAllContracts(): Promise<ContractViewAllDto[]> {
  const response = await api.get<ContractViewAllDto[]>("/Contracts");
  return response.data;
}

// API: Lấy chi tiết hợp đồng theo ID (mock)
export async function getContractById(id: string): Promise<Contract | null> {
  // TODO: Replace with actual API call
  return mockContracts.find((contract) => contract.id === id) || null;
}

// // Create new contract
// export async function createContract(contract: Omit<Contract, "id" | "createdAt" | "updatedAt">): Promise<Contract> {
//   // TODO: Replace with actual API call
//   const newContract: Contract = {
//     ...contract,
//     id: Math.random().toString(36).substr(2, 9),
//     createdAt: new Date().toISOString(),
//     updatedAt: new Date().toISOString(),
//   };
//   mockContracts.push(newContract);
//   return newContract;
// }

// // Update contract
// export async function updateContract(id: string, updates: Partial<Contract>): Promise<Contract | null> {
//   // TODO: Replace with actual API call
//   const index = mockContracts.findIndex((contract) => contract.id === id);
//   if (index === -1) return null;

//   const updatedContract = {
//     ...mockContracts[index],
//     ...updates,
//     updatedAt: new Date().toISOString(),
//   };
//   mockContracts[index] = updatedContract;
//   return updatedContract;
// }

// Delete contract
export async function deleteContract(id: string): Promise<boolean> {
  // TODO: Replace with actual API call
  const index = mockContracts.findIndex((contract) => contract.id === id);
  if (index === -1) return false;

  mockContracts.splice(index, 1);
  return true;
}

// Get contracts by business
export async function getContractsByBusiness(businessId: string): Promise<Contract[]> {
  // TODO: Replace with actual API call
  return mockContracts.filter((contract) => contract.business === businessId);
}

// Get contracts by status
export async function getContractsByStatus(status: Contract["status"]): Promise<Contract[]> {
  // TODO: Replace with actual API call
  return mockContracts.filter((contract) => contract.status === status);
}

// Apply for contract (farmer)
export async function applyForContract(contractId: string, farmerId: string): Promise<boolean> {
  // TODO: Replace with actual API call
  console.log(`Farmer ${farmerId} applied for contract ${contractId}`);
  return true;
}

// Accept farmer application (business)
export async function acceptFarmerApplication(contractId: string, farmerId: string): Promise<boolean> {
  // TODO: Replace with actual API call
  console.log(`Business accepted farmer ${farmerId} for contract ${contractId}`);
  return true;
}

// Reject farmer application (business)
export async function rejectFarmerApplication(contractId: string, farmerId: string): Promise<boolean> {
  // TODO: Replace with actual API call
  console.log(`Business rejected farmer ${farmerId} for contract ${contractId}`);
  return true;
}

// API: Lấy chi tiết hợp đồng kèm danh sách mặt hàng
export async function getContractDetails(contractId: string): Promise<ContractViewDetailsDto> {
  const response = await api.get<ContractViewDetailsDto>(`/Contracts/${contractId}`);
  return response.data;
}

// API: Xoá mềm hợp đồng
export async function softDeleteContract(contractId: string): Promise<void> {
  await api.patch(`/Contracts/soft-delete/${contractId}`);
} 

// API: Tạo mới hợp đồng
export async function createContract(data: ContractCreateDto): Promise<void> {
  await api.post("/Contracts", data);
}

// API: Cập nhật hợp đồng
export async function updateContract(contractId: string, data: ContractUpdateDto): Promise<void> {
  await api.put(`/Contracts/${contractId}`, data);
}
