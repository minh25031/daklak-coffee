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

export interface ServiceResult<T> {
  status: number;
  message: string;
  data: T;
}

function getToken() {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("Chưa đăng nhập");
  return token;
}

export async function createWarehouseOutboundRequest(
  input: CreateWarehouseOutboundRequestInput
): Promise<string> {
  const token = getToken();

  const response = await fetch(ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(input),
  });

  const result = await response.json();
  if (!response.ok || result.status !== 1) {
    throw new Error(result.message || "Gửi yêu cầu thất bại");
  }

  return result.message || "Gửi yêu cầu thành công";
}

export async function getAllOutboundRequests(): Promise<ServiceResult<any[]>> {
  const token = getToken();
  const res = await fetch(`${ENDPOINT}/all`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  const result = await res.json();
  if (!res.ok || result.status !== 1) {
    throw new Error(result.message || "Lỗi tải danh sách");
  }

  return result;
}

export async function getOutboundRequestById(id: string): Promise<ServiceResult<any>> {
  const token = getToken();
  const res = await fetch(`${ENDPOINT}/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  const result = await res.json();
  if (!res.ok || result.status !== 1) {
    throw new Error(result.message || "Không tìm thấy yêu cầu");
  }

  return result;
}

export async function acceptOutboundRequest(id: string): Promise<ServiceResult<any>> {
  const token = getToken();
  const res = await fetch(`${ENDPOINT}/${id}/accept`, {
    method: "PUT",
    headers: { Authorization: `Bearer ${token}` },
  });

  return await res.json();
}

export async function cancelOutboundRequest(id: string): Promise<ServiceResult<any>> {
  const token = getToken();
  const res = await fetch(`${ENDPOINT}/${id}/cancel`, {
    method: "PUT",
    headers: { Authorization: `Bearer ${token}` },
  });

  return await res.json();
}
