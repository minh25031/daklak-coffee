"use client";
import { useEffect, useState } from "react";
import { getAllProcessingBatchEvaluations, ProcessingBatchEvaluation } from "@/lib/api/processingBatchEvaluations";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function ProcessingBatchEvaluationsPage() {
  const [data, setData] = useState<ProcessingBatchEvaluation[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setData(await getAllProcessingBatchEvaluations());
      setLoading(false);
    };
    fetchData();
  }, []);

  const filtered = data.filter((d) =>
    d.batchCode.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4"></h1>
      <div className="flex justify-between mb-4">
        <Input
          placeholder="Tìm kiếm mã lô..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-64"
        />
        <Button>+ Thêm đánh giá</Button>
      </div>
      <div className="bg-white rounded-xl shadow p-4">
        {loading ? (
          <div>Đang tải...</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr>
                <th>Mã lô</th>
                <th>Người đánh giá</th>
                <th>Điểm</th>
                <th>Ghi chú</th>
                <th>Ngày đánh giá</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((e) => (
                <tr key={e.evaluationId}>
                  <td>{e.batchCode}</td>
                  <td>{e.evaluator}</td>
                  <td>{e.score}</td>
                  <td>{e.note}</td>
                  <td>{new Date(e.createdAt).toLocaleDateString("vi-VN")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
} 