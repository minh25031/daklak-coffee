export async function getAllWarehouseReceipts() {
  const token = localStorage.getItem("token");
  const res = await fetch("https://localhost:7163/api/WarehouseReceipts", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return await res.json();
}

// Fetch a single receipt by its ID
export async function getWarehouseReceiptById(id: string) {
  const token = localStorage.getItem("token");
  const res = await fetch(`https://localhost:7163/api/WarehouseReceipts/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return await res.json();
}

export async function createWarehouseReceipt(
  inboundRequestId: string,
  receiptData: {
    warehouseId: string;
    batchId: string;
    receivedQuantity: number;
    note: string;
  }
) {
  const token = localStorage.getItem("token");

  const res = await fetch(
    `https://localhost:7163/api/WarehouseReceipts/${inboundRequestId}/receipt`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(receiptData),
    }
  );

  const data = await res.json();

  // ✅ Nếu BE trả status khác 1, thì ném lỗi
  if (data.status !== 1) {
    throw new Error(data.message || "Tạo phiếu thất bại từ backend");
  }

  return data;
}
export async function confirmWarehouseReceipt(
  receiptId: string,
  confirmData: {
    confirmedQuantity: number;
    note?: string;
  }
) {
  const token = localStorage.getItem("token");

  const res = await fetch(`https://localhost:7163/api/WarehouseReceipts/${receiptId}/confirm`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(confirmData),
  });

  const data = await res.json();

  if (data.status !== 1) {
    throw new Error(data.message || "Xác nhận thất bại từ backend");
  }

  return data;
}