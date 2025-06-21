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

    const result = response.data;

    // 🔐 Nếu status trong body khác 1 thì coi là lỗi
    if (result.status !== 1) {
      throw new Error(result.message || "Đăng nhập thất bại");
    }

    const { token } = result.data;
    const decoded: DecodedToken = jwtDecode(token);
    const roleSlug = roleSlugMap[decoded.role] ?? "unknown";

    localStorage.setItem("token", token);
    localStorage.setItem("user_id", decoded.nameid);
    localStorage.setItem("email", decoded.email);
    localStorage.setItem("user_role", roleSlug);
    localStorage.setItem("user_role_raw", decoded.role);

    return decoded;
  } catch (err: any) {
    console.error("Đăng nhập lỗi:", err);
    throw new Error(err.response?.data?.message || "Đăng nhập thất bại");
  }
}
