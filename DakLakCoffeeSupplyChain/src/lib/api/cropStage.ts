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
  return response.data.map((s: CropStage) => ({
    ...s,
    stageCode: s.stageCode, 
  }));
}
