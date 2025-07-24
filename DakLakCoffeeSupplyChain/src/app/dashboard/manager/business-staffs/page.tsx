"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  getAllBusinessStaffs,
  softDeleteBusinessStaff,
  BusinessStaffListDto,
} from "@/lib/api/businessStaffs";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";

export default function BusinessStaffListPage() {
  const [staffs, setStaffs] = useState<BusinessStaffListDto[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const router = useRouter();

  useEffect(() => {
    async function fetchStaffs() {
      try {
        const data = await getAllBusinessStaffs();
        setStaffs(data);
      } catch (err) {
        toast.error("Không thể tải danh sách nhân viên.");
      } finally {
        setLoading(false);
      }
    }

    fetchStaffs();
  }, []);

  const handleDelete = async (id: string) => {
    const confirm = window.confirm("Bạn có chắc muốn xoá nhân viên này?");
    if (!confirm) return;

    try {
      const res = await softDeleteBusinessStaff(id);
      if (res.status === 200) {
        toast.success("Xoá thành công.");
        setStaffs(prev => prev.filter(s => s.staffId !== id));
      } else {
        toast.error(res.message || "Xoá thất bại.");
      }
    } catch (err) {
      toast.error("Lỗi khi xoá nhân viên.");
    }
  };

  return (
    <Card className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold">Danh sách nhân viên</h1>
        <Button onClick={() => router.push("/dashboard/manager/business-staffs/create")}>
          + Tạo nhân viên
        </Button>
      </div>

      {loading ? (
        <p className="text-gray-500">Đang tải danh sách...</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full table-auto border">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2 text-left">Mã NV</th>
                <th className="px-4 py-2 text-left">Họ tên</th>
                <th className="px-4 py-2 text-left">Email</th>
                <th className="px-4 py-2 text-left">Phòng ban</th>
                <th className="px-4 py-2 text-left">Vị trí</th>
                <th className="px-4 py-2 text-center">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {staffs.map(staff => (
                <tr key={staff.staffId} className="border-t">
                  <td className="px-4 py-2">{staff.staffCode}</td>
                  <td className="px-4 py-2">{staff.fullName}</td>
                  <td className="px-4 py-2">{staff.email}</td>
                  <td className="px-4 py-2">{staff.department}</td>
                  <td className="px-4 py-2">{staff.position}</td>
                  <td className="px-4 py-2 text-center space-x-2">
                    <Button
                      size="sm"
                      onClick={() =>
                        router.push(`/dashboard/manager/business-staffs/${staff.staffId}`)
                      }
                    >
                      Xem
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        router.push(`/dashboard/manager/business-staffs/${staff.staffId}/edit`)
                      }
                    >
                      Sửa
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDelete(staff.staffId)}
                    >
                      Xoá
                    </Button>
                  </td>
                </tr>
              ))}
              {staffs.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-4">
                    Không có nhân viên nào.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}
