const BASE_URL = "https://localhost:7163/api/Inventories";

function getAuthHeaders() {
  const token = localStorage.getItem("token");
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
}

export async function getAllInventories() {
  try {
    const res = await fetch(BASE_URL, {
      headers: getAuthHeaders(),
    });

    if (!res.ok) {
      const err = await res.text();
      return { status: res.status, message: err, data: [] };
    }

    const data = await res.json();
    return { status: 200, message: "OK", data };
  } catch (err: any) {
    return {
      status: 500,
      message: err.message || "Lỗi kết nối đến server",
      data: [],
    };
  }
}

export async function getInventoryById(id: string) {
  try {
    const res = await fetch(`${BASE_URL}/${id}`, {
      headers: getAuthHeaders(),
    });

    if (!res.ok) {
      const err = await res.text();
      return { status: res.status, message: err, data: null };
    }

    const data = await res.json();
    return { status: 200, message: "OK", data };
  } catch (err: any) {
    return {
      status: 500,
      message: err.message || "Lỗi kết nối đến server",
      data: null,
    };
  }
}

export async function createInventory(data: {
  warehouseId: string;
  batchId: string;
  quantity: number;
}) {
  try {
    const res = await fetch(BASE_URL, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const err = await res.text();
      return { status: res.status, message: err };
    }

    const result = await res.json();
    return { status: 200, message: "Tạo thành công", data: result };
  } catch (err) {
    return {
      status: 500,
      message: "Lỗi không xác định khi tạo tồn kho.",
    };
  }
}
