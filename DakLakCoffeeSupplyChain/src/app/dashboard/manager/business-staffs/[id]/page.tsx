"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getBusinessStaffById, BusinessStaffListDto } from "@/lib/api/businessStaffs";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

// Dùng đúng DTO backend cung cấp
interface BusinessStaffDetailDto {
  staffId: string;
  staffCode: string;
  fullName: string;
  email: string;
  phoneNumber?: string;
  department: string;
  position: string;
  assignedWarehouseId?: string;
  createdAt: string;
}

export default function BusinessStaffDetailPage() {
  const router = useRouter();
  const { id } = useParams();
  const [staff, setStaff] = useState<BusinessStaffDetailDto | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
  async function fetchDetail() {
    try {
      const data = await getBusinessStaffById(id as string);
      if (data) {
        setStaff(data); // ✅ Không cần .data
      } else {
        toast.error("Không tìm thấy nhân viên.");
      }
    } catch (err) {
      toast.error("Lỗi khi tải dữ liệu nhân viên.");
    } finally {
      setLoading(false);
    }
  }

  if (id) fetchDetail();
}, [id]);


  if (loading) return <p className="text-gray-500">Đang tải thông tin nhân viên...</p>;

  if (!staff) return <p className="text-red-500">Không có dữ liệu.</p>;

  return (
    <Card className="p-6 max-w-2xl mx-auto space-y-4">
      <h1 className="text-2xl font-bold mb-4">Thông tin nhân viên</h1>
      <div><strong>Mã nhân viên:</strong> {staff.staffCode}</div>
      <div><strong>Họ tên:</strong> {staff.fullName}</div>
      <div><strong>Email:</strong> {staff.email}</div>
      <div><strong>Số điện thoại:</strong> {staff.phoneNumber || "Không có"}</div>
      <div><strong>Phòng ban:</strong> {staff.department}</div>
      <div><strong>Vị trí:</strong> {staff.position}</div>
      <div><strong>Kho phụ trách:</strong> {staff.assignedWarehouseId || "Chưa gán"}</div>
      <div><strong>Ngày tạo:</strong> {new Date(staff.createdAt).toLocaleString("vi-VN")}</div>

      <div className="flex gap-2 pt-4 justify-end">
        <Button variant="outline" onClick={() => router.back()}>
          Quay lại
        </Button>
        <Button onClick={() => router.push(`/dashboard/manager/business-staffs/${staff.staffId}/edit`)}>
          Chỉnh sửa
        </Button>
      </div>
    </Card>
  );
}
