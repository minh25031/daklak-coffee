// lib/api/farmingCommitments.ts
import api from "@/lib/api/axios";

// Chi tiết từng dòng cam kết (dòng con trong một cam kết)
export interface CommitmentDetail {
  commitmentDetailId: string;
  commitmentDetailCode: string;
  commitmentId: string;
  registrationDetailId: string;
  planDetailId: string;
  confirmedPrice: number;
  committedQuantity: number;
  estimatedDeliveryStart: string;
  estimatedDeliveryEnd: string;
  note: string;
  contractDeliveryItemId: string | null;
  createdAt: string;
  updatedAt: string;
}

// Thông tin 1 cam kết (bao gồm cả các dòng cam kết)
export interface FarmingCommitmentItem {
  commitmentId: string;
  commitmentCode: string;
  commitmentName: string;
  farmerName: string;
  planTitle?: string;
  totalPrice?: number;
  commitmentDate?: string;
  confirmedPrice: number;
  committedQuantity: number;
  estimatedDeliveryStart: string;
  estimatedDeliveryEnd: string;
  status: number;
  farmingCommitmentsDetailsDTOs?: CommitmentDetail[]; // ✅ Quan trọng
}

// Lấy danh sách cam kết của Farmer
export async function getFarmerCommitments(): Promise<FarmingCommitmentItem[]> {
  try {
    const res = await api.get<FarmingCommitmentItem[]>("/FarmingCommitment/Farmer");
    return res.data;
  } catch (err) {
    console.error("Lỗi getFarmerCommitments:", err);
    return [];
  }
}

// Lấy danh sách cam kết cho Business Manager
export async function getBusinessCommitments(): Promise<FarmingCommitmentItem[]> {
  try {
    const res = await api.get<FarmingCommitmentItem[]>("/FarmingCommitment/BusinessManager");
    return res.data;
  } catch (err) {
    console.error("Lỗi getBusinessCommitments:", err);
    return [];
  }
}

// Lấy các cam kết còn trống để gán cho mùa vụ
export async function getAvailableCommitments(): Promise<FarmingCommitmentItem[]> {
  try {
    const res = await api.get<FarmingCommitmentItem[]>(
      "/FarmingCommitment/Farmer/AvailableForCropSeason"
    );
    return res.data;
  } catch (err) {
    console.error("Lỗi getAvailableCommitments:", err);
    return [];
  }
}

// Lấy chi tiết 1 cam kết (nếu bạn vẫn muốn dùng cách này)
export async function getCommitmentById(commitmentId: string): Promise<FarmingCommitmentItem | null> {
  try {
    const res = await api.get<FarmingCommitmentItem>(`/FarmingCommitment/${commitmentId}`);
    return res.data;
  } catch (err) {
    console.error("Lỗi getCommitmentById:", err);
    return null;
  }
}
