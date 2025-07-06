import { jwtDecode } from "jwt-decode";
import { roleSlugMap } from "@/lib/constrant/role";
import axios from "axios";
import { extractErrorMessage } from "../utils";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

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
      `${API_URL}/Auth/login`,
      { email, password },
      { validateStatus: () => true }
    );

    const token = response.data;

    if (!token || typeof token !== "string") {
      throw new Error("Token không hợp lệ từ server");
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
    console.error("Login error:", err);
    throw new Error(err?.response?.data || "Đăng nhập thất bại");
  }
}



export async function signUp(signUpData: SignUpData): Promise<void> {
  const response = await axios.post(`${API_URL}/Auth/SignUpRequest`, signUpData, {
    validateStatus: () => true,
  });

  if (response.status !== 200 && response.status !== 201) {
    const errorMessage =
      typeof response.data === "string"
        ? response.data
        : response.data?.message || "Sign up failed";
    throw new Error(errorMessage);
  }

  localStorage.setItem("pending_email", signUpData.email);
}

export async function resendVerificationEmail(email: string): Promise<void> {
  try {
    const response = await axios.post(`${API_URL}/Auth/resend-verification-email`, { email });

    if (response.status === 200) {
      alert("Verification email has been resent.");
    } else {
      alert(response.data || "Unable to resend verification email.");
    }
  } catch (err: unknown) {
    alert(extractErrorMessage(err));
  }
}
