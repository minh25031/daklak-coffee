import api from "@/lib/api/axios";

export type CropStage = {
  stageId: number;
  stageCode: string;
  stageName: string;
  description?: string;
  orderIndex: number;
};

// GET all crop stages
export async function getCropStages(): Promise<CropStage[]> {
  const response = await api.get("/CropStages");
  return response.data;
}