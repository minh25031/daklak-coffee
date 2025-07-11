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
