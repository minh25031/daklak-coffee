import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { DEFAULT_ERROR_MESSAGE } from "./constants/httpErrors";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getErrorMessage(error: unknown): string {
  // Ưu tiên: lỗi trong response.message (thường là ServiceResult)
  const axiosMsg = (error as any)?.response?.data?.message;
  if (typeof axiosMsg === 'string') return axiosMsg;

  // Xử lý lỗi dạng validation: response.data.errors
  const validationErrors = (error as any)?.response?.data?.errors;
  if (validationErrors && typeof validationErrors === 'object') {
    return Object.entries(validationErrors)
      .map(([field, messages]) => `${field}: ${(messages as string[]).join(', ')}`)
      .join('; ');
  }

  // Fallback: lỗi thông thường từ err.message
  const msg = (error as any)?.message;
  if (typeof msg === 'string') return msg;

  // Trường hợp không rõ: fallback mặc định
  return DEFAULT_ERROR_MESSAGE;
}

// Hàm này format date thành "DD-MM-YYYY" và trả về "Chưa xác định" nếu api date là null
export function formatDate(dateStr: string | Date | undefined) {
  if (!dateStr) return "Chưa xác định";
  // Nếu trả về kiểu số (timestamp) thì xử lý lại cho phù hợp
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime()) || d.getFullYear() === 1970) return "Chưa xác định";
    // Lấy ngày/tháng/năm, pad số 0
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    return `${day}-${month}-${year}`;
  } catch {
    return "Chưa xác định";
  }
}

export function formatQuantity(value: number): string {
  return value >= 1000
    ? `${(value / 1000).toLocaleString()} tấn`
    : `${value.toLocaleString()} kg`;
}

export function formatUnitPriceByQuantity(unitPrice: number, quantity: number): string {
  return quantity >= 1000
    ? `${(unitPrice * 1000).toLocaleString()} VND/tấn`
    : `${unitPrice.toLocaleString()} VND/kg`;
}

export function formatDiscount(value: number): string {
  return `${value.toLocaleString()} VND`;
}
