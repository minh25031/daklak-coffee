import api from "./axios";

export interface BusinessBuyerDto {
  buyerId: string;
  buyerCode: string;
  companyName: string;
  contactPerson: string;
  position: string;
  companyAddress: string;
  createdAt: string;
  createdByName: string;
}

export interface BusinessBuyerViewDetailsDto {
  buyerId: string;
  buyerCode: string;
  companyName: string;
  contactPerson: string;
  position: string;
  companyAddress: string;
  taxId: string;
  email: string;
  phone: string;
  website: string;
  createdAt: string;
  updatedAt: string;
  createdByName: string;
}

// Gọi API để lấy danh sách tất cả buyers
export async function getAllBusinessBuyers(): Promise<BusinessBuyerDto[]> {
  const response = await api.get<BusinessBuyerDto[]>("/BusinessBuyers");
  return response.data;
}

export async function getBusinessBuyerById(
  id: string
): Promise<BusinessBuyerViewDetailsDto> {
  const response = await api.get<BusinessBuyerViewDetailsDto>(
    `/BusinessBuyers/${id}`
  );
  return response.data;
}

export interface BusinessBuyerCreateDto {
  companyName: string;
  contactPerson?: string;
  position?: string;
  companyAddress?: string;
  taxId?: string;
  email: string;
  phoneNumber: string;
  website?: string | null;
}

export interface BusinessBuyerUpdateDto extends BusinessBuyerCreateDto {
  buyerId: string;
}

export async function createBusinessBuyer(
  payload: BusinessBuyerCreateDto
): Promise<string | null> {
  const res = await api.post("/BusinessBuyers", payload);
  const data = res.data;
  if (!data) return null;
  if (typeof data === "string") return data;
  if (typeof data === "object") {
    return (
      (data as any).buyerId ||
      (data as any).id ||
      (data as any).data?.buyerId ||
      null
    );
  }
  return null;
}

export async function updateBusinessBuyer(
  payload: BusinessBuyerUpdateDto
): Promise<void> {
  await api.put(`/BusinessBuyers/${payload.buyerId}`, payload);
}

export async function softDeleteBusinessBuyer(buyerId: string): Promise<void> {
  await api.patch(`/BusinessBuyers/soft-delete/${buyerId}`);
}
