// src/lib/mockapi/users.ts
export interface MockUser {
  user_id: string;
  email: string;
  password: string;
  role_id: number;
  role: string;
}

export const mockUsers: MockUser[] = [
  {
    user_id: "1",
    email: "farmer1@example.com",
    password: "123456",
    role_id: 1,
    role: "Farmer",
  },
  {
    user_id: "2",
    email: "manager1@example.com",
    password: "123456",
    role_id: 2,
    role: "BusinessManager",
  },
];
