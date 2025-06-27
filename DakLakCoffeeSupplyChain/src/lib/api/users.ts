// lib/api/users.ts
export interface UserProfile {
  userId: string; // Guid in backend
  userCode: string;
  name: string;
  email: string;
  phoneNumber: string;
  roleName: string;
  status: UserAccountStatus;
  lastLogin?: Date;
  registrationDate: Date;
}

export interface UserProfileDetails {
  userId: string; // Guid in backend
  userCode: string;
  email: string;
  phoneNumber: string;
  name: string;
  gender: Gender;
  dateOfBirth?: Date;
  address: string;
  profilePictureUrl: string;
  emailVerified?: boolean;
  isVerified?: boolean;
  loginType: string;
  status: UserAccountStatus;
  roleName: string;
  registrationDate: Date;
  lastLogin?: Date;
  updatedAt: Date;
}

export enum UserAccountStatus {
  Unknown = "Unknown",
  PendingApproval = "PendingApproval",
  Active = "Active",
  Inactive = "Inactive",
  Locked = "Locked",
  Suspended = "Suspended",
  Rejected = "Rejected",
  Deleted = "Deleted",
  Banned = "Banned",
}

export enum Gender {
  Unknown = "Unknown",
  Male = "Male",
  Female = "Female",
  Other = "Other",
}

export enum LoginType {
  System = "System",
  Google = "Google",
  Facebook = "Facebook",
  Apple = "Apple",
}

const API_URL = "https://localhost:7163/api/UserAccounts";

export async function getAllUsers(): Promise<UserProfile[]> {
  const token = localStorage.getItem("token");
  const res = await fetch(API_URL, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) throw new Error("Không lấy được danh sách người dùng");
  return await res.json();
}

export async function getUserById(id: string): Promise<UserProfileDetails> {
  const token = localStorage.getItem("token");
  const res = await fetch(`${API_URL}/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) throw new Error("Không lấy được thông tin người dùng");
  return await res.json();
}

export async function createUser(data: Partial<UserProfileDetails>) {
  const token = localStorage.getItem("token");
  const res = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Không tạo được người dùng");
  return await res.json();
}

export async function updateUser(id: string, data: Partial<UserProfileDetails>) {
  const token = localStorage.getItem("token");
  const res = await fetch(`${API_URL}/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Không cập nhật được người dùng");
  return await res.json();
}

export async function softDeleteUser(id: string) {
  const token = localStorage.getItem("token");
  const res = await fetch(`${API_URL}/soft-delete/${id}`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) throw new Error("Không xoá được người dùng");
  return await res.text();
}
