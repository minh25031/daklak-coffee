export async function getLogsByInventoryId(inventoryId: string) {
  const token = localStorage.getItem("token");
  console.log("🔑 Gửi token:", token);

  const res = await fetch(`https://localhost:7163/api/InventoryLogs/by-inventory/${inventoryId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const contentType = res.headers.get("content-type");

  if (!res.ok) {
    const errorText = contentType?.includes("application/json")
      ? (await res.json()).message
      : await res.text();

    console.error("❌ Error response", res.status, errorText);
    throw new Error(errorText || "Đã có lỗi xảy ra khi tải lịch sử tồn kho.");
  }

  // Trả ra mảng log trực tiếp
  return await res.json();
}
export async function getAllInventoryLogs() {
  const token = localStorage.getItem("token");

  const res = await fetch("https://localhost:7163/api/InventoryLogs", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const contentType = res.headers.get("content-type");

  if (!res.ok) {
    const msg = contentType?.includes("application/json")
      ? (await res.json()).message
      : await res.text();
    throw new Error(msg || "Không thể tải log tồn kho.");
  }

  const data = await res.json();
  console.log("📦 Tất cả logs từ API:", data); // debug
  return data;
}
export async function getInventoryLogById(logId: string) {
  const token = localStorage.getItem("token");

  const res = await fetch(`https://localhost:7163/api/InventoryLogs/${logId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const contentType = res.headers.get("content-type");

  if (!res.ok) {
    const msg = contentType?.includes("application/json")
      ? (await res.json()).message
      : await res.text();
    throw new Error(msg || "Không thể tải chi tiết log tồn kho.");
  }

  return await res.json(); // log object
}
export async function softDeleteInventoryLog(logId: string) {
  const token = localStorage.getItem("token");

  const res = await fetch(`https://localhost:7163/api/InventoryLogs/soft/${logId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const contentType = res.headers.get("content-type");

  if (!res.ok) {
    const msg = contentType?.includes("application/json")
      ? (await res.json()).message
      : await res.text();
    throw new Error(msg || "Không thể xoá log tồn kho.");
  }

  return true; // success
}
