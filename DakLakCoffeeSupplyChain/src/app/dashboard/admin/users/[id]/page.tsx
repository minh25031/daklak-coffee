"use client";
import { useParams, useRouter } from "next/navigation";
import { mockUserData, UserProfile } from "@/lib/api/users";
import { roleIdToNameMap } from "@/lib/constrant/role";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function UserDetail() {
  const params = useParams();
  const router = useRouter();
  const userId = params.id as string;
  const user = mockUserData.find(u => u.user_id === userId);

  if (!user) {
    return (
      <div className="p-8">
        <Card>
          <CardHeader>
            <CardTitle>Không tìm thấy người dùng</CardTitle>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.back()}>Quay lại</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-orange-50 p-6 flex justify-center items-start">
      <Card className="w-full max-w-xl">
        <CardHeader>
          <CardTitle>Chi tiết người dùng</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col items-center gap-2">
              <img src={user.ProfilePicture} alt={user.Name} className="w-24 h-24 rounded-full object-cover border" />
              <span className="font-semibold text-lg">{user.Name}</span>
              <span className="text-sm text-gray-500">{roleIdToNameMap[user.RoleID] || user.RoleID}</span>
            </div>
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div><b>Mã người dùng:</b> {user.Username}</div>
              <div><b>Email:</b> {user.Email}</div>
              <div><b>SĐT:</b> {user.PhoneNumber}</div>
              <div><b>Giới tính:</b> {user.Gender}</div>
              <div><b>Ngày sinh:</b> {user.DateOfBirth}</div>
              <div><b>Địa chỉ:</b> {user.Address}</div>
              <div><b>Trạng thái:</b> <span className={`px-2 py-1 rounded text-xs font-semibold ${user.Status === "active" ? "bg-green-100 text-green-700" : "bg-gray-200 text-gray-600"}`}>{user.Status}</span></div>
              <div><b>Đã xác thực:</b> {user.IsVerified ? "Có" : "Không"}</div>
              <div><b>Loại đăng nhập:</b> {user.LoginType}</div>
            </div>
            <div className="flex justify-end mt-6">
              <Button onClick={() => router.back()}>Quay lại</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 