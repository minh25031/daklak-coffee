import api from "./axios";
import { ContractStatus, normalizeStatusForApi } from "@/lib/constants/contractStatus";
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
  contractFile?: File; // Thêm field cho file upload
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

// Helper: ép về yyyy-MM-dd
const toISODate = (d: string) => {
  // d có thể là '08/19/2025' hoặc '2025-08-19'
  const parts = d.includes('/') ? d.split('/') : d.split('-');
  let yyyy: number, mm: number, dd: number;

  if (d.includes('/')) { // mm/dd/yyyy
    [mm, dd, yyyy] = parts.map(Number);
  } else {               // yyyy-mm-dd
    [yyyy, mm, dd] = parts.map(Number);
  }
  const date = new Date(Date.UTC(yyyy, mm - 1, dd));
  return date.toISOString().slice(0, 10); // 'yyyy-MM-dd'
};

// API: Tạo mới hợp đồng
export async function createContract(data: ContractCreateDto): Promise<void> {
  const fd = new FormData();
  fd.append('buyerId', data.buyerId);
  fd.append('contractNumber', data.contractNumber);
  fd.append('contractTitle', data.contractTitle);

  // Nếu người dùng dán link mà không chọn file -> gửi URL lên BE
  if (data.contractFileUrl && !data.contractFile) {
    fd.append('contractFileUrl', data.contractFileUrl.trim());
  }
  if (data.deliveryRounds !== undefined) fd.append('deliveryRounds', String(data.deliveryRounds));
  if (data.totalQuantity !== undefined)  fd.append('totalQuantity', String(data.totalQuantity));
  if (data.totalValue !== undefined)     fd.append('totalValue', String(data.totalValue));

  const only = (s?: string) =>
    s && /^\d{4}-\d{2}-\d{2}$/.test(s) ? s :
    s && /^\d{2}\/\d{2}\/\d{4}$/.test(s) ? new Date(s).toISOString().slice(0,10) :
    undefined;

  const s = only(data.startDate);
  const e = only(data.endDate);
  if (s) fd.append('startDate', s);
  if (e) fd.append('endDate', e);
  const signed = only(data.signedAt);
  if (signed) fd.append('signedAt', signed);

  const statusForApi = normalizeStatusForApi((data as any).statusLabel ?? data.status);
  fd.append('status', statusForApi);
  fd.append('cancelReason', (data.cancelReason ?? '').trim());

  if (data.contractFile) fd.append('contractFile', data.contractFile);

  data.contractItems.forEach((it, i) => {
    fd.append(`contractItems[${i}].coffeeTypeId`, it.coffeeTypeId);
    if (it.quantity !== undefined)       fd.append(`contractItems[${i}].quantity`, String(it.quantity));
    if (it.unitPrice !== undefined)      fd.append(`contractItems[${i}].unitPrice`, String(it.unitPrice));
    if (it.discountAmount !== undefined) fd.append(`contractItems[${i}].discountAmount`, String(it.discountAmount));
    if (it.note)                         fd.append(`contractItems[${i}].note`, it.note);
  });

  await api.post('/Contracts', fd); // KHÔNG set Content-Type
}

// API: Cập nhật hợp đồng
export async function updateContract(contractId: string, data: ContractUpdateDto): Promise<void> {
  const fd = new FormData();
  fd.append('contractId', data.contractId);
  fd.append('buyerId', data.buyerId);
  fd.append('contractNumber', data.contractNumber);
  fd.append('contractTitle', data.contractTitle);

  // Nếu người dùng dán link mà không chọn file -> gửi URL lên BE
  if (data.contractFileUrl && !data.contractFile) {
    fd.append('contractFileUrl', data.contractFileUrl.trim());
  }
  if (data.deliveryRounds !== undefined) fd.append('deliveryRounds', String(data.deliveryRounds));
  if (data.totalQuantity !== undefined)  fd.append('totalQuantity', String(data.totalQuantity));
  if (data.totalValue !== undefined)     fd.append('totalValue', String(data.totalValue));

  const only = (s?: string) =>
    s && /^\d{4}-\d{2}-\d{2}$/.test(s) ? s :
    s && /^\d{2}\/\d{2}\/\d{4}$/.test(s) ? new Date(s).toISOString().slice(0,10) :
    undefined;

  const s = only(data.startDate);
  const e = only(data.endDate);
  if (s) fd.append('startDate', s);
  if (e) fd.append('endDate', e);
  const signed = only(data.signedAt);
  if (signed) fd.append('signedAt', signed);

  const statusForApi = normalizeStatusForApi((data as any).statusLabel ?? data.status);
  fd.append('status', statusForApi);
  fd.append('cancelReason', (data.cancelReason ?? '').trim());

  if (data.contractFile) fd.append('contractFile', data.contractFile);

  data.contractItems.forEach((it, i) => {
    fd.append(`contractItems[${i}].contractItemId`, it.contractItemId);
    fd.append(`contractItems[${i}].contractId`, it.contractId);
    fd.append(`contractItems[${i}].coffeeTypeId`, it.coffeeTypeId);
    if (it.quantity !== undefined)       fd.append(`contractItems[${i}].quantity`, String(it.quantity));
    if (it.unitPrice !== undefined)      fd.append(`contractItems[${i}].unitPrice`, String(it.unitPrice));
    if (it.discountAmount !== undefined) fd.append(`contractItems[${i}].discountAmount`, String(it.discountAmount));
    if (it.note)                         fd.append(`contractItems[${i}].note`, it.note);
  });

  await api.put(`/Contracts/${contractId}`, fd); // KHÔNG set Content-Type
}
