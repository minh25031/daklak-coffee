// lib/api/cropSeasons.ts
import { CropSeason } from "@/types/CropSeason";

let mockCropSeasons: CropSeason[] = [
  {
    id: "1",
    name: "Mùa vụ Đông Xuân 2025",
    startDate: "2025-01-01",
    endDate: "2025-04-30",
    coffeeType: "Arabica",
    status: "Planning",
    committedYield: 5000,
  },
  {
    id: "2",
    name: "Mùa vụ Hè Thu 2025",
    startDate: "2025-05-01",
    endDate: "2025-08-31",
    coffeeType: "Robusta",
    status: "Growing",
    committedYield: 7000,
    actualYield: 6800,
  },
];

export async function getAllCropSeasons(): Promise<CropSeason[]> {
  return [...mockCropSeasons];
}

export async function getCropSeasonById(id: string) {
  const all = await getAllCropSeasons(); // hoặc gọi từ mảng mock
  return all.find((s) => s.id === id) ?? null;
}

// ➕ CREATE
export async function createCropSeason(data: CropSeason): Promise<void> {
  mockCropSeasons.push({ ...data, id: Date.now().toString() });
}

export async function updateCropSeason(
  id: string,
  data: Partial<CropSeason>
): Promise<void> {
  const index = mockCropSeasons.findIndex((s) => s.id === id);
  if (index !== -1) {
    mockCropSeasons[index] = { ...mockCropSeasons[index], ...data };
  }
}

export async function deleteCropSeasonById(id: string): Promise<void> {
  mockCropSeasons = mockCropSeasons.filter((s) => s.id !== id);
}
