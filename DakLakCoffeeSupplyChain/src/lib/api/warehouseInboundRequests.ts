export interface CreateWarehouseInboundRequestInput {
  requestedQuantity: number;
  preferredDeliveryDate: string;
  note?: string;
  batchId: string;
  businessStaffId: string;
}

export async function createWarehouseInboundRequest(input: CreateWarehouseInboundRequestInput): Promise<string> {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("Chưa đăng nhập");

  const response = await fetch("https://localhost:7163/api/WarehouseInboundRequests", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(input),
  });

  const result = await response.json();
  if (result.status !== 1) {
    throw new Error(result.message || "Gửi yêu cầu thất bại");
  }

  return result.message;
}
