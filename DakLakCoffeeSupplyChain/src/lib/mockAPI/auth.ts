// src/lib/mockapi/auth.ts
import { mockUsers, MockUser } from "./users";
import { v4 as uuidv4 } from "uuid";

// Login bằng email
export async function mockLogin({
  email,
  password,
}: {
  email: string;
  password: string;
}) {
  await new Promise((res) => setTimeout(res, 300));
  const user = mockUsers.find(
    (u) => u.email === email && u.password === password
  );
  if (!user) throw new Error("Email hoặc mật khẩu không đúng");
  return { token: "mock-token", user };
}

// Register bằng email + role
export async function mockRegister({
  fullName,
  email,
  password,
  role,
}: {
  fullName: string;
  email: string;
  password: string;
  role: string;
}) {
  await new Promise((res) => setTimeout(res, 300));
  const exists = mockUsers.find((u) => u.email === email);
  if (exists) throw new Error("Email đã tồn tại");

  const newUser: MockUser = {
    user_id: uuidv4(),
    email,
    password,
    role_id: getRoleId(role),
    role,
  };
  mockUsers.push(newUser);
  return { token: "mock-token", user: newUser };
}

function getRoleId(role: string): number {
  return role === "Farmer" ? 1 : role === "BusinessManager" ? 2 : 0;
}
