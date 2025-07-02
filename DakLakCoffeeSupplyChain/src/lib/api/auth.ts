import { jwtDecode } from "jwt-decode";
import { roleSlugMap } from "@/lib/constrant/role";
import axios from "axios";
import { extractErrorMessage } from "../utils";

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
    const response = await axios.post(
      "https://localhost:7163/api/Auth/login",
      { email, password },
      {
        validateStatus: () => true,
      }
    );

    const token = response.data; // 👈 trả về là chuỗi token luôn
    console.log("Token từ API:", token);

    const token = response.data;

    // Nếu API trả về không phải chuỗi token, ném lỗi
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
    localStorage.setItem("user_name", decoded.name); // 👈 nếu muốn hiển thị tên

    return decoded;
  } catch (err: any) {
    console.error("Đăng nhập lỗi:", err);
    throw new Error("Đăng nhập thất bại");
    throw new Error(err?.response?.data?.message || "Đăng nhập thất bại");
  }
}


export async function signUp(signUpData: SignUpData): Promise<void> {
    const response = await axios.post(
      "https://localhost:7163/api/Auth/SignUpRequest",
      signUpData,
    { validateStatus: () => true }
    );

  if (response.status !== 200 && response.status !== 201) 
  {
      const errorMessage =
        typeof response.data === "string"
          ? response.data
          : response.data?.message || "Đăng ký thất bại";
      throw new Error(errorMessage);
    }

    localStorage.setItem("pending_email", signUpData.email);
}


export async function resendVerificationEmail(email: string): Promise<void> {
  try {
    const response = await axios.post(
      "https://localhost:7163/api/Auth/resend-verification-email",
      { email }
    );

    if (response.status === 200) {
      alert("Email xác thực đã được gửi lại.");
    } else {
      alert(response.data || "Không thể gửi lại email xác thực.");
    }
  } catch (err: unknown) {
    alert(extractErrorMessage(err));
  }
}
