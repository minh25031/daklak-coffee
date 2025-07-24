"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { getAllProcessingBatches, ProcessingBatch } from "@/lib/api/processingBatches";
import StatusBadge from "@/components/processing-batches/StatusBadge";
import FilterStatusPanel from "@/components/processing-batches/FilterStatusPanel";
import { Input } from "@/components/ui/input";
import { getCoffeeTypes, CoffeeType } from "@/lib/api/coffeeType";
import { getAllCropSeasons, CropSeasonListItem } from "@/lib/api/cropSeasons";
import { getAllProcessingMethods, ProcessingMethod } from "@/lib/api/processingMethods";

export default function ManagerProcessingBatchesPage() {
  const router = useRouter();
  const [batches, setBatches] = useState<ProcessingBatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editBatch, setEditBatch] = useState<ProcessingBatch | null>(null);
  const [form, setForm] = useState({
    batchCode: "",
    coffeeTypeId: "",
    cropSeasonId: "",
    methodId: "",
    inputQuantity: 0,
    inputUnit: "",
  });
  const [selectedStatus, setSelectedStatus] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [coffeeTypes, setCoffeeTypes] = useState<CoffeeType[]>([]);
  const [cropSeasons, setCropSeasons] = useState<CropSeasonListItem[]>([]);
  const [methods, setMethods] = useState<ProcessingMethod[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const [batchData, coffeeTypeData, cropSeasonData, methodData] = await Promise.all([
        getAllProcessingBatches(),
        getCoffeeTypes(),
        getAllCropSeasons(),
        getAllProcessingMethods(),
      ]);
      setBatches(batchData || []);
      setCoffeeTypes(coffeeTypeData || []);
      setCropSeasons(cropSeasonData || []);
      setMethods(methodData || []);
      setLoading(false);
    };
    fetchData();
  }, []);

  // Lọc theo trạng thái và tìm kiếm
  const filtered = batches.filter(
    (b) =>
      (selectedStatus === null || b.status === selectedStatus) &&
      (!search || b.batchCode.toLowerCase().includes(search.toLowerCase()))
  );

  // Đếm số lượng theo trạng thái
  const statusCounts = batches.reduce<Record<number, number>>((acc, batch) => {
    acc[batch.status] = (acc[batch.status] || 0) + 1;
    return acc;
  }, {});

  const handleOpenCreate = () => {
    setEditBatch(null);
    setForm({
      batchCode: "",
      coffeeTypeId: coffeeTypes[0]?.coffeeTypeId || "",
      cropSeasonId: cropSeasons[0]?.cropSeasonId || "",
      methodId: methods[0]?.methodId?.toString() || "",
      inputQuantity: 0,
      inputUnit: "kg",
    });
    setOpenDialog(true);
  };

  const handleOpenEdit = (batch: ProcessingBatch) => {
    setEditBatch(batch);
    // Tìm cropSeason để lấy coffeeTypeId
    const cropSeason = cropSeasons.find(cs => cs.cropSeasonId === batch.cropSeasonId);
    setForm({
      batchCode: batch.batchCode,
      coffeeTypeId: cropSeason ? (cropSeason as any).coffeeTypeId || "" : "",
      cropSeasonId: batch.cropSeasonId,
      methodId: batch.methodId.toString(),
      inputQuantity: batch.inputQuantity,
      inputUnit: batch.inputUnit,
    });
    setOpenDialog(true);
  };

  const handleDelete = (id: string) => {
    // TODO: Gọi API xóa, sau đó cập nhật lại danh sách
    setBatches(batches.filter((b) => b.batchId !== id));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: name === "inputQuantity" ? Number(value) : value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Gọi API tạo/sửa batch, sau đó cập nhật lại danh sách
    setOpenDialog(false);
  };

  const handleViewDetail = (id: string) => {
    router.push(`/dashboard/manager/processing/batches/${id}`);
  };

  return (
    <main className="p-6 flex gap-6 min-h-screen bg-amber-50">
      {/* Sidebar filter */}
      <aside className="w-64 space-y-4">
        <div className="bg-white rounded-xl shadow-sm p-4 space-y-4">
          <h2 className="text-sm font-medium text-gray-700">Tìm kiếm lô chế biến</h2>
          <div className="relative">
            <Input
              placeholder="Tìm kiếm mã lô..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pr-10"
            />
          </div>
        </div>
        <FilterStatusPanel
          selectedStatus={selectedStatus}
          setSelectedStatus={setSelectedStatus}
          statusCounts={statusCounts}
        />
      </aside>
      {/* Main content */}
      <div className="flex-1 bg-white rounded-xl shadow-sm p-4">
        <div className="flex justify-between items-center mb-4">
          <span className="text-lg font-semibold">Danh sách lô chế biến</span>
          <Button onClick={handleOpenCreate}>+ Tạo mới</Button>
        </div>
        <div className="overflow-x-auto rounded-lg border bg-white shadow">
          {loading ? (
            <div className="text-center py-8 text-sm text-muted-foreground">Đang tải dữ liệu...</div>
          ) : (
            <table className="min-w-full text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-2 text-left">Mã lô</th>
                  <th className="px-4 py-2 text-left">Mùa vụ</th>
                  <th className="px-4 py-2 text-left">Phương pháp</th>
                  <th className="px-4 py-2 text-left">Trạng thái</th>
                  <th className="px-4 py-2 text-left">Ngày tạo</th>
                  <th className="px-4 py-2 text-center">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-4 text-gray-400">Chưa có lô nào</td>
                  </tr>
                ) : (
                  filtered.map((batch) => (
                    <tr key={batch.batchId} className="border-t hover:bg-gray-50">
                      <td className="px-4 py-2">{batch.batchCode}</td>
                      <td className="px-4 py-2">{batch.cropSeasonName}</td>
                      <td className="px-4 py-2">{batch.methodName}</td>
                      <td className="px-4 py-2"><StatusBadge status={batch.status} /></td>
                      <td className="px-4 py-2">{new Date(batch.createdAt).toLocaleDateString("vi-VN")}</td>
                      <td className="px-4 py-2 text-center space-x-2">
                        <Button size="sm" variant="outline" onClick={() => handleOpenEdit(batch)}>
                          Sửa
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => handleDelete(batch.batchId)}>
                          Xóa
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => handleViewDetail(batch.batchId)}>
                          Xem chi tiết
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
        {/* Dialog tạo/sửa */}
        <Dialog open={openDialog} onOpenChange={setOpenDialog}>
          <DialogContent>
            <DialogTitle>{editBatch ? "Sửa lô chế biến" : "Tạo lô chế biến mới"}</DialogTitle>
            <form onSubmit={handleSubmit} className="space-y-4 mt-2">
              <div>
                <label className="block mb-1 font-medium">Mã lô</label>
                <input
                  className="w-full border rounded px-3 py-2"
                  name="batchCode"
                  value={form.batchCode}
                  onChange={handleChange}
                  required
                  placeholder="Nhập mã lô"
                />
              </div>
              <div>
                <label className="block mb-1 font-medium">Loại cà phê</label>
                <select
                  className="w-full border rounded px-3 py-2"
                  name="coffeeTypeId"
                  value={form.coffeeTypeId}
                  onChange={handleChange}
                  required
                >
                  {coffeeTypes.map((type) => (
                    <option key={type.coffeeTypeId} value={type.coffeeTypeId}>{type.typeName}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block mb-1 font-medium">Mùa vụ</label>
                <select
                  className="w-full border rounded px-3 py-2"
                  name="cropSeasonId"
                  value={form.cropSeasonId}
                  onChange={handleChange}
                  required
                >
                  {cropSeasons.map((season) => (
                    <option key={season.cropSeasonId} value={season.cropSeasonId}>{season.seasonName}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block mb-1 font-medium">Phương pháp chế biến</label>
                <select
                  className="w-full border rounded px-3 py-2"
                  name="methodId"
                  value={form.methodId}
                  onChange={handleChange}
                  required
                >
                  {methods.map((m) => (
                    <option key={m.methodId} value={m.methodId}>{m.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block mb-1 font-medium">Khối lượng đầu vào</label>
                <input
                  className="w-full border rounded px-3 py-2"
                  name="inputQuantity"
                  type="number"
                  value={form.inputQuantity}
                  onChange={handleChange}
                  required
                  min={0}
                  placeholder="Nhập khối lượng đầu vào"
                />
              </div>
              <div>
                <label className="block mb-1 font-medium">Đơn vị</label>
                <input
                  className="w-full border rounded px-3 py-2"
                  name="inputUnit"
                  value={form.inputUnit}
                  onChange={handleChange}
                  required
                  placeholder="Nhập đơn vị (ví dụ: kg)"
                />
              </div>
              {editBatch && (
                <div>
                  <label className="block mb-1 font-medium">Trạng thái (tự động)</label>
                  <StatusBadge status={editBatch.status} />
                </div>
              )}
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setOpenDialog(false)}>
                  Huỷ
                </Button>
                <Button type="submit">Lưu</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </main>
  );
} 