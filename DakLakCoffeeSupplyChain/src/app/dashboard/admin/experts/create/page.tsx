"use client";

import { useState } from "react";
import { ArrowLeft, Save, UserPlus } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { createExpert } from "@/lib/api/agriculturalExpert";
import { useAuthGuard } from "@/lib/auth/useAuthGuard";

export default function CreateExpertPage() {
    // Kiểm tra quyền admin
    useAuthGuard(["admin"]);

    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        fullName: "",
        email: "",
        phoneNumber: "",
        expertiseArea: "",
        qualifications: "",
        yearsOfExperience: "",
        affiliatedOrganization: "",
        bio: "",
        rating: "",
    });

    const expertiseAreas = [
        "Trồng trọt cà phê",
        "Bảo vệ thực vật",
        "Chế biến cà phê",
        "Quản lý chất lượng",
        "Kinh tế nông nghiệp",
        "Công nghệ sinh học",
        "Thổ nhưỡng và dinh dưỡng cây trồng",
        "Khác",
    ];

    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Validate required fields
            if (!formData.fullName || !formData.email || !formData.expertiseArea) {
                toast.error("Vui lòng điền đầy đủ thông tin bắt buộc!");
                return;
            }

            // TODO: Cần có userId thực tế từ context hoặc localStorage
            const userId = "temp-user-id"; // Thay thế bằng userId thực tế

            const expertData = {
                expertiseArea: formData.expertiseArea,
                qualifications: formData.qualifications,
                yearsOfExperience: formData.yearsOfExperience ? parseInt(formData.yearsOfExperience) : undefined,
                affiliatedOrganization: formData.affiliatedOrganization,
                bio: formData.bio || undefined,
                rating: formData.rating ? parseFloat(formData.rating) : undefined,
            };

            await createExpert(expertData, userId);
            toast.success("Tạo chuyên gia thành công!");
            router.push("/dashboard/admin/experts");
        } catch (error) {
            console.error("Lỗi khi tạo chuyên gia:", error);
            toast.error("Có lỗi xảy ra khi tạo chuyên gia!");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Button
                    variant="outline"
                    onClick={() => router.back()}
                    className="flex items-center gap-2"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Quay lại
                </Button>
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Thêm chuyên gia mới</h1>
                    <p className="text-gray-600 mt-2">Tạo tài khoản chuyên gia nông nghiệp mới</p>
                </div>
            </div>

            <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Thông tin cá nhân */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <UserPlus className="w-5 h-5" />
                                Thông tin cá nhân
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <Label htmlFor="fullName">Họ và tên *</Label>
                                <Input
                                    id="fullName"
                                    value={formData.fullName}
                                    onChange={(e) => handleInputChange("fullName", e.target.value)}
                                    placeholder="Nhập họ và tên đầy đủ"
                                    required
                                />
                            </div>

                            <div>
                                <Label htmlFor="email">Email *</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => handleInputChange("email", e.target.value)}
                                    placeholder="example@email.com"
                                    required
                                />
                            </div>

                            <div>
                                <Label htmlFor="phoneNumber">Số điện thoại</Label>
                                <Input
                                    id="phoneNumber"
                                    value={formData.phoneNumber}
                                    onChange={(e) => handleInputChange("phoneNumber", e.target.value)}
                                    placeholder="0123456789"
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Thông tin chuyên môn */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Thông tin chuyên môn</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <Label htmlFor="expertiseArea">Lĩnh vực chuyên môn *</Label>
                                <Select
                                    value={formData.expertiseArea}
                                    onValueChange={(value) => handleInputChange("expertiseArea", value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Chọn lĩnh vực chuyên môn" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {expertiseAreas.map((area) => (
                                            <SelectItem key={area} value={area}>
                                                {area}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <Label htmlFor="qualifications">Bằng cấp/Chứng chỉ *</Label>
                                <Input
                                    id="qualifications"
                                    value={formData.qualifications}
                                    onChange={(e) => handleInputChange("qualifications", e.target.value)}
                                    placeholder="Ví dụ: Thạc sĩ Nông nghiệp, Chứng chỉ ISO..."
                                    required
                                />
                            </div>

                            <div>
                                <Label htmlFor="yearsOfExperience">Số năm kinh nghiệm</Label>
                                <Input
                                    id="yearsOfExperience"
                                    type="number"
                                    min="0"
                                    max="50"
                                    value={formData.yearsOfExperience}
                                    onChange={(e) => handleInputChange("yearsOfExperience", e.target.value)}
                                    placeholder="Số năm kinh nghiệm"
                                />
                            </div>

                            <div>
                                <Label htmlFor="affiliatedOrganization">Tổ chức liên kết *</Label>
                                <Input
                                    id="affiliatedOrganization"
                                    value={formData.affiliatedOrganization}
                                    onChange={(e) => handleInputChange("affiliatedOrganization", e.target.value)}
                                    placeholder="Tên tổ chức, công ty, viện nghiên cứu..."
                                    required
                                />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Thông tin bổ sung */}
                <Card>
                    <CardHeader>
                        <CardTitle>Thông tin bổ sung</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <Label htmlFor="bio">Tiểu sử</Label>
                            <Textarea
                                id="bio"
                                value={formData.bio}
                                onChange={(e) => handleInputChange("bio", e.target.value)}
                                placeholder="Mô tả ngắn về kinh nghiệm, thành tựu, chuyên môn..."
                                rows={4}
                            />
                        </div>

                        <div>
                            <Label htmlFor="rating">Đánh giá ban đầu</Label>
                            <Select
                                value={formData.rating}
                                onValueChange={(value) => handleInputChange("rating", value)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Chọn mức đánh giá" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="1.0">1.0 - Rất kém</SelectItem>
                                    <SelectItem value="2.0">2.0 - Kém</SelectItem>
                                    <SelectItem value="3.0">3.0 - Trung bình</SelectItem>
                                    <SelectItem value="4.0">4.0 - Khá</SelectItem>
                                    <SelectItem value="5.0">5.0 - Xuất sắc</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </CardContent>
                </Card>

                {/* Actions */}
                <div className="flex justify-end gap-4 pt-6">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => router.back()}
                        disabled={loading}
                    >
                        Hủy
                    </Button>
                    <Button
                        type="submit"
                        disabled={loading}
                        className="bg-orange-600 hover:bg-orange-700"
                    >
                        {loading ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        ) : (
                            <>
                                <Save className="w-4 h-4 mr-2" />
                                Tạo chuyên gia
                            </>
                        )}
                    </Button>
                </div>
            </form>
        </div>
    );
}
