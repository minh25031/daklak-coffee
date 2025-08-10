"use client";

import { useEffect, useState } from "react";
import {
  getAllProcessingWastes,
  ProcessingWaste,
} from "@/lib/api/processingBatchWastes";
import { Trash2, Recycle, Scale, Calendar, Eye, Edit } from "lucide-react";
import { useRouter } from "next/navigation";

// Import các component chung
import ProcessingHeader from "@/components/processing/ProcessingHeader";
import SearchBox from "@/components/processing/SearchBox";
import ProcessingTable from "@/components/processing/ProcessingTable";

export default function ProcessingBatchWastesPage() {
  const router = useRouter();
  const [data, setData] = useState<ProcessingWaste[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAllProcessingWastes().then((res) => {
      setData(res);
      setLoading(false);
    });
  }, []);

  const filtered = data.filter((item) =>
    item.wasteCode?.toLowerCase().includes(search.toLowerCase())
  );

  // Cấu hình cột cho table
  const columns = [
    { key: "wasteCode", title: "Mã chất thải" },
    { key: "wasteType", title: "Loại chất thải" },
    { 
      key: "quantity", 
      title: "Số lượng",
      render: (value: number, item: ProcessingWaste) => `${value || 0} ${item.unit || ""}`
    },
    { 
      key: "createdAt", 
      title: "Ngày tạo",
      render: (value: string) => value ? new Date(value).toLocaleDateString("vi-VN") : "—"
    }
  ];

  // Cấu hình actions cho table - FARMER: Chỉ xem chất thải, không được sửa
  const actions = [
    {
      label: "Xem",
      icon: <Eye className="w-3 h-3" />,
      onClick: (waste: ProcessingWaste) => router.push(`/dashboard/farmer/processing/wastes/${waste.wasteId}`),
      className: "hover:bg-green-50 hover:border-green-300"
    }
    // FARMER: Không có quyền sửa chất thải
    // {
    //   label: "Sửa", 
    //   icon: <Edit className="w-3 h-3" />,
    //   onClick: (waste: ProcessingWaste) => router.push(`/dashboard/farmer/processing/wastes/${waste.wasteId}/edit`),
    //   className: "hover:bg-blue-50 hover:border-blue-300"
    // }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-6 max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <ProcessingHeader
          title="Quản lý chất thải sơ chế"
          description="Theo dõi chất thải từ quá trình sơ chế cà phê của bạn"
          // FARMER: Không có quyền tạo chất thải
          // createButtonText="Thêm chất thải"
          // onCreateClick={() => router.push("/dashboard/farmer/processing/wastes/create")}
        />

        {/* Search */}
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <SearchBox  
            placeholder="Tìm kiếm mã chất thải..."
            value={search}
            onChange={setSearch}
          />
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Danh sách chất thải sơ chế</h2>
              <p className="text-sm text-gray-600">Hiển thị {filtered.length} trong tổng số {data.length} chất thải</p>
            </div>
          </div>
          <div className="p-0">
            <ProcessingTable
              data={filtered}
              columns={columns}
              actions={actions}
              loading={loading}
              emptyMessage="Chưa có chất thải nào"
              emptyDescription="Thêm chất thải sơ chế đầu tiên để bắt đầu."
            />
          </div>
        </div>
      </div>
    </div>
  );
}