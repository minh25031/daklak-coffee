'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import ExpertAdviceForm from './create/page';
import { GeneralFarmerReportViewAllDto, getAllFarmerReports } from '@/lib/api/generalFarmerReports';
import { ExpertAdvice, getAllExpertAdvices, getExpertAdviceById } from '@/lib/api/expertAdvice';
import AdviceHistoryDialog from './AdviceHistoryDialog';

export default function ReportResponsePage() {
    const [reports, setReports] = useState<GeneralFarmerReportViewAllDto[]>([]);
    const [selectedReportId, setSelectedReportId] = useState<string | null>(null);
    const [allAdvices, setAllAdvices] = useState<ExpertAdvice[]>([]);
    const [filteredAdvices, setFilteredAdvices] = useState<ExpertAdvice[]>([]);
    const [showHistoryDialog, setShowHistoryDialog] = useState(false);
    const [showFormDialog, setShowFormDialog] = useState(false);
    const [expandedAdviceId, setExpandedAdviceId] = useState<string | null>(null);
    const [expandedAdviceData, setExpandedAdviceData] = useState<Record<string, ExpertAdvice>>({});

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

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">📋 Báo cáo cần phản hồi</h1>

            {reports.length === 0 ? (
                <p>Chưa có báo cáo nào.</p>
            ) : (
                <div className="space-y-4">
                    {reports.map((report) => (
                        <div
                            key={report.reportId}
                            className="p-4 border rounded bg-white shadow-sm flex justify-between items-start"
                        >
                            <div>
                                <p className="font-semibold">{report.title}</p>
                                <p className="text-sm text-gray-600">📆 {new Date(report.reportedAt).toLocaleString()}</p>
                                <p className="text-sm text-gray-600">👤 {report.reportedByName}</p>
                                <p className="text-sm text-gray-600">
                                    🛠️ Trạng thái:{' '}
                                    {report.isResolved ? (
                                        <span className="text-green-600 font-semibold">Đã phản hồi</span>
                                    ) : (
                                        <span className="text-red-600 font-semibold">Chưa phản hồi</span>
                                    )}
                                </p>

                                {allAdvices.some((a) => a.reportId === report.reportId) && (
                                    <button
                                        className="text-sm text-blue-500 underline mt-2"
                                        onClick={() => {
                                            setSelectedReportId(report.reportId);
                                            setShowHistoryDialog(true);
                                            setShowFormDialog(false);
                                        }}
                                    >
                                        📜 Xem lịch sử phản hồi
                                    </button>
                                )}
                            </div>

                            <button
                                className="text-blue-600 text-sm underline"
                                onClick={() => {
                                    setSelectedReportId(report.reportId);
                                    setShowFormDialog(true);
                                    setShowHistoryDialog(false);
                                }}
                            >
                                ✏️ Gửi phản hồi
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {showFormDialog && selectedReportId && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg shadow max-w-xl w-full relative">
                        <button
                            className="absolute top-2 right-4 text-gray-600"
                            onClick={() => {
                                setShowFormDialog(false);
                                setSelectedReportId(null);
                                setFilteredAdvices([]);
                            }}
                        >
                            ❌
                        </button>

                        <ExpertAdviceForm
                            reportId={selectedReportId}
                            onSuccess={() => {
                                // Đóng dialog
                                setShowFormDialog(false);
                                setSelectedReportId(null);
                                setFilteredAdvices([]);

                                // Load lại danh sách phản hồi mới
                                Promise.all([getAllExpertAdvices(), getAllFarmerReports()])
                                    .then(([advices, reports]) => {
                                        setAllAdvices(advices);
                                        setReports(reports); // 👈 cập nhật lại trạng thái báo cáo

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
