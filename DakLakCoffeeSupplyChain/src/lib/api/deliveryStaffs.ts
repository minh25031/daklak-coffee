import api from "./axios";

export interface DeliveryStaffDto {
  deliveryStaffId: string;
  fullName: string;
}

export async function getAllDeliveryStaffs(): Promise<DeliveryStaffDto[]> {
  // Try common endpoints; adapt when BE confirmed
  try {
    const { data } = await api.get<DeliveryStaffDto[]>("/DeliveryStaffs");
    return data;
  } catch {
    // fallback to BusinessStaffs if BE chưa có endpoint riêng
    try {
      const { data } = await api.get<any[]>("/BusinessStaffs");
      return (data || []).map((s: any) => ({
        deliveryStaffId: s.staffId || s.id,
        fullName: s.fullName || s.name,
      }));
    } catch {
      return [];
    }
  }
}


