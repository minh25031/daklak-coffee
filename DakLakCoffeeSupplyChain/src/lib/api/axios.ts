import axios, { AxiosInstance, AxiosResponse } from "axios";

const apiUrl = process.env.NEXT_PUBLIC_API_URL;

if (!apiUrl) {
  throw new Error("API URL is not defined in environment variables.");
}

console.log("🌐 API Base URL:", apiUrl);

const api: AxiosInstance = axios.create({
  baseURL: apiUrl,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor kiểm tra response
api.interceptors.response.use(
  (response: AxiosResponse) => {
    if (response.status >= 200 && response.status < 300) {
      return response;
    }
    return Promise.reject(
      new Error(response.data?.message || `Lỗi HTTP status ${response.status}`)
    );
  },
  (error) => {
    if (error.response) {
      return Promise.reject(
        new Error(
          error.response.data?.message ||
            `Lỗi HTTP status ${error.response.status}`
        )
      );
    } else if (error.request) {
      return Promise.reject(new Error("Không nhận được phản hồi từ máy chủ"));
    } else {
      return Promise.reject(error);
    }
  }
);

export default api;
