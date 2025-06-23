"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PackagePlus, Home } from "lucide-react";
import { createWarehouseInboundRequest } from "@/lib/api/warehouseInboundRequests";

export default function FarmerWarehouseRequestPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    requestedQuantity: "",
    preferredDeliveryDate: "",
    note: "",
    businessStaffId: "",
    batchId: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { requestedQuantity, preferredDeliveryDate, note, businessStaffId, batchId } = form;

      if (!businessStaffId || !batchId) {
        throw new Error("Bạn chưa nhập đủ thông tin: ID nhân viên hoặc ID lô xử lý");
      }

      const message = await createWarehouseInboundRequest({
        requestedQuantity: Number(requestedQuantity),
        preferredDeliveryDate,
        note,
        businessStaffId,
        batchId,
      });

      alert("✅ " + message);
      router.push("/dashboard/farmer");
    } catch (err: any) {
      alert("❌ Lỗi: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen px-4 bg-muted">
      <Card className="w-full max-w-2xl px-6 py-4 shadow-lg relative overflow-visible">
        <Link
          href="/dashboard/farmer"
          className="absolute -top-5 -right-5 bg-white border border-gray-300 shadow-lg rounded-full p-3 hover:bg-amber-100 transition z-20"
        >
          <Home className="w-6 h-6 text-amber-900" />
        </Link>

        <CardHeader>
          <CardTitle className="text-xl text-center flex items-center justify-center gap-2">
            <PackagePlus className="w-5 h-5" />
            Gửi yêu cầu nhập kho
          </CardTitle>
        </CardHeader>

        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <Label htmlFor="requestedQuantity">Số lượng (kg)</Label>
              <Input
                id="requestedQuantity"
                name="requestedQuantity"
                type="number"
                min={1}
                value={form.requestedQuantity}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <Label htmlFor="preferredDeliveryDate">Ngày giao dự kiến</Label>
              <Input
                id="preferredDeliveryDate"
                name="preferredDeliveryDate"
                type="date"
                value={form.preferredDeliveryDate}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <Label htmlFor="note">Ghi chú</Label>
              <Input
                id="note"
                name="note"
                value={form.note}
                onChange={handleChange}
              />
            </div>

            <div>
              <Label htmlFor="businessStaffId">ID nhân viên</Label>
              <Input
                id="businessStaffId"
                name="businessStaffId"
                value={form.businessStaffId}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <Label htmlFor="batchId">ID lô xử lý (Batch)</Label>
              <Input
                id="batchId"
                name="batchId"
                value={form.batchId}
                onChange={handleChange}
                required
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-amber-900 hover:bg-amber-800"
            >
              {loading ? "Đang gửi..." : "Gửi yêu cầu"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
