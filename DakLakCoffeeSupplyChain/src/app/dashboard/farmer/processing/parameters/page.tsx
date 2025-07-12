"use client";
import { useEffect, useState } from "react";
import { getAllProcessingParameters, ProcessingParameter } from "@/lib/api/processingParameters";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function ProcessingParametersPage() {
  const [data, setData] = useState<ProcessingParameter[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setData(await getAllProcessingParameters());
      setLoading(false);
    };
    fetchData();
  }, []);

  const filtered = data.filter((d) =>
    d.parameterName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Tham số sơ chế</h1>
      <div className="flex justify-between mb-4">
        <Input
          placeholder="Tìm kiếm tham số..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-64"
        />
        <Button>+ Thêm tham số</Button>
      </div>
      <div className="bg-white rounded-xl shadow p-4">
        {loading ? (
          <div>Đang tải...</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr>
                <th>Tên tham số</th>
                <th>Giá trị</th>
                <th>Đơn vị</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((d) => (
                <tr key={d.parameterId}>
                  <td>{d.parameterName}</td>
                  <td>{d.value}</td>
                  <td>{d.unit}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
} 