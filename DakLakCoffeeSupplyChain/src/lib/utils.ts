import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { DEFAULT_ERROR_MESSAGE } from "./constrant/httpErrors";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getErrorMessage(error: unknown): string {
  const axiosMsg = (error as any)?.response?.data?.message;
  if (typeof axiosMsg === 'string') return axiosMsg;

  const msg = (error as any)?.message;
  if (typeof msg === 'string') return msg;

  return DEFAULT_ERROR_MESSAGE;
}
