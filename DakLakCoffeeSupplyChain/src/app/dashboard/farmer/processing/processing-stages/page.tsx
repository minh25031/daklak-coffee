"use client";
import { useEffect, useState } from "react";
import { getAllProcessingStages, ProcessingStage } from "@/lib/api/processingStages";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function ProcessingStagesPage() {
  const [data, setData] = useState<ProcessingStage[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setData(await getAllProcessingStages());
      setLoading(false);
    };
    fetchData();
  }, []);

  const filtered = data.filter((d) =>
    d.stageName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6">
      <div className="flex justify-between mb-4">
        <Input
          placeholder="Tìm kiếm công đoạn..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-64"
        />
        <Button>+ Thêm công đoạn</Button>
      </div>
      <div className="bg-white rounded-xl shadow p-4">
        {loading ? (
          <div>Đang tải...</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr>
                <th>Tên công đoạn</th>
                <th>Mô tả</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((d) => (
                <tr key={d.stageId}>
                  <td>{d.stageName}</td>
                  <td>{d.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
} 