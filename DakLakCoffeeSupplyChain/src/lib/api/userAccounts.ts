import api from "./axios";

export interface UserAccountDto {
  userId: string;
  userCode: string;
  name: string;
  email: string;
  phoneNumber: string;
  roleName: string;
  status: string;
  lastLogin: string | null;
  registrationDate: string;
}

export async function getAllUserAccounts(): Promise<UserAccountDto[]> {
  const { data } = await api.get<UserAccountDto[]>("/UserAccounts");
  return data;
}


