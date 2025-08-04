"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getBusinessStaffById } from "@/lib/api/businessStaffs";
import { getWarehouseById } from "@/lib/api/warehouses";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

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
  const [warehouseName, setWarehouseName] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDetail() {
      try {
        const data = await getBusinessStaffById(id as string);
        if (data) {
          setStaff(data);

          if (data.assignedWarehouseId) {
            const warehouseRes = await getWarehouseById(data.assignedWarehouseId);
            if (warehouseRes.status === 1 && warehouseRes.data?.name) {
              setWarehouseName(warehouseRes.data.name);
            } else {
              setWarehouseName("Không xác định");
            }
          } else {
            setWarehouseName("Chưa gán");
          }
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

  if (loading) return <p className="text-gray-500 px-6">Đang tải thông tin nhân viên...</p>;
  if (!staff) return <p className="text-red-500 px-6">Không có dữ liệu.</p>;

  return (
    <Card className="p-8 max-w-3xl mx-auto space-y-6 shadow-md">
      <h1 className="text-3xl font-semibold text-orange-600 border-b pb-4">
        🧾 Thông tin nhân viên
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-10 gap-y-5 text-[15px]">
        <div>
          <span className="font-medium text-gray-600">Mã nhân viên:</span>
          <div className="text-gray-800">{staff.staffCode}</div>
        </div>
        <div>
          <span className="font-medium text-gray-600">Họ tên:</span>
          <div className="text-gray-800">{staff.fullName}</div>
        </div>
        <div>
          <span className="font-medium text-gray-600">Email:</span>
          <div className="text-gray-800">{staff.email}</div>
        </div>
        <div>
          <span className="font-medium text-gray-600">Số điện thoại:</span>
          <div>
            {staff.phoneNumber ? (
              <span className="text-gray-800">{staff.phoneNumber}</span>
            ) : (
              <Badge variant="outline" className="text-gray-500">Không có</Badge>
            )}
          </div>
        </div>
        <div>
          <span className="font-medium text-gray-600">Phòng ban:</span>
          <div className="text-gray-800">{staff.department}</div>
        </div>
        <div>
          <span className="font-medium text-gray-600">Vị trí:</span>
          <div className="text-gray-800">{staff.position}</div>
        </div>
        <div>
          <span className="font-medium text-gray-600">Kho phụ trách:</span>
          <div>
            {warehouseName === "Chưa gán" ? (
              <Badge variant="secondary" className="text-gray-600">{warehouseName}</Badge>
            ) : (
              <span className="text-gray-800">{warehouseName}</span>
            )}
          </div>
        </div>
        <div>
          <span className="font-medium text-gray-600">Ngày tạo:</span>
          <div className="text-gray-800">
            {new Date(staff.createdAt).toLocaleString("vi-VN")}
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-6">
        <Button variant="outline" onClick={() => router.back()}>
          Quay lại
        </Button>
        <Button
          className="bg-orange-600 hover:bg-orange-700 text-white"
          onClick={() =>
            router.push(`/dashboard/manager/business-staffs/${staff.staffId}/edit`)
          }
        >
          ✏️ Chỉnh sửa
        </Button>
      </div>
    </Card>
  );
}
