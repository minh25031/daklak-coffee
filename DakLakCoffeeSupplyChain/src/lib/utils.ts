import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { DEFAULT_ERROR_MESSAGE } from "./constrant/httpErrors";

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