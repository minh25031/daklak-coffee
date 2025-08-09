"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import {
    GeneralFarmerReportUpdateDto,
    getFarmerReportById,
    updateFarmerReport,
} from "@/lib/api/generalFarmerReports";
import { SeverityLevelEnum, SeverityLevelLabel } from "@/lib/constants/SeverityLevelEnum";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Loader2, Save, AlertTriangle, FileText, Image, Video } from "lucide-react";

export default function ReportEditPage() {
    const { id } = useParams();
    const router = useRouter();
    const [loading, setLoading] = useState(true);

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        formState: { isSubmitting },
    } = useForm<GeneralFarmerReportUpdateDto>();

    useEffect(() => {
        if (typeof id !== "string") return;

        getFarmerReportById(id)
            .then((data) => {
                if (!data) {
                    toast.error("Không tìm thấy báo cáo.");
                    router.push("/dashboard/farmer/request-feedback");
                    return;
                }

                setValue("reportId", data.reportId);
                setValue("title", data.title);
                setValue("description", data.description);
                setValue("severityLevel", data.severityLevel);
                setValue("imageUrl", data.imageUrl || "");
                setValue("videoUrl", data.videoUrl || "");
            })
            .catch(() => {
                toast.error("Lỗi khi tải dữ liệu báo cáo.");
                router.push("/dashboard/farmer/request-feedback");
            })
            .finally(() => setLoading(false));
    }, [id, router, setValue]);

    const onSubmit = async (values: GeneralFarmerReportUpdateDto) => {
        try {
            await updateFarmerReport(values);
            toast.success("✅ Cập nhật báo cáo thành công");
            router.push(`/dashboard/farmer/request-feedback/${values.reportId}`);
        } catch {
            toast.error("❌ Lỗi khi cập nhật báo cáo.");
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 flex justify-center items-center">
                <div className="text-center">
                    <Loader2 className="animate-spin w-8 h-8 text-orange-500 mx-auto mb-4" />
                    <p className="text-gray-600">Đang tải dữ liệu...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 p-4">
            <div className="max-w-3xl mx-auto py-8">
                {/* Header */}
                <div className="bg-white rounded-lg shadow-sm border border-orange-100 p-6 mb-6">
                    <div className="flex items-center gap-4">
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={() => router.back()}
                        >
                            <ArrowLeft className="w-4 h-4" />
                        </Button>
                        <div className="flex items-center gap-3">
                            <div className="w-1 h-8 bg-gradient-to-b from-orange-500 to-amber-500 rounded-full"></div>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-800">
                                    Chỉnh sửa báo cáo
                                </h1>
                                <p className="text-gray-600 text-sm">
                                    Cập nhật thông tin báo cáo kỹ thuật
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Form */}
                <form onSubmit={handleSubmit(onSubmit)}>
                    <Card className="border-orange-100 shadow-sm">
                        <CardHeader className="pb-4">
                            <CardTitle className="flex items-center gap-2 text-lg text-gray-800">
                                <FileText className="w-5 h-5 text-orange-500" />
                                Thông tin báo cáo
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* Title */}
                            <div className="space-y-2">
                                <Label className="text-sm font-medium text-gray-700">Tiêu đề *</Label>
                                <Input
                                    {...register("title", { required: "Tiêu đề là bắt buộc" })}
                                    placeholder="Nhập tiêu đề báo cáo"
                                />
                            </div>

                            {/* Description */}
                            <div className="space-y-2">
                                <Label className="text-sm font-medium text-gray-700">Mô tả chi tiết *</Label>
                                <Textarea
                                    rows={6}
                                    {...register("description", { required: "Mô tả là bắt buộc" })}
                                    placeholder="Mô tả chi tiết vấn đề..."
                                />
                            </div>

                            {/* Severity Level */}
                            <div className="space-y-2">
                                <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                                    <AlertTriangle className="w-4 h-4 text-orange-500" />
                                    Mức độ nghiêm trọng *
                                </Label>
                                <Select
                                    value={watch("severityLevel")?.toString()}
                                    onValueChange={(val) => setValue("severityLevel", parseInt(val))}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Chọn mức độ" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {Object.values(SeverityLevelEnum)
                                            .filter((val) => typeof val === 'number')
                                            .map((level) => (
                                                <SelectItem key={level} value={level.toString()}>
                                                    {SeverityLevelLabel[level as SeverityLevelEnum]}
                                                </SelectItem>
                                            ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Media Section */}
                            <div className="border-t border-gray-200 pt-6">
                                <h3 className="text-sm font-medium text-gray-700 mb-4">Tài liệu đính kèm (tùy chọn)</h3>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {/* Image URL */}
                                    <div className="space-y-2">
                                        <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                                            <Image className="w-4 h-4 text-blue-500" />
                                            Hình ảnh (URL)
                                        </Label>
                                        <Input
                                            {...register("imageUrl")}
                                            placeholder="https://example.com/image.jpg"
                                        />
                                    </div>

                                    {/* Video URL */}
                                    <div className="space-y-2">
                                        <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                                            <Video className="w-4 h-4 text-purple-500" />
                                            Video (URL)
                                        </Label>
                                        <Input
                                            {...register("videoUrl")}
                                            placeholder="https://example.com/video.mp4"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Submit Buttons */}
                            <div className="flex justify-end pt-6 border-t border-gray-200">
                                <div className="flex gap-3">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => router.back()}
                                        disabled={isSubmitting}
                                    >
                                        Hủy
                                    </Button>
                                    <Button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="min-w-[120px]"
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <Loader2 className="animate-spin mr-2 w-4 h-4" />
                                                Đang cập nhật...
                                            </>
                                        ) : (
                                            <>
                                                <Save className="w-4 h-4 mr-2" />
                                                Lưu thay đổi
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </form>
            </div>
        </div>
    );
}
