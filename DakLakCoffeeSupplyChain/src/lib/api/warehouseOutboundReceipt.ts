const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;
const ENDPOINT = `${API_BASE_URL}/WarehouseOutboundReceipts`;

export interface CreateOutboundReceiptInput {
  warehouseId: string;
  inventoryId: string;
  exportedQuantity: number;
  note?: string;
  destination?: string;
}

export interface ConfirmOutboundReceiptInput {
  confirmedQuantity: number;
  destinationNote?: string;
}

// 👉 kiểu dữ liệu summary trả về từ BE
export interface OutboundRequestSummary {
  requestedQuantity: number;
  confirmedQuantity: number;
  createdQuantity: number;
  draftQuantity: number;
  remainingByConfirm: number;
  remainingHardCap: number;
  inventoryAvailable: number;
}

export async function getAllOutboundReceipts() {
  const token = localStorage.getItem("token");
  const res = await fetch(`${ENDPOINT}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(await res.text());
  return await res.json();
}

export async function getOutboundReceiptById(id: string) {
  const token = localStorage.getItem("token");
  const res = await fetch(`${ENDPOINT}/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(await res.text());
  return await res.json();
}

export async function createOutboundReceipt(
  outboundRequestId: string,
  input: CreateOutboundReceiptInput
) {
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
  return await res.text();
}

export async function confirmOutboundReceipt(
  receiptId: string,
  input: ConfirmOutboundReceiptInput
) {
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
  return await res.json();
}

// ✅ THÊM HÀM NÀY & EXPORT
export async function getOutboundRequestSummary(
  outboundRequestId: string
): Promise<OutboundRequestSummary> {
  const token = localStorage.getItem("token");
  const res = await fetch(`${ENDPOINT}/${outboundRequestId}/summary`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(await res.text());
  return await res.json();
}
