"use client";

import { useState } from "react";
import { Input } from "@/lib/components/ui/input";
import { Label } from "@/lib/components/ui/label";
import { Button } from "@/lib/components/ui/button";
import { mockRegister } from "@/lib/mockAPI/auth";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/lib/components/ui/card";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();
  const [role, setRole] = useState("Farmer");
  const [agree, setAgree] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agree) return alert("Bạn phải đồng ý với điều khoản!");

    const fullName = (document.getElementById("fullName") as HTMLInputElement)
      .value;
    const email = (document.getElementById("email") as HTMLInputElement).value;
    const password = (document.getElementById("password") as HTMLInputElement)
      .value;

    try {
      await mockRegister({ fullName, email, password, role });
      alert("Đăng ký thành công!");
      router.push("/auth/login");
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="flex h-screen w-full bg-muted">
      {/* Logo bên trái */}
      <Link
        href="/"
        className="hidden md:flex basis-2/3 bg-cover bg-center"
        style={{
          backgroundImage: "url('/logo.jpg')",
          borderRadius: 20,
        }}
      >
        {/* Thêm nội dung rỗng để logo vẫn hiển thị full */}
        <span className="sr-only">Về trang chủ</span>
      </Link>

      {/* Form bên phải */}
      <div className="basis-full md:basis-1/3 flex items-center justify-center px-6 bg-white">
        <Card className="w-full max-w-md shadow-lg max-h-[90vh] flex flex-col">
          <CardHeader>
            <CardTitle className="text-2xl text-center">Đăng ký</CardTitle>
          </CardHeader>

          {/* 👉 Nội dung form có thể scroll nếu quá dài */}
          <CardContent className="flex-1 overflow-y-auto pr-1">
            <form className="space-y-4" onSubmit={handleRegister}>
              <div>
                <Label htmlFor="fullName">Họ và tên</Label>
                <Input id="fullName" type="text" required />
              </div>

              <div>
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" required />
              </div>

              <div>
                <Label htmlFor="phone">Số điện thoại</Label>
                <Input id="phone" type="tel" required />
              </div>

              <div>
                <Label htmlFor="dob">Ngày sinh</Label>
                <Input id="dob" type="date" required />
              </div>

              <div>
                <Label htmlFor="gender">Giới tính</Label>
                <select
                  id="gender"
                  className="w-full border rounded px-3 py-2"
                  required
                >
                  <option value="">-- Chọn giới tính --</option>
                  <option value="male">Nam</option>
                  <option value="female">Nữ</option>
                  <option value="other">Khác</option>
                </select>
              </div>

              <div>
                <Label htmlFor="role">Vai trò</Label>
                <select
                  id="role"
                  className="w-full border rounded px-3 py-2"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  required
                >
                  <option value="Farmer">Nông dân</option>
                  <option value="BusinessManager">Doanh nghiệp</option>
                </select>
              </div>

              {/* Nếu là doanh nghiệp thì hiển thị thêm */}
              {role === "BusinessManager" && (
                <>
                  <div>
                    <Label htmlFor="taxId">Mã số thuế</Label>
                    <Input id="taxId" type="text" required />
                  </div>
                  <div>
                    <Label htmlFor="companyEmail">Email công ty</Label>
                    <Input id="companyEmail" type="email" required />
                  </div>
                  <div>
                    <Label htmlFor="cert">Giấy chứng nhận doanh nghiệp</Label>
                    <Input id="cert" type="file" required />
                  </div>
                </>
              )}

              <div>
                <Label htmlFor="cmnd">CMND / CCCD</Label>
                <Input id="cmnd" type="text" required />
              </div>

              <div>
                <Label htmlFor="password">Mật khẩu</Label>
                <Input id="password" type="password" required />
              </div>

              <div>
                <Label htmlFor="confirmPassword">Nhập lại mật khẩu</Label>
                <Input id="confirmPassword" type="password" required />
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="agree"
                  checked={agree}
                  onChange={(e) => setAgree(e.target.checked)}
                  className="h-4 w-4"
                />
                <Label htmlFor="agree" className="text-sm">
                  Tôi đồng ý với điều khoản và chính sách
                </Label>
              </div>

              <Button
                type="submit"
                className="w-full bg-amber-900 hover:bg-amber-800"
              >
                Đăng ký
              </Button>
            </form>

            <div className="mt-6 text-center">
              <span className="text-sm text-gray-600">Đã có tài khoản? </span>
              <Link
                href="/auth/login"
                className="text-amber-900 font-semibold hover:underline"
              >
                Đăng Nhập
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
