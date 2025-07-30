import axios, { AxiosInstance, AxiosResponse } from "axios";
import { HTTP_ERROR_MESSAGES } from "../constants/httpErrors";

const apiUrl = process.env.NEXT_PUBLIC_API_URL;

if (!apiUrl) {
  throw new Error("API URL is not defined in environment variables.");
}

const api: AxiosInstance = axios.create({
  baseURL: apiUrl,
  timeout: 10000, // 10 giây timeout
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error) => {
    // ❌ TIMEOUT
    if (error.code === "ECONNABORTED" || error.message.includes("timeout")) {
      return Promise.reject(new Error("Yêu cầu mất quá nhiều thời gian, vui lòng thử lại sau."));
    }

    // ❌ KHÔNG CÓ PHẢN HỒI TỪ SERVER (mạng / SSL / CORS)
    if (error.request && !error.response) {
      return Promise.reject(new Error("Không nhận được phản hồi từ máy chủ."));
    }

    // ❌ LỖI TỪ BACKEND CÓ RESPONSE
    if (error.response) {
      const status = error.response.status;
      let message = "";

      if (typeof error.response.data === "string" && error.response.data.trim() !== "") {
        message = error.response.data;
      } else {
        message =
          error.response.data?.message ||
          HTTP_ERROR_MESSAGES[status] ||
          `Lỗi HTTP status ${status}`;
      }

      return Promise.reject(new Error(message));
    }

    // ❌ LỖI KHÔNG XÁC ĐỊNH
    return Promise.reject(error);
  }
);

export default api;
