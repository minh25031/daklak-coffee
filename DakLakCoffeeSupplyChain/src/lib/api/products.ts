import api from "./axios";
import { ProductStatusValue } from "@/lib/constants/productStatus";

// DTO: Option hiển thị sản phẩm trong dropdown (id + tên)
export interface ProductOption {
  productId: string;
  name: string;
}

// DTO: ProductViewAllDto tương ứng backend
export interface ProductViewAllDto {
  productId: string;
  productCode: string;
  productName: string;
  unitPrice?: number | null;
  quantityAvailable?: number | null;
  unit: string; // ProductUnit as string
  originRegion: string;
  evaluatedQuality: string;
  evaluationScore?: number | null;
  status: ProductStatusValue;
  createdAt: string;
  coffeeTypeName: string;
  inventoryLocation: string;
  batchCode: string;
}

// API: Lấy danh sách sản phẩm
export async function getAllProducts(): Promise<ProductViewAllDto[]> {
  const { data } = await api.get<ProductViewAllDto[]>("/Products");
  return data;
}

// API: Xoá mềm sản phẩm
export async function softDeleteProduct(id: string): Promise<void> {
  await api.patch(`/Products/soft-delete/${id}`);
}

// API: Lấy danh sách sản phẩm từ backend và map sang dạng ProductOption cho UI
export async function getProductOptions(): Promise<ProductOption[]> {
  const { data } = await api.get<
    { productId: string; productName: string }[]
  >("/products");
  return data.map((p) => ({
    productId: p.productId,
    name: p.productName,
  }));
}