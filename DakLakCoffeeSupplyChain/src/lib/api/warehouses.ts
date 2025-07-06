const API_URL = "https://localhost:7163/api/Warehouses";

// ✅ Hàm tiện ích dùng chung gọi API an toàn, hỗ trợ cả ServiceResult và JSON thuần
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
      return { status: 0, message: `Lỗi server: ${res.status}` };
    }

    const data = await res.json();

    // ✅ Nếu BE trả kiểu ServiceResult (status, message, data)
    if ("status" in data && "message" in data) {
      if (data.status !== 1) {
        return { status: 0, message: data.message || "Lỗi từ backend" };
      }
      return { status: 1, message: data.message, data: data.data };
    }

    // ✅ Nếu BE trả kiểu Ok(data) → JSON thuần
    return { status: 1, message: "Thành công", data };
  } catch (err: any) {
    console.error("❌ Fetch exception:", err);
    return { status: 0, message: "Lỗi kết nối hoặc token không hợp lệ" };
  }
}

// ============================
// 📦 LẤY DANH SÁCH KHO
// ============================
export async function getAllWarehouses() {
  return await safeFetch(API_URL);
}

// ============================
// 📄 LẤY CHI TIẾT 1 KHO
// ============================
export async function getWarehouseById(id: string) {
  return await safeFetch(`${API_URL}/${id}`);
}

// ============================
// 📝 TẠO KHO MỚI
// ============================
export async function createWarehouse(data: any) {
  return await safeFetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
}

// ============================
// ✏️ CẬP NHẬT KHO
// ============================
export async function updateWarehouse(id: string, data: any) {
  return await safeFetch(`${API_URL}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
}

// ============================
// ❌ XOÁ KHO (MỀM)
// ============================
export async function deleteWarehouse(id: string) {
  return await safeFetch(`${API_URL}/${id}`, {
    method: "DELETE",
  });
}
