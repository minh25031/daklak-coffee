"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  getAllBusinessStaffs,
  softDeleteBusinessStaff,
  BusinessStaffListDto,
} from "@/lib/api/businessStaffs";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import {
  Eye,
  Pencil,
  Trash2,
  Plus,
} from "lucide-react";

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
        setStaffs((prev) => prev.filter((s) => s.staffId !== id));
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
        <button
          onClick={() => router.push("/dashboard/manager/business-staffs/create")}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Thêm nhân viên
        </button>
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
              {staffs.map((staff) => (
                <tr key={staff.staffId} className="border-t">
                  <td className="px-4 py-2">{staff.staffCode}</td>
                  <td className="px-4 py-2">{staff.fullName}</td>
                  <td className="px-4 py-2">{staff.email}</td>
                  <td className="px-4 py-2">{staff.department}</td>
                  <td className="px-4 py-2">{staff.position}</td>
                  <td className="px-4 py-2 text-center">
                    <div className="flex justify-center items-center gap-3">
                      <span
                        title="Xem"
                        onClick={() =>
                          router.push(`/dashboard/manager/business-staffs/${staff.staffId}`)
                        }
                        className="cursor-pointer text-gray-600 hover:text-black"
                      >
                        <Eye className="w-5 h-5" />
                      </span>
                      <span
                        title="Sửa"
                        onClick={() =>
                          router.push(`/dashboard/manager/business-staffs/${staff.staffId}/edit`)
                        }
                        className="cursor-pointer text-blue-600 hover:text-blue-800"
                      >
                        <Pencil className="w-5 h-5" />
                      </span>
                      <span
                        title="Xoá"
                        onClick={() => handleDelete(staff.staffId)}
                        className="cursor-pointer text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="w-5 h-5" />
                      </span>
                    </div>
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
