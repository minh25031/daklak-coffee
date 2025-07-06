import axios, { AxiosInstance, AxiosResponse } from "axios";
import { HTTP_ERROR_MESSAGES } from "../constrant/httpErrors";

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

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token"); // hoặc "access_token"
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error) => {
    if (error.response) {
      const status = error.response.status;
      let message = "";
      // Nếu dữ liệu trả về là chuỗi không rỗng, sử dụng nó làm thông báo lỗi
      // Nếu không, sử dụng thông báo lỗi mặc định hoặc thông báo theo status code
      // Nếu muốn đánh chặn truy cập vì unauthorized thì đừng làm ở đây mà hãy làm ở phía dashboard page, sau khi người dùng nhập url dashboard mà chưa đăng nhập thì sẽ chuyển hướng về trang unauthorized hoặc trang đăng nhập.
      if (typeof error.response.data === "string" && error.response.data.trim() !== "") {
        message = error.response.data;
      } else {
        message =
          error.response.data?.message ||
          HTTP_ERROR_MESSAGES[status] || `Lỗi HTTP status ${status}`;
      }
      return Promise.reject(new Error(message));
    } else if (error.request) {
      return Promise.reject(
        new Error("Không nhận được phản hồi từ máy chủ")
      );
    } else {
      return Promise.reject(error);
    }
  }
);

export default api;
