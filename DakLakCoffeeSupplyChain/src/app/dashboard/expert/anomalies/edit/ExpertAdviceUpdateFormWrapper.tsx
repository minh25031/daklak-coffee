"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ExpertAdviceUpdateFormWrapperProps {
    searchParams: Record<string, string | string[] | undefined>;
}

interface FormData {
    responseType: string;
    adviceSource: string;
    adviceText: string;
    attachedFileUrl?: string;
}

export default function ExpertAdviceUpdateFormWrapper({ searchParams }: ExpertAdviceUpdateFormWrapperProps) {
    const router = useRouter();
    const params = useParams();
    const adviceId = params.id as string;

    const [form, setForm] = useState<FormData>({
        responseType: "",
        adviceSource: "",
        adviceText: "",
        attachedFileUrl: ""
    });
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);

    // Fetch initial data when component mounts
    useEffect(() => {
        const fetchAdviceData = async () => {
            try {
                setInitialLoading(true);
                // Fetch advice data from API
                const response = await fetch(`/api/ExpertAdvices/${adviceId}`, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                });

                if (response.ok) {
                    const data = await response.json();
                    setForm({
                        responseType: data.responseType || "",
                        adviceSource: data.adviceSource || "",
                        adviceText: data.adviceText || "",
                        attachedFileUrl: data.attachedFileUrl || ""
                    });
                }
            } catch (error) {
                console.error("Failed to fetch advice data:", error);
            } finally {
                setInitialLoading(false);
            }
        };

        if (adviceId) {
            fetchAdviceData();
        }
    }, [adviceId]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/ExpertAdvices/${adviceId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
                body: JSON.stringify(form),
            });

            if (res.ok) {
                alert("Cập nhật thành công!");
                router.push("/dashboard/expert/anomalies"); // quay lại danh sách
            } else {
                const err = await res.json();
                alert(err.message || "Cập nhật thất bại");
            }
        } catch (err) {
            console.error(err);
            alert("Lỗi hệ thống");
        } finally {
            setLoading(false);
        }
    };

    if (initialLoading) {
        return (
            <div className="flex min-h-screen bg-gray-50 p-6 items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Đang tải dữ liệu...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-2xl mx-auto">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-xl font-semibold text-gray-900">
                            Chỉnh sửa phản hồi tư vấn
                        </CardTitle>
                        <p className="text-sm text-gray-600">
                            Cập nhật thông tin phản hồi cho vấn đề bất thường
                        </p>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">
                                Loại phản hồi
                            </label>
                            <Input
                                name="responseType"
                                value={form.responseType}
                                onChange={handleChange}
                                placeholder="Loại phản hồi"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">
                                Nguồn tư vấn
                            </label>
                            <Input
                                name="adviceSource"
                                value={form.adviceSource}
                                onChange={handleChange}
                                placeholder="Nguồn tư vấn"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">
                                Nội dung tư vấn
                            </label>
                            <Textarea
                                name="adviceText"
                                value={form.adviceText}
                                onChange={handleChange}
                                placeholder="Nội dung tư vấn"
                                rows={6}
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">
                                URL file đính kèm
                            </label>
                            <Input
                                name="attachedFileUrl"
                                value={form.attachedFileUrl || ""}
                                onChange={handleChange}
                                placeholder="URL file đính kèm (tùy chọn)"
                            />
                        </div>

                        <div className="flex gap-3 pt-4">
                            <Button
                                onClick={handleSubmit}
                                disabled={loading}
                                className="flex-1"
                            >
                                {loading ? "Đang cập nhật..." : "Cập nhật"}
                            </Button>
                            <Button
                                variant="outline"
                                onClick={() => router.back()}
                                className="flex-1"
                            >
                                Hủy
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
