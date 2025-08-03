"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import {
    GeneralFarmerReportUpdateDto,
    GeneralFarmerReportViewDetailsDto,
    getFarmerReportById,
    updateFarmerReport,
} from "@/lib/api/generalFarmerReports";
import { SeverityLevelEnum, SeverityLevelLabel } from "@/lib/constants/SeverityLevelEnum";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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
    }, [id]);

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
            <div className="flex justify-center items-center py-20">
                <Loader2 className="animate-spin w-6 h-6 text-gray-500" />
            </div>
        );
    }

    return (
        <form
            onSubmit={handleSubmit(onSubmit)}
            className="max-w-2xl mx-auto bg-white rounded-lg border p-6 space-y-6"
        >
            <h1 className="text-xl font-bold text-emerald-700">Cập nhật báo cáo sự cố</h1>

            <div>
                <Label>Tiêu đề</Label>
                <Input {...register("title", { required: true })} />
            </div>

            <div>
                <Label>Mô tả</Label>
                <Textarea rows={5} {...register("description", { required: true })} />
            </div>

            <div>
                <Label>Mức độ nghiêm trọng</Label>
                <Select
                    value={watch("severityLevel")?.toString()}
                    onValueChange={(val) => setValue("severityLevel", parseInt(val))}
                >
                    <SelectTrigger>
                        <SelectValue placeholder="Chọn mức độ" />
                    </SelectTrigger>
                    <SelectContent>
                        {Object.values(SeverityLevelEnum).map((level) => (
                            <SelectItem key={level} value={level.toString()}>
                                {SeverityLevelLabel[level as SeverityLevelEnum]}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <div>
                <Label>Hình ảnh (URL)</Label>
                <Input {...register("imageUrl")} />
            </div>

            <div>
                <Label>Video (URL)</Label>
                <Input {...register("videoUrl")} />
            </div>

            <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                    <>
                        <Loader2 className="animate-spin mr-2 size-4" /> Đang cập nhật...
                    </>
                ) : (
                    "Lưu thay đổi"
                )}
            </Button>
        </form>
    );
}
