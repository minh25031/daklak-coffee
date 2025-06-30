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

    const result = response.data;

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

export async function signUp(signUpData: SignUpData): Promise<void> {
  try {
    const response = await axios.post(
      "https://localhost:7163/api/Auth/SignUpRequest",
      signUpData,
      {
        validateStatus: () => true,
      }
    );

    console.log("Kết quả đăng ký:", response.data, response.status);

    if (response.status !== 200 && response.status !== 201) {
      const errorMessage =
        typeof response.data === "string"
          ? response.data
          : response.data?.message || "Đăng ký thất bại";
      throw new Error(errorMessage);
    }
    // Lưu email vào localStorage để dùng lại
    localStorage.setItem("pending_email", signUpData.email);

  } catch (err: any) {
    console.error("Đăng ký lỗi:", err);
    throw new Error(err || "Đăng ký thất bại");
  }
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
  } catch (err: any) {
    console.error("Gửi lại email xác thực thất bại:", err);
    alert("Có lỗi xảy ra khi gửi lại email xác thực.");
  }
}
