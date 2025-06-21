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
    const token = localStorage.getItem("token");
    if (!token) throw new Error("Token không tồn tại!");

    const res = await fetch("https://localhost:7163/api/CropSeasons", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`, 
      },
      cache: "no-store",
    });

    if (!res.ok) throw new Error("Không lấy được dữ liệu mùa vụ");
    return await res.json();
  } catch (err) {
    console.error("Lỗi khi gọi API:", err);
    return [];
  }
}
