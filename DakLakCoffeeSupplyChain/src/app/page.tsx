"use client";

import Link from "next/link";

import { useEffect, useState } from "react";
import { Button } from "@/lib/components/ui/button";
import { Card, CardContent } from "@/lib/components/ui/card";

export default function HomePage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState("");
  useEffect(() => {
    const user = localStorage.getItem("username");
    if (user) {
      setIsLoggedIn(true);
      setUsername(user);
    }
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          {/* Logo + Tên */}
          <div className="flex items-center gap-3">
            <Link href="/">
              <img
                src="/logo.jpg"
                alt="DakLak SupplyChain Logo"
                className="h-10 w-auto"
              />
            </Link>
            <h1 className="text-2xl font-bold text-primary">
              DakLak SupplyChain
            </h1>
          </div>
          <nav className="space-x-4">
            {isLoggedIn ? (
              <div className="flex items-center gap-4 text-sm text-gray-700">
                👋 Xin chào, <b>{username}</b>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    localStorage.clear(); // hoặc chỉ removeItem từng phần nếu muốn
                    window.location.reload(); // reload để cập nhật giao diện
                  }}
                >
                  Đăng xuất
                </Button>
              </div>
            ) : (
              <>
                <Link href="/auth/login" className="text-sm hover:underline">
                  Đăng nhập
                </Link>
                <Link href="/auth/register" className="text-sm hover:underline">
                  Đăng ký
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-gradient-to-r from-amber-50 to-orange-100 py-20 px-4 text-center">
        <h2 className="text-4xl font-bold mb-4 leading-tight">
          Kết nối Nông dân – Doanh nghiệp – Thị trường
        </h2>
        <p className="max-w-2xl mx-auto text-lg text-gray-700 mb-6">
          Nền tảng B2B chuyên biệt cho chuỗi cung ứng cà phê: từ canh tác, sơ
          chế đến phân phối minh bạch.
        </p>
        {!isLoggedIn && (
          <Button asChild>
            <Link href="/auth/register">Đăng ký tài khoản</Link>
          </Button>
        )}
      </section>

      {/* Features */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              title: "🌱 Nông dân",
              desc: "Ghi nhận mùa vụ, cập nhật sơ chế, và nhận tư vấn kỹ thuật từ chuyên gia.",
            },
            {
              title: "🏢 Doanh nghiệp",
              desc: "Quản lý kế hoạch thu mua, tồn kho, hợp đồng và chất lượng.",
            },
            {
              title: "📦 Thị trường",
              desc: "Xây dựng chuỗi tiêu thụ bền vững với dữ liệu minh bạch và truy xuất nguồn gốc.",
            },
          ].map((item, idx) => (
            <Card
              key={idx}
              className="shadow-md hover:shadow-lg transition-shadow"
            >
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold mb-3 text-orange-800">
                  {item.title}
                </h3>
                <p className="text-gray-700">{item.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA */}
      {!isLoggedIn && (
        <section className="bg-orange-50 py-20 px-4 text-center">
          <h2 className="text-2xl font-bold mb-4 text-orange-900">
            Tham gia hệ sinh thái nông nghiệp số ngay hôm nay
          </h2>
          <Button asChild>
            <Link href="/auth/register">Đăng ký tài khoản</Link>
          </Button>
        </section>
      )}

      {/* Footer */}
      <footer className="bg-gray-100 py-6 text-center text-sm text-gray-600">
        © 2025 DakLak SupplyChain Platform. All rights reserved.
      </footer>
    </div>
  );
}
