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
