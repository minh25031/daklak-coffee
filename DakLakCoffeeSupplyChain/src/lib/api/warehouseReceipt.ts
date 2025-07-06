const BASE_URL = "https://localhost:7163/api/WarehouseReceipts";

// Hàm tiện ích dùng chung để gọi API an toàn
async function safeFetch(
  url: string,
  options: RequestInit = {}
): Promise<{ status: number; message: string; data?: any }> {
  const token = localStorage.getItem("token");

  if (!token) {
    return { status: 0, message: "Token không tồn tại trong localStorage" };
  }

  const headers: HeadersInit = {
    Authorization: `Bearer ${token}`,
    ...(options.headers || {}),
  };

  try {
    const res = await fetch(url, { ...options, headers });

    if (!res.ok) {
      const text = await res.text();
      console.error("❌ HTTP Error:", res.status, text);
      return { status: 0, message: `Lỗi server: ${res.status} - ${text}` };
    }

    const data = await res.json();
    return { status: 1, message: "Thành công", data };
  } catch (err: any) {
    console.error("❌ Fetch exception:", err);
    return { status: 0, message: "Lỗi kết nối hoặc token không hợp lệ" };
  }
}

// ================================
// 📦 GET ALL RECEIPTS
// ================================
export async function getAllWarehouseReceipts() {
  return await safeFetch(BASE_URL);
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
    batchId: string;
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
  confirmData: {
    confirmedQuantity: number;
    note?: string;
  }
) {
  return await safeFetch(`${BASE_URL}/${receiptId}/confirm`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(confirmData),
  });
}
// 