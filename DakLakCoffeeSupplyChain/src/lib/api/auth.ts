import { jwtDecode } from "jwt-decode";
import { roleSlugMap } from "@/lib/constrant/role";

export interface DecodedToken {
  nameid: string;
  email: string;
  role: string; // VD: "Admin", "AgriculturalExpert", ...
  exp: number;
  iat: number;
}

export async function login(email: string, password: string): Promise<DecodedToken> {
  const response = await fetch("https://localhost:7163/api/Auth/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  });

  const result = await response.json();

  if (result.status !== 1) {
    throw new Error(result.message || "Đăng nhập thất bại");
  }

  const { token } = result.data;
  const decoded: DecodedToken = jwtDecode(token);

  // === 📦 Lưu vào localStorage ===
  const roleSlug = roleSlugMap[decoded.role] ?? "unknown";

  localStorage.setItem("token", token);
  localStorage.setItem("user_id", decoded.nameid);
  localStorage.setItem("email", decoded.email);
  localStorage.setItem("user_role", roleSlug);           
  localStorage.setItem("user_role_raw", decoded.role);    

  return decoded;
}

export function isAuthenticated(): boolean {
  return !!localStorage.getItem("token");
}

export function logout(): void {
  localStorage.clear();
}
