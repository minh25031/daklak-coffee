"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getInboundRequestDetailForFarmer } from "@/lib/api/warehouseInboundRequest";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function FarmerInboundRequestDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;

    const fetchDetail = async () => {
      try {
        const result = await getInboundRequestDetailForFarmer(id as string);
        if (result?.status === 1) {
          setData(result.data);
        } else {
          throw new Error(result?.message || "Không lấy được dữ liệu");
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDetail();
  }, [id]);

  const formatDate = (value: string | null | undefined) => {
    if (!value) return "Không có";
    const d = new Date(value);
    return isNaN(d.getTime()) ? "Không xác định" : d.toLocaleDateString("vi-VN");
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "Pending":
        return "Chờ duyệt";
      case "Approved":
        return "Đã duyệt";
      case "Rejected":
        return "Từ chối";
      case "Cancelled":
        return "Đã huỷ";
      case "Completed":
        return "Hoàn thành";
      default:
        return status;
    }
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "Approved":
        return "bg-green-100 text-green-800";
      case "Rejected":
        return "bg-red-100 text-red-800";
      case "Cancelled":
        return "bg-gray-200 text-gray-700";
      case "Pending":
        return "bg-yellow-100 text-yellow-800";
      case "Completed":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  if (loading) return <p className="p-6">Đang tải dữ liệu...</p>;
  if (error) return <p className="text-red-600 p-6">❌ {error}</p>;
  if (!data) return <p className="p-6">Không tìm thấy dữ liệu</p>;

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded-xl shadow space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-orange-700">
          📦 Chi tiết yêu cầu nhập kho
        </h1>
        <Button variant="outline" onClick={() => router.back()}>
          ← Quay lại danh sách
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-800">
        <DetailItem label="Mã yêu cầu" value={data.requestCode} />
        <DetailItem
          label="Trạng thái"
          value={
            <Badge className={`capitalize ${getStatusStyle(data.status)}`}>
              {getStatusLabel(data.status)}
            </Badge>
          }
        />

        <DetailItem
          label="Số lượng yêu cầu"
          value={`${data.requestedQuantity} kg`}
        />
        <DetailItem
          label="Ngày giao dự kiến"
          value={formatDate(data.preferredDeliveryDate)}
        />

        <DetailItem
          label="Ngày giao thực tế"
          value={formatDate(data.actualDeliveryDate)}
        />
        <DetailItem label="Ghi chú" value={data.note || "Không có"} />

        <DetailItem label="Mã lô chế biến" value={data.batchCode} />
        <DetailItem label="Loại cà phê" value={data.coffeeType} />
        <DetailItem label="Mùa vụ" value={data.seasonCode} />
      </div>
    </div>
  );
}

function DetailItem({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex flex-col">
      <span className="text-sm font-bold text-gray-600">{label}</span>
      <span className="mt-1">{value}</span>
    </div>
  );
}
