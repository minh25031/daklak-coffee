"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { mockUserData, UserProfile, UserAccountStatus } from "@/lib/api/users";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function UserManagement() {
  const [users, setUsers] = useState<UserProfile[]>(mockUserData);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  
  const usersPerPage = 10;
  const [roleFilter, setRoleFilter] = useState<string>("");
  const router = useRouter();
  const [deleteUserId, setDeleteUserId] = useState<string | null>(null);

  // Get unique role names for filter
  const roleOptions = Array.from(new Set(users.map(user => user.roleName)));

  // Filter users by search (search by Email, Name, UserCode, PhoneNumber) and role
  const filteredUsers = users.filter(
    (user) =>
      (user.email.toLowerCase().includes(search.toLowerCase()) ||
        user.name.toLowerCase().includes(search.toLowerCase()) ||
        user.userCode.toLowerCase().includes(search.toLowerCase()) ||
        user.phoneNumber.toLowerCase().includes(search.toLowerCase())) &&
      (roleFilter === "" || user.roleName === roleFilter)
  );

  // Pagination
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);
  const paginatedUsers = filteredUsers.slice(
    (page - 1) * usersPerPage,
    page * usersPerPage
  );

  // Format date for display
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  // Get status display info
  const getStatusInfo = (status: UserAccountStatus) => {
    switch (status) {
      case UserAccountStatus.Active:
        return { text: "Hoạt động", className: "bg-green-100 text-green-700" };
      case UserAccountStatus.Inactive:
        return { text: "Không hoạt động", className: "bg-gray-200 text-gray-600" };
      case UserAccountStatus.Suspended:
        return { text: "Tạm khóa", className: "bg-red-100 text-red-700" };
      default:
        return { text: "Không xác định", className: "bg-yellow-100 text-yellow-700" };
    }
  };

  return (
    <div className="w-full min-h-screen bg-orange-50 p-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-4">
          <CardTitle>Quản lý người dùng</CardTitle>
          <Button
            onClick={() => router.push("/dashboard/admin/users/create")}
            className="bg-orange-500 text-white"
          >
            Thêm người dùng
          </Button>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-4">
            <input
              type="text"
              placeholder="Tìm kiếm theo mã, tên hoặc email..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="border rounded px-3 py-2 w-64"
            />
            <select
              className="border rounded px-3 py-2"
              value={roleFilter}
              onChange={(e) => {
                setRoleFilter(e.target.value);
                setPage(1);
              }}
            >
              <option value="">Tất cả vai trò</option>
              {roleOptions.map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </select>
          </div>
          <div className="overflow-x-auto p-2">
            <Table className="min-w-[1000px]">
              <TableHeader>
                <TableRow>
                  <TableHead>Mã người dùng</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Họ tên</TableHead>
                  <TableHead>Số điện thoại</TableHead>
                  <TableHead>Vai trò</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead>Ngày đăng ký</TableHead>
                  <TableHead style={{ minWidth: 120 }}>Hành động</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedUsers.map((user) => {
                  const statusInfo = getStatusInfo(user.status);
                  return (
                    <TableRow key={user.userId}>
                      <TableCell className="font-medium">{user.userCode}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{user.name}</TableCell>
                      <TableCell>{user.phoneNumber}</TableCell>
                      <TableCell>{user.roleName}</TableCell>
                      <TableCell>
                        <span
                          className={`px-2 py-1 rounded text-xs font-semibold ${statusInfo.className}`}
                        >
                          {statusInfo.text}
                        </span>
                      </TableCell>
                      <TableCell>{formatDate(user.registrationDate)}</TableCell>
                      <TableCell style={{ minWidth: 120 }}>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              router.push(
                                `/dashboard/admin/users/${user.userId}`
                              )
                            }
                          >
                            Chi tiết
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              router.push(
                                `/dashboard/admin/users/${user.userId}/edit`
                              )
                            }
                          >
                            Sửa
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => setDeleteUserId(user.userId)}
                          >
                            Xoá
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
                {paginatedUsers.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center">
                      Không có người dùng nào.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          {/* Pagination */}
          <div className="flex justify-end items-center gap-2 mt-4">
            <Button
              size="sm"
              variant="outline"
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
            >
              Trước
            </Button>
            <span>
              Trang {page} / {totalPages}
            </span>
            <Button
              size="sm"
              variant="outline"
              disabled={page === totalPages || totalPages === 0}
              onClick={() => setPage(page + 1)}
            >
              Sau
            </Button>
          </div>
        </CardContent>
      </Card>
      {/* Popup xác nhận xoá */}
      {deleteUserId && (
        <div className="fixed inset-0 z-50 bg-black/30 flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-sm mx-4 animate-fade-in">
            <h2 className="text-lg font-semibold mb-4 text-gray-800">
              Xác nhận xoá người dùng
            </h2>
            <p className="text-sm text-gray-600 mb-6">
              Bạn có chắc chắn muốn xoá người dùng này? Hành động này không thể
              hoàn tác.
            </p>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setDeleteUserId(null)}>
                Huỷ
              </Button>
              <Button
                variant="destructive"
                onClick={() => {
                  setUsers(users.filter((u) => u.userId !== deleteUserId));
                  setDeleteUserId(null);
                }}
              >
                Xoá
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
