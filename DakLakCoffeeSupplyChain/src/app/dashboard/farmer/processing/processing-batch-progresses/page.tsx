"use client";
import { useEffect, useState } from "react";
import { getAllProcessingBatchProgresses, ProcessingBatchProgress } from "@/lib/api/processingBatchProgresses";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function ProcessingBatchProgressesPage() {
  const [data, setData] = useState<ProcessingBatchProgress[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setData(await getAllProcessingBatchProgresses());
      setLoading(false);
    };
    fetchData();
  }, []);

  const filtered = data.filter((d) =>
    d.batchCode.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6">
      <div className="flex justify-between mb-4">
        <Input
          placeholder="Tìm kiếm mã lô..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-64"
        />
        <Button>+ Thêm tiến trình</Button>
      </div>
      <div className="bg-white rounded-xl shadow p-4">
        {loading ? (
          <div>Đang tải...</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr>
                <th>Mã lô</th>
                <th>Công đoạn</th>
                <th>Tiến trình</th>
                <th>Ngày cập nhật</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((d) => (
                <tr key={d.progressId}>
                  <td>{d.batchCode}</td>
                  <td>{d.stageName}</td>
                  <td>{d.progress}</td>
                  <td>{new Date(d.updatedAt).toLocaleDateString("vi-VN")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
} 