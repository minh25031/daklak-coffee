import api from "@/lib/api/axios";

/** =====================
 *  TYPE DEFINITIONS
 *  ===================== */
export type CropProgress = {
  progressId: string;
  cropSeasonDetailId: string;
  stageId: number;
  stageName: string;
  stageCode: string;
  progressDate: string; // "YYYY-MM-DD"
  note: string;
  photoUrl?: string | null;
  videoUrl?: string | null;
  stepIndex?: number;
  // ❌ actualYield removed per BE change
};

export type CropProgressViewByDetail = {
  cropSeasonDetailId: string;
  progresses: CropProgress[];
};

/** =====================
 *  Helpers
 *  ===================== */
// API có thể trả trực tiếp data hoặc bọc trong { code, message, data }
function unwrap<T>(res: any): T {
  return res?.data?.data ?? res?.data;
}

function assertNotFuture(dateStr: string) {
  const [y, m, d] = dateStr.split("-").map(Number);
  const dt = new Date(y, (m ?? 1) - 1, d);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (dt > today) throw new Error("Ngày ghi nhận không được lớn hơn hôm nay.");
}

/** =====================
 *  GET ALL
 *  ===================== */
export async function getAllCropProgresses(): Promise<CropProgress[]> {
  const res = await api.get("/CropProgresses");
  return unwrap<CropProgress[]>(res);
}

/** =====================
 *  GET BY DETAIL
 *  ===================== */
export async function getCropProgressesByDetailId(
  id: string
): Promise<CropProgress[]> {
  try {
    const res = await api.get(`/CropProgresses/by-detail/${id}`);
    // BE trả { cropSeasonDetailId, progresses } trong data
    const wrapped = unwrap<CropProgressViewByDetail>(res);
    return wrapped?.progresses ?? [];
  } catch (err: any) {
    if (err.response?.status === 404) return [];
    throw err;
  }
}

/** =====================
 *  CREATE
 *  ===================== */
export type CropProgressCreateInput = {
  cropSeasonDetailId: string; // GUID
  stageId: number; // int
  stageDescription?: string;
  stepIndex?: number;
  progressDate: string; // "YYYY-MM-DD"
  note?: string;
  photoUrl?: string | null;
  videoUrl?: string | null;
};

export async function createCropProgress(
  data: CropProgressCreateInput
): Promise<CropProgress> {
  // FE validate nhẹ
  if (!data.stageId || data.stageId <= 0)
    throw new Error("stageId phải là số nguyên dương.");
  assertNotFuture(data.progressDate);

  const payload = {
    ...data,
    photoUrl: data.photoUrl ?? null,
    videoUrl: data.videoUrl ?? null,
    stepIndex: data.stepIndex ?? 1,
  };

  const res = await api.post("/CropProgresses", payload);
  return unwrap<CropProgress>(res);
}

/** =====================
 *  UPDATE
 *  ===================== */
export type CropProgressUpdateInput = {
  progressId: string; // GUID
  cropSeasonDetailId: string; // GUID
  stageId: number;
  stageDescription?: string;
  progressDate: string; // "YYYY-MM-DD"
  note?: string;
  photoUrl?: string | null;
  videoUrl?: string | null;
  stepIndex?: number;
};

export async function updateCropProgress(
  progressId: string,
  data: CropProgressUpdateInput
): Promise<CropProgress> {
  if (!data.stageId || data.stageId <= 0)
    throw new Error("stageId phải là số nguyên dương.");
  assertNotFuture(data.progressDate);

  const payload = {
    ...data,
    photoUrl: data.photoUrl ?? null,
    videoUrl: data.videoUrl ?? null,
    stepIndex: data.stepIndex ?? 1,
  };

  const res = await api.put(`/CropProgresses/${progressId}`, payload);
  return unwrap<CropProgress>(res);
}

/** =====================
 *  DELETE (SOFT)
 *  ===================== */
export async function deleteCropProgress(progressId: string): Promise<void> {
  await api.patch(`/CropProgresses/soft-delete/${progressId}`);
}
