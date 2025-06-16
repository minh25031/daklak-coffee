import { mockUserData, UserProfile } from "./users";
import { roleMap } from "@/lib/constrant/role"; // nếu bạn tách ra

export async function mockLogin(
  email: string,
  password: string
): Promise<UserProfile | null> {
  const user = mockUserData.find(
    (u) => u.Email === email && u.Password === password
  );

  if (!user) return null;

  // Gán localStorage
  localStorage.setItem("user_id", user.user_id);
  localStorage.setItem("username", user.Username);
  localStorage.setItem("user_role", roleMap[user.RoleID]);
  localStorage.setItem("email", user.Email);

  return user;
}

// Hàm kiểm tra xem người dùng đã đăng nhập chưa
export function isAuthenticated(): boolean {
  return !!localStorage.getItem("user_id");
}

// Hàm đăng xuất
export function logout(): void {
  localStorage.removeItem("user_id");
  localStorage.removeItem("username");
  localStorage.removeItem("user_role");
  localStorage.removeItem("full_user");
}
