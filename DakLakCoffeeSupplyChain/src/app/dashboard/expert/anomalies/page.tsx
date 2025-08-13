'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import ExpertAdviceForm from './create/page';
import { GeneralFarmerReportViewAllDto, getAllFarmerReports } from '@/lib/api/generalFarmerReports';
import { ExpertAdvice, getAllExpertAdvices } from '@/lib/api/expertAdvice';
import AdviceHistoryDialog from './AdviceHistoryDialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, FileText, User, Calendar, CheckCircle, XCircle, History, MessageSquare, Filter } from 'lucide-react';

type FilterType = 'all' | 'resolved' | 'unresolved';

export default function ReportResponsePage() {
    const [reports, setReports] = useState<GeneralFarmerReportViewAllDto[]>([]);
    const [selectedReportId, setSelectedReportId] = useState<string | null>(null);
    const [allAdvices, setAllAdvices] = useState<ExpertAdvice[]>([]);
    const [filteredAdvices, setFilteredAdvices] = useState<ExpertAdvice[]>([]);
    const [showHistoryDialog, setShowHistoryDialog] = useState(false);
    const [showFormDialog, setShowFormDialog] = useState(false);
    const [activeFilter, setActiveFilter] = useState<FilterType>('all');

    useEffect(() => {
        getAllFarmerReports()
            .then(setReports)
            .catch(() => toast.error('Không thể tải danh sách báo cáo'));

        getAllExpertAdvices()
            .then(setAllAdvices)
            .catch(() => toast.error('Không thể tải phản hồi'));
    }, []);

    useEffect(() => {
        if (selectedReportId) {
            const filtered = allAdvices.filter((a) => a.reportId === selectedReportId);
            setFilteredAdvices(filtered);
        }
    }, [selectedReportId, allAdvices]);

    // Lọc báo cáo theo filter
    const filteredReports = reports.filter(report => {
        switch (activeFilter) {
            case 'resolved':
                return report.isResolved;
            case 'unresolved':
                return !report.isResolved;
            default:
                return true;
        }
    });

    // Tính số lượng báo cáo theo từng trạng thái
    const resolvedCount = reports.filter(r => r.isResolved).length;
    const unresolvedCount = reports.filter(r => !r.isResolved).length;
    const totalCount = reports.length;

    if (reports.length === 0) {
        return (
            <div className="p-6">
                <div className="text-center py-12">
                    <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <FileText className="w-8 h-8 text-orange-600" />
                    </div>
                    <h2 className="text-xl font-semibold text-gray-700 mb-2">Chưa có báo cáo nào</h2>
                    <p className="text-gray-500">Tất cả báo cáo đã được xử lý hoặc chưa có báo cáo mới</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                    <AlertTriangle className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Báo cáo cần phản hồi</h1>
                    <p className="text-gray-600 text-sm">Quản lý và phản hồi các báo cáo từ nông dân</p>
                </div>
            </div>

            {/* Filter Panel */}
            <Card className="bg-orange-50 border-orange-200">
                <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <Filter className="w-5 h-5 text-orange-600" />
                            <span className="text-sm font-medium text-gray-700">Lọc theo trạng thái:</span>
                        </div>

                        <div className="flex gap-2">
                            <Button
                                variant={activeFilter === 'all' ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => setActiveFilter('all')}
                                className={activeFilter === 'all'
                                    ? 'bg-orange-600 hover:bg-orange-700 text-white'
                                    : 'border-orange-200 text-gray-700 hover:bg-orange-50'
                                }
                            >
                                Tất cả
                                <span className="ml-2 bg-white/20 text-white px-2 py-0.5 rounded-full text-xs">
                                    {totalCount}
                                </span>
                            </Button>

                            <Button
                                variant={activeFilter === 'resolved' ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => setActiveFilter('resolved')}
                                className={activeFilter === 'resolved'
                                    ? 'bg-green-600 hover:bg-green-700 text-white'
                                    : 'border-green-200 text-gray-700 hover:bg-green-50'
                                }
                            >
                                <CheckCircle className="w-4 h-4 mr-2" />
                                Đã phản hồi
                                <span className="ml-2 bg-white/20 text-white px-2 py-0.5 rounded-full text-xs">
                                    {resolvedCount}
                                </span>
                            </Button>

                            <Button
                                variant={activeFilter === 'unresolved' ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => setActiveFilter('unresolved')}
                                className={activeFilter === 'unresolved'
                                    ? 'bg-red-600 hover:bg-red-700 text-white'
                                    : 'border-red-200 text-gray-700 hover:bg-red-50'
                                }
                            >
                                <XCircle className="w-4 h-4 mr-2" />
                                Chưa phản hồi
                                <span className="ml-2 bg-white/20 text-white px-2 py-0.5 rounded-full text-xs">
                                    {unresolvedCount}
                                </span>
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Reports List */}
            <div className="grid gap-4">
                {filteredReports.length === 0 ? (
                    <Card className="bg-gray-50 border-gray-200">
                        <CardContent className="p-8 text-center">
                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Filter className="w-8 h-8 text-gray-400" />
                            </div>
                            <h3 className="text-lg font-medium text-gray-700 mb-2">Không có báo cáo nào</h3>
                            <p className="text-gray-500">
                                {activeFilter === 'resolved'
                                    ? 'Không có báo cáo nào đã được phản hồi'
                                    : activeFilter === 'unresolved'
                                        ? 'Không có báo cáo nào chưa được phản hồi'
                                        : 'Không có báo cáo nào'
                                }
                            </p>
                            <Button
                                variant="outline"
                                onClick={() => setActiveFilter('all')}
                                className="mt-4"
                            >
                                Xem tất cả báo cáo
                            </Button>
                        </CardContent>
                    </Card>
                ) : (
                    filteredReports.map((report) => (
                        <Card key={report.reportId} className="hover:shadow-md transition-shadow duration-200">
                            <CardHeader className="pb-3">
                                <div className="flex justify-between items-start">
                                    <div className="flex-1">
                                        <CardTitle className="text-lg text-gray-800 mb-2">{report.title}</CardTitle>
                                        <div className="flex items-center gap-4 text-sm text-gray-600">
                                            <div className="flex items-center gap-1">
                                                <Calendar className="w-4 h-4" />
                                                <span>{new Date(report.reportedAt).toLocaleDateString('vi-VN')}</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <User className="w-4 h-4" />
                                                <span>{report.reportedByName}</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                {report.isResolved ? (
                                                    <>
                                                        <CheckCircle className="w-4 h-4 text-green-600" />
                                                        <span className="text-green-600 font-medium">Đã phản hồi</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <XCircle className="w-4 h-4 text-red-600" />
                                                        <span className="text-red-600 font-medium">Chưa phản hồi</span>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="flex justify-between items-center">
                                    <div className="flex-1">
                                        {allAdvices.some((a) => a.reportId === report.reportId) && (
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => {
                                                    setSelectedReportId(report.reportId);
                                                    setShowHistoryDialog(true);
                                                    setShowFormDialog(false);
                                                }}
                                                className="text-orange-600 hover:text-orange-800 hover:bg-orange-50"
                                            >
                                                <History className="w-4 h-4 mr-2" />
                                                Xem lịch sử phản hồi
                                            </Button>
                                        )}
                                    </div>
                                    <Button
                                        onClick={() => {
                                            setSelectedReportId(report.reportId);
                                            setShowFormDialog(true);
                                            setShowHistoryDialog(false);
                                        }}
                                        className="bg-orange-600 hover:bg-orange-700 text-white"
                                    >
                                        <MessageSquare className="w-4 h-4 mr-2" />
                                        Gửi phản hồi
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>

            {showFormDialog && selectedReportId && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg max-w-xl w-full relative">
                        <button
                            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
                            onClick={() => {
                                setShowFormDialog(false);
                                setSelectedReportId(null);
                                setFilteredAdvices([]);
                            }}
                        >
                            <XCircle className="w-5 h-5" />
                        </button>

                        <ExpertAdviceForm
                            reportId={selectedReportId}
                            onSuccess={() => {
                                setShowFormDialog(false);
                                setSelectedReportId(null);
                                setFilteredAdvices([]);

                                Promise.all([getAllExpertAdvices(), getAllFarmerReports()])
                                    .then(([advices, reports]) => {
                                        setAllAdvices(advices);
                                        setReports(reports);

                                        const filtered = advices.filter((a) => a.reportId === selectedReportId);
                                        setFilteredAdvices(filtered);
                                    })
                                    .catch(() => toast.error('Không thể tải lại dữ liệu sau khi gửi phản hồi'));
                            }}
                        />
                    </div>
                </div>
            )}

            {showHistoryDialog && selectedReportId && (
                <AdviceHistoryDialog
                    advices={filteredAdvices}
                    onClose={() => {
                        setShowHistoryDialog(false);
                        setSelectedReportId(null);
                        setFilteredAdvices([]);
                    }}
                />
            )}
        </div>
    );
}
