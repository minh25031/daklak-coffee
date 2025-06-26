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

// ✅ Create a warehouse receipt with InboundRequestId
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

  if (!res.ok) {
    throw new Error(data.message || "Failed to create receipt");
  }

  return data;
}
