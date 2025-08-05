'use client';

import { useEffect, useState } from 'react';
import {
  getAllOutboundRequests,
  acceptOutboundRequest,
  rejectOutboundRequest,
} from '@/lib/api/warehouseOutboundRequest';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight, Eye, Check, X } from 'lucide-react';

export default function StaffOutboundRequestList() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 6;
  const router = useRouter();

  useEffect(() => {
    getAllOutboundRequests()
      .then((res) => {
        if (res.status === 1 && Array.isArray(res.data)) {
          setData(res.data);
        } else {
          alert('⚠️ ' + (res.message || 'Dữ liệu không hợp lệ'));
        }
      })
      .catch((err) => alert('❌ Lỗi khi tải danh sách: ' + err.message))
      .finally(() => setLoading(false));
  }, []);

  const handleAccept = async (id: string) => {
    if (!window.confirm('Bạn chắc chắn muốn duyệt yêu cầu này?')) return;

    try {
      const result = await acceptOutboundRequest(id);
      if (result.status === 1) {
        alert('✅ ' + result.message);
        location.reload();
      } else {
        alert('❌ ' + result.message);
      }
    } catch (err: any) {
      alert('❌ ' + err.message);
    }
  };

  const handleReject = async (id: string) => {
    const reason = prompt('Nhập lý do từ chối yêu cầu:');
    if (!reason || !reason.trim()) return;

    try {
      const result = await rejectOutboundRequest(id, reason);
      if (result.status === 1) {
        alert('✅ ' + result.message);
        setData((prev) =>
          prev.map((item) =>
            item.outboundRequestId === id
              ? { ...item, status: 'Rejected', rejectReason: reason }
              : item
          )
        );
      } else {
        alert('❌ ' + result.message);
      }
    } catch (err: any) {
      alert('❌ ' + err.message);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Pending':
        return <Badge className="bg-gray-100 text-gray-800">⏳ Chờ duyệt</Badge>;
      case 'Accepted':
        return <Badge className="bg-blue-100 text-blue-800">📦 Đã duyệt</Badge>;
      case 'Completed':
        return <Badge className="bg-green-100 text-green-800">✅ Hoàn tất</Badge>;
      case 'Cancelled':
        return <Badge className="bg-yellow-100 text-yellow-800">🚫 Đã huỷ</Badge>;
      case 'Rejected':
        return <Badge className="bg-red-100 text-red-800">❌ Từ chối</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const totalPages = Math.ceil(data.length / pageSize);
  const pagedData = data.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  if (loading) return <p className="p-6">Đang tải dữ liệu...</p>;

  return (
    <div className="p-6 space-y-6">
      <Card className="p-6">
        <h1 className="text-xl font-bold mb-4">📤 Danh sách yêu cầu xuất kho</h1>

        {data.length === 0 ? (
          <p className="text-muted-foreground">Không có yêu cầu nào.</p>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full table-auto border bg-white">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="border p-2 text-left">Mã yêu cầu</th>
                    <th className="border p-2 text-left">Kho</th>
                    <th className="border p-2 text-left">Số lượng</th>
                    <th className="border p-2 text-left">Trạng thái</th>
                    <th className="border p-2 text-center">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {pagedData.map((item) => (
                    <tr key={item.outboundRequestId} className="border-t">
                      <td className="p-2">{item.outboundRequestCode}</td>
                      <td className="p-2">{item.warehouseName || 'Không rõ'}</td>
                      <td className="p-2">
                        {item.requestedQuantity} {item.unit || 'kg'}
                      </td>
                      <td className="p-2">{getStatusBadge(item.status)}</td>
                      <td className="p-2">
                        <div className="flex justify-center items-center gap-2">
                          <Eye
                            className="w-5 h-5 text-gray-700 hover:text-blue-600 cursor-pointer"
                            onClick={() =>
                              router.push(`/dashboard/staff/outbounds/${item.outboundRequestId}`)
                            }
                          />
                          {item.status === 'Pending' && (
                            <>
                              <Check
                                className="w-5 h-5 text-green-600 hover:text-green-800 cursor-pointer"
                                onClick={() => handleAccept(item.outboundRequestId)}
                              />
                              <X
                                className="w-5 h-5 text-red-600 hover:text-red-800 cursor-pointer"
                                onClick={() => handleReject(item.outboundRequestId)}
                              />
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-between items-center mt-4">
                <span className="text-sm text-muted-foreground">
                  Hiển thị {(currentPage - 1) * pageSize + 1}–{Math.min(currentPage * pageSize, data.length)} trong {data.length} yêu cầu
                </span>
                <div className="flex items-center gap-2">
                  <button
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    className="p-1 border rounded disabled:opacity-30"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  {[...Array(totalPages).keys()].map((_, i) => {
                    const page = i + 1;
                    return (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`rounded-full px-3 py-1 text-sm font-medium ${
                          page === currentPage
                            ? 'bg-orange-600 text-white'
                            : 'bg-white text-orange-600 border border-orange-400'
                        }`}
                      >
                        {page}
                      </button>
                    );
                  })}
                  <button
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    className="p-1 border rounded disabled:opacity-30"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </Card>
    </div>
  );
}
