"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createBusinessStaff } from "@/lib/api/businessStaffs";
import { getAllWarehouses } from "@/lib/api/warehouses";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function CreateBusinessStaffPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phoneNumber: "",
    password: "",
    position: "",
    department: "",
    assignedWarehouseId: null as string | null,
  });

  const [warehouses, setWarehouses] = useState<
    { warehouseId: string; name: string }[]
  >([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchWarehouses = async () => {
      const res = await getAllWarehouses();
      if (res.status === 1 && Array.isArray(res.data)) {
        setWarehouses(res.data);
      } else {
        toast.error("Không thể tải danh sách kho.");
      }
    };
    fetchWarehouses();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await createBusinessStaff({
        ...form,
        assignedWarehouseId: form.assignedWarehouseId || null,
      });

      if (res.status === 201 || res.status === 200) {
        toast.success("Tạo nhân viên thành công!");
        router.push("/dashboard/manager/business-staffs");
      } else {
        toast.error(res.message || "Tạo nhân viên thất bại.");
      }
    } catch (err) {
      toast.error("Có lỗi xảy ra khi tạo nhân viên.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Tạo nhân viên mới</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label>Họ tên *</Label>
          <Input name="fullName" value={form.fullName} onChange={handleChange} required />
        </div>
        <div>
          <Label>Email *</Label>
          <Input name="email" type="email" value={form.email} onChange={handleChange} required />
        </div>
        <div>
          <Label>Số điện thoại</Label>
          <Input name="phoneNumber" value={form.phoneNumber} onChange={handleChange} />
        </div>
        <div>
          <Label>Mật khẩu *</Label>
          <Input
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            required
            minLength={6}
          />
        </div>
        <div>
          <Label>Vị trí *</Label>
          <Input name="position" value={form.position} onChange={handleChange} required />
        </div>
        <div>
          <Label>Phòng ban</Label>
          <Input name="department" value={form.department} onChange={handleChange} />
        </div>
        <div>
          <Label>Kho phụ trách</Label>
          <select
            name="assignedWarehouseId"
            value={form.assignedWarehouseId ?? ""}
            onChange={(e) =>
              setForm((prev) => ({
                ...prev,
                assignedWarehouseId: e.target.value || null,
              }))
            }
            className="w-full border rounded px-3 py-2"
          >
            <option value="">-- Không chọn --</option>
            {warehouses.map((w) => (
              <option key={w.warehouseId} value={w.warehouseId}>
                {w.name}
              </option>
            ))}
          </select>
        </div>

        <div className="pt-4 flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Huỷ
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? "Đang tạo..." : "Tạo nhân viên"}
          </Button>
        </div>
      </form>
    </Card>
  );
}
