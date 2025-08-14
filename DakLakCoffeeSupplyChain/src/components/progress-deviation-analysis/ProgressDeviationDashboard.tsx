"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    ProgressDeviationAnalysis,
    OverallDeviationReport,
    analyzeFarmerOverallDeviation,
    analyzeSystemOverallDeviation,

    getDeviationStatusColor,
    getDeviationStatusIcon,
    calculateOverallDeviationStatus
} from '@/lib/api/progressDeviationAnalysis';
import ProgressDeviationAnalysisCard from './ProgressDeviationAnalysisCard';

interface ProgressDeviationDashboardProps {
    userRole?: 'farmer' | 'manager' | 'admin';
}

export default function ProgressDeviationDashboard({ userRole = 'farmer' }: ProgressDeviationDashboardProps) {
    const [overallReport, setOverallReport] = useState<OverallDeviationReport | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);


    useEffect(() => {
        loadOverallDeviationData();
    }, [userRole]);

    const loadOverallDeviationData = async () => {
        try {
            setLoading(true);
            setError(null);

            let data: OverallDeviationReport | null = null;

            if (userRole === 'farmer') {
                data = await analyzeFarmerOverallDeviation();
            } else if (userRole === 'manager' || userRole === 'admin') {
                data = await analyzeSystemOverallDeviation();
            }

            if (data) {
                setOverallReport(data);
            } else {
                setError('Không thể tải dữ liệu phân tích sai lệch');
            }
        } catch (err) {
            setError('Đã xảy ra lỗi khi tải dữ liệu');
            console.error('Error loading deviation data:', err);
        } finally {
            setLoading(false);
        }
    };



    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Đang tải dữ liệu phân tích...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center py-8">
                <p className="text-red-600 mb-4">{error}</p>
                <Button onClick={loadOverallDeviationData} variant="outline">
                    Thử lại
                </Button>
            </div>
        );
    }

    if (!overallReport) {
        return (
            <div className="text-center py-8">
                <p className="text-gray-600 mb-4">Không có dữ liệu phân tích sai lệch</p>
                <Button onClick={loadOverallDeviationData} variant="outline">
                    Tải dữ liệu
                </Button>
            </div>
        );
    }

    const overallStatus = calculateOverallDeviationStatus(overallReport.topDeviations);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Phân tích sai lệch tiến độ</h1>
                    <p className="text-gray-600 mt-2">
                        Theo dõi và phân tích sai lệch tiến độ mùa vụ để tối ưu hóa quy trình canh tác
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Badge className={overallStatus.color}>
                        {overallStatus.icon} {overallStatus.status}
                    </Badge>
                </div>
            </div>



            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Tổng mùa vụ</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{overallReport.totalCropSeasons}</div>
                        <p className="text-xs text-gray-600">Mùa vụ được phân tích</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Đúng tiến độ</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">{overallReport.onTimeSeasons}</div>
                        <p className="text-xs text-gray-600">Mùa vụ đúng hạn</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Chậm tiến độ</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-yellow-600">{overallReport.behindSeasons}</div>
                        <p className="text-xs text-gray-600">Mùa vụ chậm hạn</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Nghiêm trọng</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-600">{overallReport.criticalSeasons}</div>
                        <p className="text-xs text-gray-600">Mùa vụ chậm nghiêm trọng</p>
                    </CardContent>
                </Card>
            </div>

            {/* Detailed Analysis */}
            <Tabs defaultValue="overview" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="overview">Tổng quan</TabsTrigger>
                    <TabsTrigger value="deviations">Sai lệch chi tiết</TabsTrigger>
                    <TabsTrigger value="critical">Cần chú ý</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Thống kê tổng hợp</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <h4 className="font-medium mb-3">Sai lệch tiến độ trung bình</h4>
                                    <div className="text-3xl font-bold text-blue-600">
                                        {overallReport.averageDeviationPercentage.toFixed(1)}%
                                    </div>
                                    <p className="text-sm text-gray-600">
                                        Sai lệch trung bình so với kế hoạch
                                    </p>
                                </div>
                                <div>
                                    <h4 className="font-medium mb-3">Sai lệch sản lượng trung bình</h4>
                                    <div className="text-3xl font-bold text-orange-600">
                                        {overallReport.averageYieldDeviationPercentage.toFixed(1)}%
                                    </div>
                                    <p className="text-sm text-gray-600">
                                        Sai lệch sản lượng so với dự kiến
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="deviations" className="space-y-4">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {overallReport.topDeviations.map((analysis) => (
                            <ProgressDeviationAnalysisCard
                                key={analysis.analysisId}
                                analysis={analysis}
                                showDetails={false}
                            />
                        ))}
                    </div>
                </TabsContent>

                <TabsContent value="critical" className="space-y-4">
                    {overallReport.criticalDeviations.length > 0 ? (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {overallReport.criticalDeviations.map((analysis) => (
                                <ProgressDeviationAnalysisCard
                                    key={analysis.analysisId}
                                    analysis={analysis}
                                    showDetails={true}
                                />
                            ))}
                        </div>
                    ) : (
                        <Card>
                            <CardContent className="text-center py-8">
                                <p className="text-gray-600">Không có mùa vụ nào cần chú ý đặc biệt</p>
                            </CardContent>
                        </Card>
                    )}
                </TabsContent>
            </Tabs>

            {/* Report Footer */}
            <Card className="bg-gray-50">
                <CardContent className="pt-6">
                    <div className="text-center text-sm text-gray-600">
                        <p>Báo cáo được tạo lúc: {new Date(overallReport.reportDate).toLocaleString('vi-VN')}</p>
                        <p>Khoảng thời gian: {new Date(overallReport.fromDate).toLocaleDateString('vi-VN')} - {new Date(overallReport.toDate).toLocaleDateString('vi-VN')}</p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
