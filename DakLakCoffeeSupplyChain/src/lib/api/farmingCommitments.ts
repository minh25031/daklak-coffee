// lib/api/farmingCommitments.ts
import api from "@/lib/api/axios";

export interface FarmingCommitmentItem {
  commitmentId: string;
  commitmentCode: string;
  commitmentName: string;
  farmerName: string;
  confirmedPrice: number;
  committedQuantity: number;
  estimatedDeliveryStart: string;
  estimatedDeliveryEnd: string;
  status: number;
}
export interface CommitmentDetailItem {
  commitmentDetailId: string;
  commitmentDetailCode: string;
  coffeeTypeId: string;
  typeName: string;
  confirmedPrice: number;
  committedQuantity: number;
  estimatedDeliveryStart?: string;
  estimatedDeliveryEnd?: string;
}

export async function getFarmerCommitments(): Promise<FarmingCommitmentItem[]> {
  try {
    const res = await api.get<FarmingCommitmentItem[]>("/FarmingCommitment/Farmer");
    return res.data;
  } catch (err) {
    console.error("Lỗi getFarmerCommitments:", err);
    return [];
  }
}

export async function getBusinessCommitments(): Promise<FarmingCommitmentItem[]> {
  const res = await api.get<FarmingCommitmentItem[]>("/FarmingCommitment/BusinessManager");
  return res.data;
}

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
export async function getAvailableCommitmentDetails(
  cropSeasonId: string
): Promise<CommitmentDetailItem[]> {
  try {
    const res = await api.get<CommitmentDetailItem[]>(
      `/CropSeasonDetails/AvailableCommitmentDetails/${cropSeasonId}`
    );
    return res.data;
  } catch (err) {
    console.error("Lỗi getAvailableCommitmentDetails:", err);
    return [];
  }
}
