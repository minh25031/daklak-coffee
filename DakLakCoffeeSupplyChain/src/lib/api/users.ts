// lib/mockapi/users.ts
export interface UserProfile {
  user_id: string;
  Username: string;
  Email: string;
  Password?: string; // Optional for mock purposes
  PhoneNumber: string;
  Name: string;
  Gender: string;
  DateOfBirth: string;
  Address: string;
  ProfilePicture: string;
  IsVerified: boolean;
  LoginType: string;
  Status: string;
  RoleID: number;
}

export const mockUserData: UserProfile[] = [
  {
    user_id: "1",
    Username: "farmer1",
    Email: "farmer1@example.com",
    Password: "1", // Mock password for login
    PhoneNumber: "0901234567",
    Name: "Nguyen Van A",
    Gender: "Nam",
    DateOfBirth: "1990-01-01",
    Address: "Dak Lak",
    ProfilePicture: "https://i.pravatar.cc/150?img=12",
    IsVerified: true,
    LoginType: "local",
    Status: "active",
    RoleID: 1,
  },
  {
    user_id: "2",
    Username: "manager1",
    Email: "manager1@example.com",
    Password: "1",
    PhoneNumber: "0912345678",
    Name: "Tran Thi B",
    Gender: "Nữ",
    DateOfBirth: "1985-05-12",
    Address: "HCM City",
    ProfilePicture: "https://i.pravatar.cc/150?img=30",
    IsVerified: true,
    LoginType: "local",
    Status: "active",
    RoleID: 2,
  },
];
