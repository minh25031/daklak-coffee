"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Home } from "lucide-react";

export default function RegisterPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        username: "",
        email: "",
        password: "",
        confirmPassword: "",
        fullName: "",
        phoneNumber: "",
        address: "",
        role: "farmer", // Default role
    });

    const [errors, setErrors] = useState<Record<string, string>>({});

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.username) {
            newErrors.username = "Vui lòng nhập tên đăng nhập";
        }

        if (!formData.email) {
            newErrors.email = "Vui lòng nhập email";
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = "Email không hợp lệ";
        }

        if (!formData.password) {
            newErrors.password = "Vui lòng nhập mật khẩu";
        } else if (formData.password.length < 6) {
            newErrors.password = "Mật khẩu phải có ít nhất 6 ký tự";
        }

        if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = "Mật khẩu xác nhận không khớp";
        }

        if (!formData.fullName) {
            newErrors.fullName = "Vui lòng nhập họ tên";
        }

        if (!formData.phoneNumber) {
            newErrors.phoneNumber = "Vui lòng nhập số điện thoại";
        } else if (!/^[0-9]{10}$/.test(formData.phoneNumber)) {
            newErrors.phoneNumber = "Số điện thoại không hợp lệ";
        }

        if (!formData.address) {
            newErrors.address = "Vui lòng nhập địa chỉ";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        try {
            // TODO: Implement actual registration API call
            console.log("Registration data:", formData);

            // Mock successful registration
            alert("Đăng ký thành công! Vui lòng đăng nhập.");
            router.push("/auth/login");
        } catch (err: any) {
            alert("Đăng ký thất bại: " + err.message);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    return (
        <div className="relative flex h-screen w-full bg-muted">
            <Link
                href="/"
                className="hidden md:flex basis-2/3 bg-cover bg-center"
                style={{ backgroundImage: "url('/logo.jpg')", borderRadius: 20 }}
            >
                <span className="sr-only">Về trang chủ</span>
            </Link>

            <div className="basis-full md:basis-1/3 flex items-center justify-center px-6 bg-white">
                <Card className="w-full max-w-md shadow-lg relative overflow-visible">
                    <Link
                        href="/"
                        className="absolute -top-5 -right-5 bg-white border border-gray-300 shadow-lg rounded-full p-3 hover:bg-amber-100 transition z-20"
                    >
                        <Home className="w-6 h-6 text-amber-900" />
                    </Link>

                    <CardHeader>
                        <CardTitle className="text-2xl text-center">Đăng ký tài khoản</CardTitle>
                        <p className="text-sm text-muted-foreground text-center mt-1">
                            Tham gia nền tảng chuỗi cung ứng cà phê Đắk Lắk
                        </p>
                    </CardHeader>

                    <CardContent>
                        <form className="space-y-4" onSubmit={handleSubmit}>
                            <div className="space-y-2">
                                <Label htmlFor="role" className="text-sm">
                                    Vai trò
                                </Label>
                                <select
                                    id="role"
                                    name="role"
                                    value={formData.role}
                                    onChange={handleChange}
                                    className="w-full border rounded-md px-3 py-2 text-sm"
                                >
                                    <option value="farmer">Nông dân</option>
                                    <option value="business">Doanh nghiệp</option>
                                </select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="username" className="text-sm">
                                    Tên đăng nhập
                                </Label>
                                <Input
                                    id="username"
                                    name="username"
                                    value={formData.username}
                                    onChange={handleChange}
                                    className="text-sm"
                                />
                                {errors.username && (
                                    <p className="text-red-500 text-xs">{errors.username}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="email" className="text-sm">
                                    Email
                                </Label>
                                <Input
                                    id="email"
                                    name="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="text-sm"
                                />
                                {errors.email && (
                                    <p className="text-red-500 text-xs">{errors.email}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="password" className="text-sm">
                                    Mật khẩu
                                </Label>
                                <Input
                                    id="password"
                                    name="password"
                                    type="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    className="text-sm"
                                />
                                {errors.password && (
                                    <p className="text-red-500 text-xs">{errors.password}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="confirmPassword" className="text-sm">
                                    Xác nhận mật khẩu
                                </Label>
                                <Input
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    type="password"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    className="text-sm"
                                />
                                {errors.confirmPassword && (
                                    <p className="text-red-500 text-xs">{errors.confirmPassword}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="fullName" className="text-sm">
                                    Họ và tên
                                </Label>
                                <Input
                                    id="fullName"
                                    name="fullName"
                                    value={formData.fullName}
                                    onChange={handleChange}
                                    className="text-sm"
                                />
                                {errors.fullName && (
                                    <p className="text-red-500 text-xs">{errors.fullName}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="phoneNumber" className="text-sm">
                                    Số điện thoại
                                </Label>
                                <Input
                                    id="phoneNumber"
                                    name="phoneNumber"
                                    value={formData.phoneNumber}
                                    onChange={handleChange}
                                    className="text-sm"
                                />
                                {errors.phoneNumber && (
                                    <p className="text-red-500 text-xs">{errors.phoneNumber}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="address" className="text-sm">
                                    Địa chỉ
                                </Label>
                                <Input
                                    id="address"
                                    name="address"
                                    value={formData.address}
                                    onChange={handleChange}
                                    className="text-sm"
                                />
                                {errors.address && (
                                    <p className="text-red-500 text-xs">{errors.address}</p>
                                )}
                            </div>

                            <Button
                                type="submit"
                                className="w-full bg-amber-900 hover:bg-amber-800"
                            >
                                Đăng ký
                            </Button>

                            <div className="text-sm text-center">
                                <span className="text-gray-600">Đã có tài khoản? </span>
                                <Link
                                    href="/auth/login"
                                    className="text-amber-900 font-semibold hover:underline"
                                >
                                    Đăng nhập
                                </Link>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
