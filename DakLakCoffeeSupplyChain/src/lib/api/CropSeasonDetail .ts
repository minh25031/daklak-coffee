export type CreateCropSeasonDetail = {
  cropSeasonId: string;
  coffeeTypeId: string;
  expectedHarvestStart: string;
  expectedHarvestEnd: string;
  estimatedYield: number;
  actualYield?: number | null; // optional
  areaAllocated: number;
  plannedQuality: string;
  qualityGrade?: string;
  status: number;
};

const API_BASE = 'https://localhost:7163/api/CropSeasonDetails';

export async function createCropSeasonDetail(data: CreateCropSeasonDetail): Promise<void> {
  try {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('Token không tồn tại!');

    const res = await fetch(API_BASE, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(errorText || 'Thêm vùng trồng thất bại');
    }
  } catch (err) {
    console.error('Lỗi createCropSeasonDetail:', err);
    throw err;
  }
}
