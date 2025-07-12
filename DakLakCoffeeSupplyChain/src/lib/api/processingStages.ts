import api from "./axios";

export interface ProcessingStage {
  stageId: string;
  stageName: string;
  description: string;
}

export async function getAllProcessingStages(): Promise<ProcessingStage[]> {
  try {
    const res = await api.get("/ProcessingStage");
    return res.data;
  } catch (err) {
    console.error("Lỗi getAllProcessingStages:", err);
    return [];
  }
}
