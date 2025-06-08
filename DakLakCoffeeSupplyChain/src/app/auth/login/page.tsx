"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { mockLogin } from "@/lib/mockAPI/auth";

import { Input } from "@/lib/components/ui/input";
import { Label } from "@/lib/components/ui/label";
import { Button } from "@/lib/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/lib/components/ui/card";
import { FaGoogle } from "react-icons/fa";
import { Home } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { user } = await mockLogin({ email, password });

      // Lưu vào localStorage
      localStorage.setItem("user_role", user.role_id.toString());
      localStorage.setItem("username", user.email);

      // Điều hướng theo vai trò
      router.push(`/dashboard/${user.role.toLowerCase()}`);
    } catch (err: any) {
      alert(err.message);
    }
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
          {/* Biểu tượng Home */}
          <Link 
            href="/" 
            className="absolute -top-5 -right-5 bg-white border border-gray-300 shadow-lg rounded-full p-3 hover:bg-amber-100 transition z-20"
          >
            <Home className="w-6 h-6 text-amber-900" />
          </Link>

          <CardHeader>
            <CardTitle className="text-2xl text-center">Đăng nhập</CardTitle>
            <p className="text-sm text-muted-foreground text-center mt-1">
              Tham gia nền tảng chuỗi cung ứng cà phê Đắk Lắk.
            </p>
          </CardHeader>

          <CardContent>
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="text-sm"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm">Mật khẩu</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="text-sm"
                />
              </div>
              <Button
                type="submit"
                className="w-full bg-amber-900 hover:bg-amber-800"
              >
                Đăng nhập
              </Button>
              <div className="text-sm text-right">
                <Link
                  href="/auth/forgot_password"
                  className="text-[#4B2E19] font-medium hover:underline hover:text-[#6F4E37] transition-colors duration-200"
                >
                  Quên mật khẩu?
                </Link>
              </div>
            </form>

            {/* Dòng phân cách OR */}
            <div className="flex items-center justify-center my-4">
              <div className="border-t border-gray-300 w-full" />
              <span className="mx-3 text-sm text-gray-400">hoặc</span>
              <div className="border-t border-gray-300 w-full" />
            </div>

            <div>
              <div>
                <Button
                  variant="outline"
                  className="w-full flex items-center justify-center gap-2"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 48 48"
                  >
                    <path
                      fill="#4285F4"
                      d="M24 9.5c3.15 0 5.99 1.08 8.22 2.86l6.12-6.12C34.41 3.07 29.5 1 24 1 14.95 1 7.09 6.88 3.87 14.36l7.2 5.6C12.83 13.2 17.95 9.5 24 9.5z"
                    />
                    <path
                      fill="#34A853"
                      d="M46.1 24.5c0-1.64-.15-3.22-.43-4.74H24v9h12.5c-.54 2.84-2.2 5.24-4.67 6.9l7.26 5.66c4.23-3.9 6.63-9.65 6.63-16.82z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M11.07 28.75c-.54-1.6-.84-3.3-.84-5.25s.3-3.65.84-5.25l-7.2-5.6C2.66 16.7 1.5 20.23 1.5 24s1.16 7.3 3.37 10.35l7.2-5.6z"
                    />
                    <path
                      fill="#EA4335"
                      d="M24 46.5c5.5 0 10.41-1.87 14.25-5.1l-7.26-5.66c-2 1.33-4.58 2.1-6.99 2.1-6.05 0-11.17-3.7-13-8.95l-7.2 5.6C7.09 41.12 14.95 46.5 24 46.5z"
                    />
                  </svg>
                  Đăng nhập với Google
                </Button>
              </div>
            </div>

            <div className="mt-6 text-center">
              <span className="text-sm text-gray-600">Chưa có tài khoản? </span>
              <Link
                href="/auth/register"
                className="text-amber-900 font-semibold hover:underline"
              >
                Đăng ký
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
