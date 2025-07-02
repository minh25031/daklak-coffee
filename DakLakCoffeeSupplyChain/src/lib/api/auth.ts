import { jwtDecode } from "jwt-decode";
import { roleSlugMap } from "@/lib/constrant/role";
import { extractErrorMessage } from "../utils";
import api from "./axios";

export interface DecodedToken {
  nameid: string;
  email: string;
  role: string;
  exp: number;
  iat: number;
}

export interface SignUpData {
  name: string;
  email: string;
  password: string;
  phone: string;
  roleId: number;
  companyName?: string;
  taxId?: string;
  businessLicenseURl?: string;
}

export async function login(email: string, password: string): Promise<DecodedToken> {
  try {
    const response = await api.post("/Auth/login", { email, password });

    const token = response.data;

    if (!token || typeof token !== "string") {
      throw new Error("Đăng nhập thất bại: Token không hợp lệ");
    }

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
    throw new Error(extractErrorMessage(err));
  }
}

export async function signUp(signUpData: SignUpData): Promise<void> {
  try {
    const response = await api.post("/Auth/SignUpRequest", signUpData);

    if (![200, 201].includes(response.status)) {
      const errorMessage =
        typeof response.data === "string"
          ? response.data
          : response.data?.message || "Đăng ký thất bại";
      throw new Error(errorMessage);
    }

    localStorage.setItem("pending_email", signUpData.email);
  } catch (err) {
    throw new Error(extractErrorMessage(err));
  }
}

export async function resendVerificationEmail(email: string): Promise<void> {
  try {
    const response = await api.post("/Auth/resend-verification-email", { email });

    if (response.status === 200) {
      alert("Email xác thực đã được gửi lại.");
    } else {
      alert(response.data?.message || "Không thể gửi lại email xác thực.");
    }
  } catch (err) {
    alert(extractErrorMessage(err));
  }
}