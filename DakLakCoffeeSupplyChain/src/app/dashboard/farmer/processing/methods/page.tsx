"use client";
import { useEffect, useState } from "react";
import { getAllProcessingMethods, ProcessingMethod } from "@/lib/api/processingMethods";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function ProcessingMethodsPage() {
  const [data, setData] = useState<ProcessingMethod[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setData(await getAllProcessingMethods());
      setLoading(false);
    };
    fetchData();
  }, []);

  const filtered = data.filter((d) =>
    d.methodName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Phương pháp sơ chế</h1>
      <div className="flex justify-between mb-4">
        <Input
          placeholder="Tìm kiếm phương pháp..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-64"
        />
        <Button>+ Thêm phương pháp</Button>
      </div>
      <div className="bg-white rounded-xl shadow p-4">
        {loading ? (
          <div>Đang tải...</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr>
                <th>Tên phương pháp</th>
                <th>Mô tả</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((d) => (
                <tr key={d.methodId}>
                  <td>{d.methodName}</td>
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