import { jwtDecode } from "jwt-decode";
import { roleSlugMap } from "@/lib/constrant/role";
import axios from "axios";

export interface DecodedToken {
  nameid: string;
  email: string;
  role: string;
  exp: number;
  iat: number;
}

export async function login(email: string, password: string): Promise<DecodedToken> {
  try {
    const response = await axios.post(
      "https://localhost:7163/api/Auth/login",
      { email, password },
      {
        validateStatus: () => true,
      }
    );

    const token = response.data; // 👈 trả về là chuỗi token luôn
    console.log("Token từ API:", token);

    const decoded: DecodedToken = jwtDecode(token);
    const roleSlug = roleSlugMap[decoded.role] ?? "unknown";

    localStorage.setItem("token", token);
    localStorage.setItem("user_id", decoded.nameid);
    localStorage.setItem("email", decoded.email);
    localStorage.setItem("user_role", roleSlug);
    localStorage.setItem("user_role_raw", decoded.role);
    localStorage.setItem("user_name", decoded.name); // 👈 nếu muốn hiển thị tên

    return decoded;
  } catch (err: any) {
    console.error("Đăng nhập lỗi:", err);
    throw new Error("Đăng nhập thất bại");
  }
}
