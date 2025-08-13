'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getLogsByInventoryId } from '@/lib/api/inventoryLogs';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, History, TrendingUp, TrendingDown, Package, User, Clock, FileText } from 'lucide-react';

export default function StaffInventoryLogsPage() {
  const { id } = useParams();
  const router = useRouter();
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchLogs() {
      setLoading(true);
      try {
        const result = await getLogsByInventoryId(id as string);
        if (Array.isArray(result) && result.length > 0) {
          setLogs(result);
        } else {
          setError('Không có log tồn kho.');
        }
      } catch (err: any) {
        setError(err.message || 'Lỗi khi tải log tồn kho.');
      } finally {
        setLoading(false);
      }
    }

    if (id) fetchLogs();
  }, [id]);

  const getActionIcon = (actionType: string) => {
    if (actionType?.toLowerCase().includes('nhập') || actionType?.toLowerCase().includes('inbound')) {
      return <TrendingUp className="w-4 h-4 text-green-600" />;
    } else if (actionType?.toLowerCase().includes('xuất') || actionType?.toLowerCase().includes('outbound')) {
      return <TrendingDown className="w-4 h-4 text-red-600" />;
    }
    return <Package className="w-4 h-4 text-blue-600" />;
  };

  const getActionColor = (actionType: string) => {
    if (actionType?.toLowerCase().includes('nhập') || actionType?.toLowerCase().includes('inbound')) {
      return 'border-green-500 bg-green-50';
    } else if (actionType?.toLowerCase().includes('xuất') || actionType?.toLowerCase().includes('outbound')) {
      return 'border-red-500 bg-red-50';
    }
    return 'border-blue-500 bg-blue-50';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-6 px-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm border border-blue-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg">
                <History className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">
                  📑 Lịch sử thay đổi tồn kho
                </h1>
                <p className="text-gray-600 text-sm">
                  Theo dõi các thay đổi về số lượng và trạng thái tồn kho
                </p>
              </div>
            </div>
            <Button 
              variant="outline" 
              onClick={() => router.push('/dashboard/staff/inventories')}
              className="border-blue-200 text-blue-700 hover:bg-blue-50"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Quay lại danh sách
            </Button>
          </div>
        </div>

        {/* Content */}
        <Card className="border-blue-100 shadow-sm">
          <CardContent className="p-6">
            {loading && (
              <div className="text-center py-8">
                <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                <p className="text-gray-600">⏳ Đang tải dữ liệu...</p>
              </div>
            )}

            {!loading && error && (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-2xl">❌</span>
                </div>
                <p className="text-red-600 font-medium">{error}</p>
              </div>
            )}

            {!loading && !error && logs.length > 0 && (
              <div className="space-y-4">
                {logs.map((log, index) => (
                  <div
                    key={log.logId}
                    className={`border-l-4 ${getActionColor(log.actionType)} p-4 rounded-lg shadow-sm relative`}
                  >
                    <div className="absolute -left-2 top-4 w-4 h-4 bg-white border-2 border-gray-300 rounded-full"></div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div className="flex items-center gap-2">
                        {getActionIcon(log.actionType)}
                        <div>
                          <p className="text-xs text-gray-500 font-medium">Hành động</p>
                          <p className="font-semibold text-gray-800">{log.actionType}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Package className="w-4 h-4 text-blue-600" />
                        <div>
                          <p className="text-xs text-gray-500 font-medium">Số lượng</p>
                          <p className="font-semibold text-gray-800">{log.quantityChanged} kg</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-purple-600" />
                        <div>
                          <p className="text-xs text-gray-500 font-medium">Người cập nhật</p>
                          <p className="font-semibold text-gray-800">{log.updatedByName || 'Hệ thống'}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-gray-600" />
                        <div>
                          <p className="text-xs text-gray-500 font-medium">Thời gian</p>
                          <p className="font-semibold text-gray-800">
                            {new Date(log.loggedAt).toLocaleString('vi-VN')}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    {log.note && (
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <div className="flex items-start gap-2">
                          <FileText className="w-4 h-4 text-gray-500 mt-0.5" />
                          <div>
                            <p className="text-xs text-gray-500 font-medium">Ghi chú</p>
                            <p className="text-sm text-gray-700">{log.note}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {!loading && !error && logs.length === 0 && (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <History className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-gray-500 font-medium">Không có lịch sử tồn kho</p>
                <p className="text-gray-400 text-sm">Chưa có thay đổi nào được ghi nhận</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
