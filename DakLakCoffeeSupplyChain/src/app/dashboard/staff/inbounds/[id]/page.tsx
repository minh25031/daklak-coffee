"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  getInboundRequestById,
  approveInboundRequest,
  rejectInboundRequest,
} from "@/lib/api/warehouseInboundRequest";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function InboundRequestDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [request, setRequest] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchDetail() {
      const res = await getInboundRequestById(id as string);
      if (res.status === 1) {
        setRequest(res.data);
      } else {
        alert("Lỗi: " + res.message);
        router.push("/dashboard/staff/inbounds");
      }
    }

    fetchDetail();
  }, [id, router]);

  const handleApprove = async () => {
    setLoading(true);
    const res = await approveInboundRequest(id as string);
    alert(res.message);
    router.push("/dashboard/staff/inbounds");
  };

  const handleReject = async () => {
    setLoading(true);
    const res = await rejectInboundRequest(id as string);
    alert(res.message);
    router.push("/dashboard/staff/inbounds");
  };

  if (!request) return <div className="p-6">Đang tải...</div>;

  return (
    <div className="p-6">
      <Card>
        <CardHeader>
          <CardTitle>Chi tiết yêu cầu nhập kho</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p><strong>Mã yêu cầu:</strong> {request.requestCode}</p>
          <p><strong>Số lượng:</strong> {request.requestedQuantity} kg</p>
          <p><strong>Ngày giao dự kiến:</strong> {request.preferredDeliveryDate}</p>
          <p><strong>Ghi chú:</strong> {request.note || "Không có"}</p>
          <p><strong>Trạng thái:</strong>
            <Badge
              className={`ml-2 capitalize px-3 py-1 rounded-md font-medium text-sm ${request.status === "Approved"
                  ? "bg-green-100 text-green-800"
                  : request.status === "Rejected"
                    ? "bg-red-100 text-red-800"
                    : "bg-gray-100 text-gray-800"
                }`}
            >
              {request.status}
            </Badge>
          </p>

          {request.status === "Pending" && (
            <div className="flex gap-4 mt-4">
              <Button onClick={handleApprove} disabled={loading} className="bg-green-600 hover:bg-green-700">
                ✅ Duyệt
              </Button>
              <Button onClick={handleReject} disabled={loading} className="bg-red-600 hover:bg-red-700">
                ❌ Từ chối
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
