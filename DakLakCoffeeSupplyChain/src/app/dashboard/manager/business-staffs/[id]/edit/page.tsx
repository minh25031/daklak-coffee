"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getBusinessStaffById, updateBusinessStaff } from "@/lib/api/businessStaffs";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function EditBusinessStaffPage() {
  const { id } = useParams();
  const router = useRouter();

  const [form, setForm] = useState({
    staffId: "",
    staffCode: "",
    fullName: "",
    email: "",
    phoneNumber: "",
    department: "",
    position: "",
    assignedWarehouseId: "",
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await getBusinessStaffById(id as string);

        if (res?.staffId) {
          setForm({
            staffId: res.staffId,
            staffCode: res.staffCode,
            fullName: res.fullName,
            email: res.email,
            phoneNumber: res.phoneNumber || "",
            department: res.department,
            position: res.position,
            assignedWarehouseId: res.assignedWarehouseId || "",
          });
        } else {
          toast.error("Không tìm thấy nhân viên.");
        }
      } catch (err) {
        toast.error("Lỗi khi tải dữ liệu.");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    try {
      const updateDto = {
        staffId: form.staffId,
        position: form.position,
        department: form.department,
        assignedWarehouseId: form.assignedWarehouseId || null,
        isActive: true, // Hoặc bạn có thể làm toggle nếu muốn cho phép bật/tắt
      };

      const res = await updateBusinessStaff(updateDto);

      if (res.status === 200) {
        toast.success("Cập nhật thành công.");
        router.push(`/dashboard/manager/business-staffs/${id}`);
      } else {
        toast.error(res.message || "Cập nhật thất bại.");
      }
    } catch (err) {
      toast.error("Lỗi khi cập nhật.");
    }
  };

  if (loading) return <p className="text-gray-500">Đang tải dữ liệu...</p>;

  return (
    <Card className="p-6 max-w-2xl mx-auto space-y-4">
      <h1 className="text-2xl font-bold mb-4">Chỉnh sửa nhân viên</h1>

      <div className="space-y-4">
        <div>
          <Label>Mã nhân viên</Label>
          <Input value={form.staffCode} disabled />
        </div>
        <div>
          <Label>Họ tên</Label>
          <Input value={form.fullName} disabled />
        </div>
        <div>
          <Label>Email</Label>
          <Input value={form.email} disabled />
        </div>
        <div>
          <Label>Số điện thoại</Label>
          <Input value={form.phoneNumber} disabled />
        </div>
        <div>
          <Label>Phòng ban</Label>
          <Input name="department" value={form.department} onChange={handleChange} />
        </div>
        <div>
          <Label>Vị trí</Label>
          <Input name="position" value={form.position} onChange={handleChange} />
        </div>
        <div>
          <Label>Kho phụ trách (nếu có)</Label>
          <Input
            name="assignedWarehouseId"
            value={form.assignedWarehouseId}
            onChange={handleChange}
          />
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <Button variant="outline" onClick={() => router.back()}>
          Quay lại
        </Button>
        <Button onClick={handleSubmit}>Lưu thay đổi</Button>
      </div>
    </Card>
  );
}
