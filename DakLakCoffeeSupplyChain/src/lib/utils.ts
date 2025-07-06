import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { DEFAULT_ERROR_MESSAGE } from "./constrant/httpErrors";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Chỉ nên dùng ở hàm catch trong try catch, xem api resendVerificationEmail ở auth làm ví dụ
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return DEFAULT_ERROR_MESSAGE;
}
