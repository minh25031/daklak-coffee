const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;
const ENDPOINT = `${API_BASE_URL}/WarehouseOutboundReceipts`;

export interface CreateOutboundReceiptInput {
  exportedQuantity: number;
  note?: string;
  destination?: string;
}

export interface ConfirmOutboundReceiptInput {
  confirmedQuantity: number;
  destinationNote?: string;
}

// 📥 Lấy tất cả phiếu xuất kho thuộc công ty staff
export async function getAllOutboundReceipts() {
  const token = localStorage.getItem("token");
  const res = await fetch(`${ENDPOINT}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) throw new Error(await res.text());
  return await res.json();
}

// 🔍 Xem chi tiết phiếu xuất
export async function getOutboundReceiptById(id: string) {
  const token = localStorage.getItem("token");
  const res = await fetch(`${ENDPOINT}/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) throw new Error(await res.text());
  return await res.json();
}

// ✍️ Tạo phiếu xuất kho (gắn với outbound request)
export async function createOutboundReceipt(outboundRequestId: string, input: CreateOutboundReceiptInput) {
  const token = localStorage.getItem("token");
  const res = await fetch(`${ENDPOINT}/${outboundRequestId}/receipt`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(input),
  });

  if (!res.ok) throw new Error(await res.text());
  return await res.text(); // thường trả về id hoặc message
}

// ✅ Xác nhận phiếu xuất kho
export async function confirmOutboundReceipt(receiptId: string, input: ConfirmOutboundReceiptInput) {
  const token = localStorage.getItem("token");
  const res = await fetch(`${ENDPOINT}/${receiptId}/confirm`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(input),
  });

  if (!res.ok) throw new Error(await res.text());
  return await res.json(); // có thể chứa message, id
}
