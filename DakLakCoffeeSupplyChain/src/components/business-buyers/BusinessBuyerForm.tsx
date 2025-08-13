"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  BusinessBuyerCreateDto,
  BusinessBuyerUpdateDto,
  createBusinessBuyer,
  updateBusinessBuyer,
} from "@/lib/api/businessBuyers";

type Props = {
  initialData?: BusinessBuyerUpdateDto;
  onSuccess: () => void;
};

type FormState = {
  companyName: string;
  contactPerson?: string;
  position?: string;
  companyAddress?: string;
  taxId?: string;
  email: string;
  phoneNumber: string;
  website?: string | null;
};

export default function BusinessBuyerForm({ initialData, onSuccess }: Props) {
  const isEdit = !!initialData?.buyerId;

  const [formData, setFormData] = useState<FormState | null>(null);

  useEffect(() => {
    if (initialData) {
      setFormData({
        companyName: initialData.companyName,
        contactPerson: initialData.contactPerson,
        position: initialData.position,
        companyAddress: initialData.companyAddress,
        taxId: initialData.taxId,
        email: initialData.email,
        phoneNumber: initialData.phoneNumber,
        website: initialData.website ?? "",
      });
    } else {
      setFormData({
        companyName: "",
        contactPerson: "",
        position: "",
        companyAddress: "",
        taxId: "",
        email: "",
        phoneNumber: "",
        website: "",
      });
    }
  }, [initialData]);

  if (!formData) {
    return (
      <div className="text-gray-500 text-center py-10">
        Đang khởi tạo biểu mẫu...
      </div>
    );
  }

  const handleChange = (field: keyof FormState, value: any) =>
    setFormData((prev) => ({ ...(prev as FormState), [field]: value }));

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!formData) {
      toast.error("Biểu mẫu chưa sẵn sàng, vui lòng thử lại.");
      return;
    }
    const data: FormState = formData;

    if (!data.companyName?.trim())
      return toast.error("Vui lòng nhập tên công ty.");
    if (!data.email?.trim()) return toast.error("Vui lòng nhập email.");
    if (!data.phoneNumber?.trim())
      return toast.error("Vui lòng nhập số điện thoại.");

    try {
      const normalizedWebsite =
        data.website && String(data.website).trim() !== ""
          ? String(data.website).trim()
          : null;
      if (isEdit && initialData) {
        const payload: BusinessBuyerUpdateDto = {
          buyerId: initialData.buyerId,
          ...data,
          website: normalizedWebsite,
        };
        await updateBusinessBuyer(payload);
        toast.success("Cập nhật khách hàng thành công!");
        // Điều hướng về trang chi tiết buyer
        onSuccess();
      } else {
        const payload: BusinessBuyerCreateDto = {
          ...data,
          website: normalizedWebsite,
        };
        const newId = await createBusinessBuyer(payload);
        toast.success("Tạo khách hàng thành công!");
        // Nếu backend trả về id, điều hướng sang trang chi tiết
        if (newId) {
          window.location.href = `/dashboard/manager/business-buyers/${newId}`;
          return;
        }
        onSuccess();
      }
    } catch (err: any) {
      console.error("[BusinessBuyerForm] Error:", err);
      const message =
        typeof err === "string" ? err : err?.message || "Có lỗi xảy ra";
      toast.error(message);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-4xl mx-auto bg-white border rounded-2xl shadow p-8 space-y-6"
    >
      <h2 className="text-2xl font-semibold text-center mb-4">
        {isEdit ? "Chỉnh sửa khách hàng DN" : "Tạo khách hàng DN"}
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium">Tên công ty</label>
          <Input
            value={formData.companyName}
            onChange={(e) => handleChange("companyName", e.target.value)}
            className="h-10"
          />
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium">Người liên hệ</label>
          <Input
            value={formData.contactPerson}
            onChange={(e) => handleChange("contactPerson", e.target.value)}
            className="h-10"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium">Chức vụ</label>
          <Input
            value={formData.position}
            onChange={(e) => handleChange("position", e.target.value)}
            className="h-10"
          />
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium">Mã số thuế</label>
          <Input
            value={formData.taxId}
            onChange={(e) => handleChange("taxId", e.target.value)}
            className="h-10"
          />
        </div>

        <div className="md:col-span-2 flex flex-col gap-2">
          <label className="text-sm font-medium">Địa chỉ</label>
          <Input
            value={formData.companyAddress}
            onChange={(e) => handleChange("companyAddress", e.target.value)}
            className="h-10"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium">Email</label>
          <Input
            type="email"
            value={formData.email}
            onChange={(e) => handleChange("email", e.target.value)}
            className="h-10"
          />
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium">Số điện thoại</label>
          <Input
            value={formData.phoneNumber}
            onChange={(e) => handleChange("phoneNumber", e.target.value)}
            className="h-10"
          />
        </div>

        <div className="md:col-span-2 flex flex-col gap-2">
          <label className="text-sm font-medium">Website</label>
          <Input
            value={formData.website ?? ""}
            onChange={(e) => handleChange("website", e.target.value)}
            className="h-10"
            placeholder="https://example.com"
          />
        </div>
      </div>

      <DialogFooter className="flex justify-between pt-4">
        <Button type="submit">
          <h2>{isEdit ? "Lưu thay đổi" : "Tạo khách hàng"}</h2>
        </Button>
        <Button type="button" variant="outline" onClick={() => history.back()}>
          Quay lại
        </Button>
      </DialogFooter>
    </form>
  );
}
