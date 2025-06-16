
export type CropSeason = {
  cropSeasonId: string;
  seasonName: string;
  startDate: string;
  endDate: string;
  area: number;
  farmerName: string;
  status: string;
};


export async function getAllCropSeasons(): Promise<CropSeason[]> {
  try {
    const res = await fetch("https://localhost:7163/api/CropSeasons", {
      cache: "no-store",
    });

    if (!res.ok) throw new Error("Lỗi khi lấy danh sách mùa vụ");

    return await res.json();
  } catch (error) {
    console.error("API getAllCropSeasons:", error);
    return [];
  }
}
