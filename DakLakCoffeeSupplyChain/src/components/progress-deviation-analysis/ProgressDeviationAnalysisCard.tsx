import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    ProgressDeviationAnalysis,
    getDeviationStatusColor,
    getDeviationLevelColor,
    getDeviationStatusIcon,
    formatDeviationPercentage
} from '@/lib/api/progressDeviationAnalysis';

interface ProgressDeviationAnalysisCardProps {
    analysis: ProgressDeviationAnalysis;
    showDetails?: boolean;
}

export default function ProgressDeviationAnalysisCard({
    analysis,
    showDetails = false
}: ProgressDeviationAnalysisCardProps) {
    return (
        <Card className="w-full">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="text-lg font-semibold">
                            {analysis.cropSeasonDetailName || analysis.cropSeasonName}
                        </CardTitle>
                        <CardDescription>
                            Phân tích sai lệch tiến độ - {analysis.farmerName}
                        </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                        <Badge className={getDeviationStatusColor(analysis.deviationStatus)}>
                            {getDeviationStatusIcon(analysis.deviationStatus)} {analysis.deviationStatus}
                        </Badge>
                        <Badge className={getDeviationLevelColor(analysis.deviationLevel)}>
                            {analysis.deviationLevel}
                        </Badge>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="space-y-4">
                {/* Progress Overview */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <p className="text-sm font-medium text-gray-600">Tiến độ thực tế</p>
                        <p className="text-2xl font-bold text-blue-600">
                            {analysis.progressPercentage.toFixed(1)}%
                        </p>
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-600">Tiến độ dự kiến</p>
                        <p className="text-2xl font-bold text-green-600">
                            {analysis.expectedProgressPercentage.toFixed(1)}%
                        </p>
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                        <span>Tiến độ thực tế</span>
                        <span>Tiến độ dự kiến</span>
                    </div>
                    <div className="relative">
                        <div className="w-full bg-gray-200 rounded-full h-3">
                            <div
                                className="bg-blue-500 h-3 rounded-full transition-all duration-300"
                                style={{ width: `${Math.min(analysis.progressPercentage, 100)}%` }}
                            />
                        </div>
                        <div
                            className="absolute top-0 h-3 bg-green-500 rounded-l-full opacity-60"
                            style={{ width: `${Math.min(analysis.expectedProgressPercentage, 100)}%` }}
                        />
                    </div>
                </div>

                {/* Deviation Summary */}
                <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium mb-3">Tóm tắt sai lệch</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                            <span className="text-gray-600">Sai lệch tiến độ:</span>
                            <span className={`ml-2 font-semibold ${analysis.deviationPercentage >= 0 ? 'text-green-600' : 'text-red-600'
                                }`}>
                                {formatDeviationPercentage(analysis.deviationPercentage)}
                            </span>
                        </div>
                        <div>
                            <span className="text-gray-600">Sai lệch sản lượng:</span>
                            <span className={`ml-2 font-semibold ${analysis.yieldDeviationPercentage >= 0 ? 'text-green-600' : 'text-red-600'
                                }`}>
                                {formatDeviationPercentage(analysis.yieldDeviationPercentage)}
                            </span>
                        </div>
                        <div>
                            <span className="text-gray-600">Giai đoạn hoàn thành:</span>
                            <span className="ml-2 font-semibold">
                                {analysis.completedStages}/{analysis.expectedTotalStages}
                            </span>
                        </div>
                        <div>
                            <span className="text-gray-600">Giai đoạn hiện tại:</span>
                            <span className="ml-2 font-semibold">
                                {analysis.currentStageName}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Stage Deviations */}
                {showDetails && analysis.stageDeviations.length > 0 && (
                    <div className="space-y-3">
                        <h4 className="font-medium">Sai lệch theo giai đoạn</h4>
                        <div className="space-y-2">
                            {analysis.stageDeviations.map((stage) => (
                                <div key={stage.stageId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <Badge className={getDeviationStatusColor(stage.deviationStatus)}>
                                            {getDeviationStatusIcon(stage.deviationStatus)}
                                        </Badge>
                                        <span className="font-medium">{stage.stageName}</span>
                                    </div>
                                    <div className="text-right text-sm">
                                        {stage.daysAhead > 0 && (
                                            <span className="text-green-600">+{stage.daysAhead} ngày</span>
                                        )}
                                        {stage.daysBehind > 0 && (
                                            <span className="text-red-600">-{stage.daysBehind} ngày</span>
                                        )}
                                        {stage.daysAhead === 0 && stage.daysBehind === 0 && (
                                            <span className="text-green-600">Đúng hạn</span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Recommendations */}
                {showDetails && analysis.recommendations.length > 0 && (
                    <div className="space-y-3">
                        <h4 className="font-medium">Khuyến nghị cải thiện</h4>
                        <div className="space-y-2">
                            {analysis.recommendations.map((rec, index) => (
                                <div key={index} className="p-3 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                                    <div className="flex items-start justify-between mb-2">
                                        <h5 className="font-medium text-blue-900">{rec.title}</h5>
                                        <Badge className={getDeviationLevelColor(rec.priority)}>
                                            {rec.priority}
                                        </Badge>
                                    </div>
                                    <p className="text-sm text-blue-800 mb-2">{rec.description}</p>
                                    {rec.actions.length > 0 && (
                                        <div className="space-y-1">
                                            <p className="text-xs font-medium text-blue-700">Hành động đề xuất:</p>
                                            <ul className="text-xs text-blue-700 space-y-1">
                                                {rec.actions.map((action, actionIndex) => (
                                                    <li key={actionIndex} className="flex items-center gap-2">
                                                        <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                                                        {action}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Timestamps */}
                <div className="text-xs text-gray-500 text-center pt-2 border-t">
                    Phân tích lúc: {new Date(analysis.analysisDate).toLocaleString('vi-VN')}
                </div>
            </CardContent>
        </Card>
    );
}
