'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { PackagePlus } from 'lucide-react';
import { createWarehouseInboundRequest } from '@/lib/api/warehouseInboundRequest';

export default function FarmerWarehouseRequestPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    requestedQuantity: '',
    preferredDeliveryDate: '',
    note: '',
    batchId: '',
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
      const { requestedQuantity, preferredDeliveryDate, note, batchId } = form;

      if (!batchId) {
        throw new Error('Bạn chưa nhập ID lô xử lý');
      }

      const message = await createWarehouseInboundRequest({
        requestedQuantity: Number(requestedQuantity),
        preferredDeliveryDate,
        note,
        batchId,
      });

      alert('✅ ' + message);
      router.push('/dashboard/farmer');
    } catch (err: any) {
      alert('❌ Lỗi: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-orange-50  p-6 gap-6">
      {/* Sidebar hỗ trợ */}
      <aside className="w-64 space-y-4">
        <div className="bg-white rounded-xl shadow-sm p-4 space-y-4">
          <h2 className="text-sm font-medium text-gray-700">Hướng dẫn</h2>
          <p className="text-sm text-muted-foreground">
            Điền đầy đủ thông tin để gửi yêu cầu nhập kho. Lô xử lý (Batch) là bắt buộc.
          </p>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 space-y-6">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-bold text-center text-orange-700 flex items-center justify-center gap-2">
            <PackagePlus className="w-5 h-5" />
            Gửi yêu cầu nhập kho
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4 mt-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

              <div className="sm:col-span-2">
                <Label htmlFor="note">Ghi chú</Label>
                <Input
                  id="note"
                  name="note"
                  placeholder="Thông tin thêm (không bắt buộc)"
                  value={form.note}
                  onChange={handleChange}
                />
              </div>

              <div>
                <Label htmlFor="batchId">ID Lô xử lý (Batch)</Label>
                <Input
                  id="batchId"
                  name="batchId"
                  value={form.batchId}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-[#FD7622] hover:bg-[#d74f0f] text-white font-medium"
            >
              {loading ? 'Đang gửi...' : 'Gửi yêu cầu'}
            </Button>
          </form>
        </div>
      </main>
    </div>
  );
}
