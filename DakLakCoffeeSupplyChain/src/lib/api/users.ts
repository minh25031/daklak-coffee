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
  Active = "Active",
  Inactive = "Inactive",
  Suspended = "Suspended",
  Unknown = "Unknown"
}

export enum Gender {
  Male = "Male",
  Female = "Female",
  Unknown = "Unknown"
}

export const mockUserData: UserProfile[] = [
  {
    userId: "550e8400-e29b-41d4-a716-446655440001",
    userCode: "USR001",
    name: "Nguyen Van A",
    email: "farmer1@example.com",
    phoneNumber: "0901234567",
    roleName: "Nông dân",
    status: UserAccountStatus.Active,
    lastLogin: new Date("2024-01-15T10:30:00"),
    registrationDate: new Date("2024-01-01T09:00:00"),
  },
  {
    userId: "550e8400-e29b-41d4-a716-446655440002",
    userCode: "USR002",
    name: "Tran Thi B",
    email: "manager1@example.com",
    phoneNumber: "0912345678",
    roleName: "Quản lý doanh nghiệp",
    status: UserAccountStatus.Active,
    lastLogin: new Date("2024-01-16T14:20:00"),
    registrationDate: new Date("2024-01-02T08:30:00"),
  },
  {
    userId: "550e8400-e29b-41d4-a716-446655440003",
    userCode: "USR003",
    name: "Le Van C",
    email: "staff1@example.com",
    phoneNumber: "0923456789",
    roleName: "Nhân viên doanh nghiệp",
    status: UserAccountStatus.Active,
    lastLogin: new Date("2024-01-14T16:45:00"),
    registrationDate: new Date("2024-01-03T10:15:00"),
  },
  {
    userId: "550e8400-e29b-41d4-a716-446655440004",
    userCode: "USR004",
    name: "Pham Thi D",
    email: "expert1@example.com",
    phoneNumber: "0934567890",
    roleName: "Chuyên gia nông nghiệp",
    status: UserAccountStatus.Active,
    lastLogin: new Date("2024-01-16T11:10:00"),
    registrationDate: new Date("2024-01-04T13:20:00"),
  },
  {
    userId: "550e8400-e29b-41d4-a716-446655440005",
    userCode: "USR005",
    name: "Hoang Van E",
    email: "delivery1@example.com",
    phoneNumber: "0945678901",
    roleName: "Nhân viên giao hàng",
    status: UserAccountStatus.Inactive,
    lastLogin: new Date("2024-01-10T09:30:00"),
    registrationDate: new Date("2024-01-05T15:45:00"),
  },
];

// Mock data for user details (for detail view)
export const mockUserDetailsData: Record<string, UserProfileDetails> = {
  "550e8400-e29b-41d4-a716-446655440001": {
    userId: "550e8400-e29b-41d4-a716-446655440001",
    userCode: "USR001",
    email: "farmer1@example.com",
    phoneNumber: "0901234567",
    name: "Nguyen Van A",
    gender: Gender.Male,
    dateOfBirth: new Date("1990-01-01"),
    address: "Dak Lak, Vietnam",
    profilePictureUrl: "https://i.pravatar.cc/150?img=12",
    emailVerified: true,
    isVerified: true,
    loginType: "local",
    status: UserAccountStatus.Active,
    roleName: "Nông dân",
    registrationDate: new Date("2024-01-01T09:00:00"),
    lastLogin: new Date("2024-01-15T10:30:00"),
    updatedAt: new Date("2024-01-15T10:30:00"),
  },
  "550e8400-e29b-41d4-a716-446655440002": {
    userId: "550e8400-e29b-41d4-a716-446655440002",
    userCode: "USR002",
    email: "manager1@example.com",
    phoneNumber: "0912345678",
    name: "Tran Thi B",
    gender: Gender.Female,
    dateOfBirth: new Date("1985-05-12"),
    address: "Ho Chi Minh City, Vietnam",
    profilePictureUrl: "https://i.pravatar.cc/150?img=30",
    emailVerified: true,
    isVerified: true,
    loginType: "local",
    status: UserAccountStatus.Active,
    roleName: "Quản lý doanh nghiệp",
    registrationDate: new Date("2024-01-02T08:30:00"),
    lastLogin: new Date("2024-01-16T14:20:00"),
    updatedAt: new Date("2024-01-16T14:20:00"),
  },
  "550e8400-e29b-41d4-a716-446655440003": {
    userId: "550e8400-e29b-41d4-a716-446655440003",
    userCode: "USR003",
    email: "staff1@example.com",
    phoneNumber: "0923456789",
    name: "Le Van C",
    gender: Gender.Male,
    dateOfBirth: new Date("1992-08-20"),
    address: "Hanoi, Vietnam",
    profilePictureUrl: "https://i.pravatar.cc/150?img=45",
    emailVerified: true,
    isVerified: true,
    loginType: "local",
    status: UserAccountStatus.Active,
    roleName: "Nhân viên doanh nghiệp",
    registrationDate: new Date("2024-01-03T10:15:00"),
    lastLogin: new Date("2024-01-14T16:45:00"),
    updatedAt: new Date("2024-01-14T16:45:00"),
  },
  "550e8400-e29b-41d4-a716-446655440004": {
    userId: "550e8400-e29b-41d4-a716-446655440004",
    userCode: "USR004",
    email: "expert1@example.com",
    phoneNumber: "0934567890",
    name: "Pham Thi D",
    gender: Gender.Female,
    dateOfBirth: new Date("1988-12-03"),
    address: "Can Tho, Vietnam",
    profilePictureUrl: "https://i.pravatar.cc/150?img=28",
    emailVerified: true,
    isVerified: true,
    loginType: "local",
    status: UserAccountStatus.Active,
    roleName: "Chuyên gia nông nghiệp",
    registrationDate: new Date("2024-01-04T13:20:00"),
    lastLogin: new Date("2024-01-16T11:10:00"),
    updatedAt: new Date("2024-01-16T11:10:00"),
  },
  "550e8400-e29b-41d4-a716-446655440005": {
    userId: "550e8400-e29b-41d4-a716-446655440005",
    userCode: "USR005",
    email: "delivery1@example.com",
    phoneNumber: "0945678901",
    name: "Hoang Van E",
    gender: Gender.Male,
    dateOfBirth: new Date("1995-03-15"),
    address: "Da Nang, Vietnam",
    profilePictureUrl: "https://i.pravatar.cc/150?img=52",
    emailVerified: false,
    isVerified: false,
    loginType: "local",
    status: UserAccountStatus.Inactive,
    roleName: "Nhân viên giao hàng",
    registrationDate: new Date("2024-01-05T15:45:00"),
    lastLogin: new Date("2024-01-10T09:30:00"),
    updatedAt: new Date("2024-01-10T09:30:00"),
  },
};
