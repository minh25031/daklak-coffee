"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getContractDetails, ContractViewDetailsDto } from "@/lib/api/contracts";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

const contractStatusMap: Record<string, { label: string; className: string }> = {
  NotStarted: { label: "Chưa bắt đầu", className: "bg-gray-200 text-gray-700" },
  PreparingDelivery: { label: "Chuẩn bị giao", className: "bg-blue-100 text-blue-700" },
  InProgress: { label: "Đang thực hiện", className: "bg-yellow-100 text-yellow-800" },
  Completed: { label: "Hoàn thành", className: "bg-green-100 text-green-700" },
  Cancelled: { label: "Đã huỷ", className: "bg-red-100 text-red-700" },
};

const formatDate = (dateString: string | undefined) => {
  if (!dateString) return "-";
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit', 
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
};

export default function ContractDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [contract, setContract] = useState<ContractViewDetailsDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    getContractDetails(id as string)
      .then((data) => {
        setContract(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || "Không thể tải chi tiết hợp đồng");
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return <div className="flex justify-center items-center h-60"><LoadingSpinner /></div>;
  }
  if (error) {
    return <div className="text-center text-red-500 py-8">{error}</div>;
  }
  if (!contract) {
    return null;
  }

  return (
    <div className="w-full min-h-screen bg-orange-50 p-4 md:p-8">
      <Card className="max-w-3xl mx-auto shadow-lg border border-orange-200">
        <CardHeader>
          <CardTitle className="text-xl md:text-2xl text-orange-900 font-bold">Chi tiết hợp đồng</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-orange-50 rounded-lg p-4 md:p-6 mb-8 border border-orange-100">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="text-xs text-orange-700 font-semibold mb-1">Mã hợp đồng</div>
                <div className="font-bold text-base text-gray-800">{contract.contractCode}</div>
              </div>
              <div>
                <div className="text-xs text-orange-700 font-semibold mb-1">Số hợp đồng</div>
                <div className="font-bold text-base text-gray-800">{contract.contractNumber}</div>
              </div>
              <div className="md:col-span-2">
                <div className="text-xs text-orange-700 font-semibold mb-1">Tiêu đề</div>
                <div className="font-bold text-lg text-orange-900">{contract.contractTitle}</div>
              </div>
              <div>
                <div className="text-xs text-orange-700 font-semibold mb-1">Bên bán</div>
                <div className="text-gray-700">{contract.sellerName}</div>
              </div>
              <div>
                <div className="text-xs text-orange-700 font-semibold mb-1">Bên mua</div>
                <div className="text-gray-700">{contract.buyerName}</div>
              </div>
              <div>
                <div className="text-xs text-orange-700 font-semibold mb-1">Số vòng giao</div>
                <div className="text-gray-700">{contract.deliveryRounds ?? "-"}</div>
              </div>
              <div>
                <div className="text-xs text-orange-700 font-semibold mb-1">Tổng khối lượng</div>
                <div className="text-gray-700">{contract.totalQuantity?.toLocaleString() ?? "-"}</div>
              </div>
              <div>
                <div className="text-xs text-orange-700 font-semibold mb-1">Tổng giá trị</div>
                <div className="text-gray-700">{contract.totalValue?.toLocaleString() ?? "-"}</div>
              </div>
              <div>
                <div className="text-xs text-orange-700 font-semibold mb-1">Ngày bắt đầu</div>
                <div className="text-gray-700">{contract.startDate ?? "-"}</div>
              </div>
              <div>
                <div className="text-xs text-orange-700 font-semibold mb-1">Ngày kết thúc</div>
                <div className="text-gray-700">{contract.endDate ?? "-"}</div>
              </div>
              <div>
                <div className="text-xs text-orange-700 font-semibold mb-1">Ngày ký</div>
                <div className="text-gray-700">{formatDate(contract.signedAt)}</div>
              </div>
              <div>
                <div className="text-xs text-orange-700 font-semibold mb-1">Trạng thái</div>
                <span className={`px-2 py-1 rounded text-xs font-semibold ${contractStatusMap[contract.status]?.className || "bg-gray-100 text-gray-600"}`}>
                  {contractStatusMap[contract.status]?.label || contract.status}
                </span>
              </div>
              {contract.status === "Cancelled" && contract.cancelReason && (
                <div className="md:col-span-2">
                  <div className="text-xs text-orange-700 font-semibold mb-1">Lý do huỷ</div>
                  <div className="text-red-600 font-semibold">{contract.cancelReason}</div>
                </div>
              )}
              <div>
                <div className="text-xs text-orange-700 font-semibold mb-1">Ngày tạo</div>
                <div className="text-gray-700">{formatDate(contract.createdAt)}</div>
              </div>
              <div>
                <div className="text-xs text-orange-700 font-semibold mb-1">Ngày cập nhật</div>
                <div className="text-gray-700">{formatDate(contract.updatedAt)}</div>
              </div>
              {contract.contractFileUrl && (
                <div className="md:col-span-2">
                  <div className="text-xs text-orange-700 font-semibold mb-1">File hợp đồng</div>
                  <a
                    href={contract.contractFileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 underline hover:text-blue-800 font-semibold"
                  >
                    Tải file hợp đồng
                  </a>
                </div>
              )}
            </div>
          </div>
          <div className="mt-8">
            <div className="font-semibold mb-2 text-orange-900 text-lg">Danh sách mặt hàng trong hợp đồng</div>
            <div className="overflow-x-auto rounded-lg border border-orange-100 bg-orange-50">
              <Table className="min-w-[700px]">
                <TableHeader>
                  <TableRow>
                    <TableHead>Tên loại cà phê</TableHead>
                    <TableHead>Số lượng</TableHead>
                    <TableHead>Đơn giá</TableHead>
                    <TableHead>Chiết khấu</TableHead>
                    <TableHead>Ghi chú</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {contract.contractItems.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-gray-500">Không có mặt hàng nào.</TableCell>
                    </TableRow>
                  ) : (
                    contract.contractItems.map((item) => (
                      <TableRow key={item.contractItemId}>
                        <TableCell>{item.coffeeTypeName}</TableCell>
                        <TableCell>{item.quantity?.toLocaleString() ?? "-"}</TableCell>
                        <TableCell>{item.unitPrice?.toLocaleString() ?? "-"}</TableCell>
                        <TableCell>{item.discountAmount?.toLocaleString() ?? "-"}</TableCell>
                        <TableCell>{item.note}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
          <div className="flex justify-end mt-8">
            <Button variant="outline" className="min-w-[120px]" onClick={() => router.push("/dashboard/manager/contracts")}>← Quay lại</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
