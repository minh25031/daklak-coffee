const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;
const ENDPOINT = `${API_BASE_URL}/WarehouseOutboundRequests`;

export interface CreateWarehouseOutboundRequestInput {
  warehouseId: string;
  inventoryId: string;
  requestedQuantity: number;
  unit: string;
  purpose?: string;
  reason?: string;
  orderItemId?: string;
}

export async function createWarehouseOutboundRequest(
  input: CreateWarehouseOutboundRequestInput
): Promise<string> {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("Chưa đăng nhập");

  const response = await fetch(ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(input),
  });

  const contentType = response.headers.get("content-type");

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Lỗi server: ${errorText}`);
  }

  if (contentType?.includes("application/json")) {
    const result = await response.json();
    if (result.status !== 1) {
      throw new Error(result.message || "Gửi yêu cầu thất bại");
    }
    return result.message;
  }

  const text = await response.text();
  return text || "Gửi yêu cầu thành công";
}

export async function getAllOutboundRequests() {
  const token = localStorage.getItem("token");
  const res = await fetch(`${ENDPOINT}/all`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return await res.json();
}

export async function getOutboundRequestById(id: string) {
  const token = localStorage.getItem("token");
  const res = await fetch(`${ENDPOINT}/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return await res.json();
}

export async function acceptOutboundRequest(id: string) {
  const token = localStorage.getItem("token");
  const res = await fetch(`${ENDPOINT}/${id}/accept`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return await res.json();
}

export async function cancelOutboundRequest(id: string) {
  const token = localStorage.getItem("token");
  const res = await fetch(`${ENDPOINT}/${id}/cancel`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return await res.json();
}
