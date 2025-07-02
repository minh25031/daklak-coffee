import axios from "axios";
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Chỉ nên dùng ở hàm catch trong try catch, xem api resendVerificationEmail ở auth làm ví dụ
export function extractErrorMessage(err: unknown): string {
  if (axios.isAxiosError(err)) {
    const data = err.response?.data;
    return typeof data === "string" ? data : data?.message || "Lỗi không xác định";
  }
  if (err instanceof Error) return err.message;
  return "Lỗi không xác định";
}
