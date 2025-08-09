import api from "./axios";

// DTO: Option hiển thị sản phẩm trong dropdown (id + tên)
export interface ProductOption {
  productId: string;
  name: string;
}

// API: Lấy danh sách sản phẩm từ backend và map sang dạng ProductOption cho UI
export async function getProductOptions(): Promise<ProductOption[]> {
  const { data } = await api.get<{ productId: string; productName: string }[]>("/products");
  return data.map((p) => ({
    productId: p.productId,
    name: p.productName,
  }));
}