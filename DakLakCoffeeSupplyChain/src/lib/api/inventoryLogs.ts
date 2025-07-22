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
