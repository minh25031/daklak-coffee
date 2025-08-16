const BASE_URL = "https://localhost:7163/api/WarehouseReceipts";

// Hàm tiện ích dùng chung để gọi API an toàn
async function safeFetch(
  url: string,
  options: RequestInit = {}
): Promise<{ status: number; message: string; data?: any }> {
  const token = localStorage.getItem("token");
  if (!token) {
    return { status: -1, message: "Token không tồn tại trong localStorage" };
  }

  const headers: HeadersInit = {
    Authorization: `Bearer ${token}`,
    ...(options.headers || {}),
  };

  try {
    const res = await fetch(url, { ...options, headers });
    const ct = res.headers.get("content-type") || "";
    const body = ct.includes("application/json") ? await res.json() : await res.text();
    const message =
      typeof body === "string" ? body : body?.message || body?.Message || "";

    if (!res.ok) {
      // Giữ nguyên mã lỗi để UI biết 422, 404...
      return { status: res.status, message: message || `Lỗi ${res.status}` };
    }

    return { status: 1, message: message || "Thành công", data: body };
  } catch (err) {
    console.error("❌ Fetch exception:", err);
    return { status: -1, message: "Lỗi kết nối hoặc token không hợp lệ" };
  }
}

// ================================
// 📦 GET ALL RECEIPTS
// ================================
export async function getAllWarehouseReceipts() {
  return await safeFetch(BASE_URL);
}

// ================================
// 🔍 DEBUG INFO
// ================================
export async function getDebugInfo() {
  return await safeFetch(`${BASE_URL}/debug`);
}

// ================================
// 📄 GET RECEIPT BY ID
// ================================
export async function getWarehouseReceiptById(id: string) {
  return await safeFetch(`${BASE_URL}/${id}`);
}

// ================================
// 📝 CREATE RECEIPT
// ================================
export async function createWarehouseReceipt(
  inboundRequestId: string,
  receiptData: {
    warehouseId: string;
    batchId?: string;
    detailId?: string;
    receivedQuantity: number;
    note: string;
  }
) {
  return await safeFetch(`${BASE_URL}/${inboundRequestId}/receipt`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(receiptData),
  });
}

// ================================
// ✅ CONFIRM RECEIPT
// ================================
export async function confirmWarehouseReceipt(
  receiptId: string,
  confirmData: { confirmedQuantity: number; note?: string }
) {
  return await safeFetch(`${BASE_URL}/${receiptId}/confirm`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(confirmData),
  });
}
