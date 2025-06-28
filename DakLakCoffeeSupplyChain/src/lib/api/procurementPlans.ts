export type ProcurementPlan = {
  planId: string;
  planCode: string;
  title: string;
  description: string;
  totalQuantity: number;
  createdBy: string;
  startDate: string;
  endDate: string;
  progressPercentage: number;
  createdAt: string;
  updatedAt: string;
  status: string;
};

export async function getAllProcurementPlans(): Promise<ProcurementPlan[]> {
  try {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("Token không tồn tại!");

    const res = await fetch("https://localhost:7163/api/ProcurementPlans", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`, 
      },
      cache: "no-store",
    });

    if (!res.ok) throw new Error("Không lấy được dữ liệu kế hoạch thu mua");
    return await res.json();
  } catch (err) {
    console.error("Lỗi khi gọi API:", err);
    return [];
  }
}
