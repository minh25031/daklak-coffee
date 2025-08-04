"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

interface Props {
    adviceId: string;
    initialData: {
        responseType: string;
        adviceSource: string;
        adviceText: string;
        attachedFileUrl?: string;
    };
}

export default function ExpertAdviceUpdateForm({ adviceId, initialData }: Props) {
    const router = useRouter();
    const [form, setForm] = useState(initialData);
    const [loading, setLoading] = useState(false);

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
                router.push("/expert-advices"); // quay lại danh sách
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

    return (
        <div className="space-y-4 max-w-xl mx-auto p-4">
            <Input name="responseType" value={form.responseType} onChange={handleChange} placeholder="Loại phản hồi" />
            <Input name="adviceSource" value={form.adviceSource} onChange={handleChange} placeholder="Nguồn tư vấn" />
            <Textarea name="adviceText" value={form.adviceText} onChange={handleChange} placeholder="Nội dung tư vấn" />
            <Input name="attachedFileUrl" value={form.attachedFileUrl || ""} onChange={handleChange} placeholder="URL file đính kèm" />

            <Button onClick={handleSubmit} disabled={loading}>
                {loading ? "Đang cập nhật..." : "Cập nhật"}
            </Button>
        </div>
    );
}
