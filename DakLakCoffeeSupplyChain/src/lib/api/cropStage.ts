import api from "@/lib/api/axios";

export type CropStage = {
  stageId: number;
  stageCode: string;
  stageName: string;
  description?: string;
  orderIndex: number;
};

export async function getCropStages(): Promise<CropStage[]> {
  const response = await api.get("/CropStages");
  console.log("DEBUG:: CropStages response", response.data); // 👈 xem thử data là gì
  return response.data;
}
