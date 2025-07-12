"use client";
import { useEffect, useState } from "react";
import { getAllProcessingWasteDisposals, ProcessingWasteDisposal } from "@/lib/api/processingWasteDisposals";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function ProcessingWasteDisposalsPage() {
  const [data, setData] = useState<ProcessingWasteDisposal[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setData(await getAllProcessingWasteDisposals());
      setLoading(false);
    };
    fetchData();
  }, []);

  const filtered = data.filter((d) =>
    d.batchCode.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Xử lý chất thải lô sơ chế</h1>
      <div className="flex justify-between mb-4">
        <Input
          placeholder="Tìm kiếm mã lô..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-64"
        />
        <Button>+ Thêm xử lý chất thải</Button>
      </div>
      <div className="bg-white rounded-xl shadow p-4">
        {loading ? (
          <div>Đang tải...</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr>
                <th>Mã lô</th>
                <th>Loại chất thải</th>
                <th>Số lượng</th>
                <th>Đơn vị</th>
                <th>Phương pháp xử lý</th>
                <th>Ngày tạo</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((d) => (
                <tr key={d.disposalId}>
                  <td>{d.batchCode}</td>
                  <td>{d.wasteType}</td>
                  <td>{d.quantity}</td>
                  <td>{d.unit}</td>
                  <td>{d.disposalMethod}</td>
                  <td>{new Date(d.createdAt).toLocaleDateString("vi-VN")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
} 