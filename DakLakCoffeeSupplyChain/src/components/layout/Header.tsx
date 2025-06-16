"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { User } from "lucide-react";
import { useRouter } from "next/navigation";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";

export default function Header() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState("");
  const router = useRouter();

  useEffect(() => {
    const user = localStorage.getItem("username");
    if (user) {
      setIsLoggedIn(true);
      setUsername(user);
    }
  }, []);

  return (
    <header className="bg-white shadow sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 flex justify-between items-center">
        {/* Logo + Tên */}
        <div className="flex items-center gap-3">
          <Link href="/">
            <img src="/logo_bg.png" alt="Logo" className="h-10 w-auto" />
          </Link>
          <h1 className="text-xl md:text-2xl font-bold text-orange-700">
            DakLak SupplyChain
          </h1>
        </div>

        {/* Điều hướng */}
        <nav className="flex items-center gap-4 text-sm text-gray-700">
          <Link href="/" className="hover:text-orange-600 transition">
            Trang chủ
          </Link>
          <Link
            href="/marketplace"
            className="hover:text-orange-600 transition"
          >
            Marketplace
          </Link>

          {isLoggedIn ? (
            <DropdownMenu.Root>
              <DropdownMenu.Trigger asChild>
                <button className="flex items-center gap-2 hover:text-orange-700 transition">
                  <User className="w-5 h-5" />
                  <span className="font-semibold">{username}</span>
                </button>
              </DropdownMenu.Trigger>

              <DropdownMenu.Portal>
                <DropdownMenu.Content
                  className="min-w-[180px] bg-white rounded-md shadow-lg p-1 border text-sm z-[100]"
                  sideOffset={8}
                >
                  <DropdownMenu.Item
                    className="px-3 py-2 hover:bg-gray-100 rounded cursor-pointer"
                    onClick={() => router.push("/profile")}
                  >
                    Hồ sơ cá nhân
                  </DropdownMenu.Item>
                  <DropdownMenu.Separator className="h-px bg-gray-200 my-1" />

                  <DropdownMenu.Item
                    className="px-3 py-2 text-red-600 hover:bg-red-50 rounded cursor-pointer"
                    onClick={() => {
                      localStorage.clear();
                      router.push("/auth/login");
                    }}
                  >
                    Đăng xuất
                  </DropdownMenu.Item>
                </DropdownMenu.Content>
              </DropdownMenu.Portal>
            </DropdownMenu.Root>
          ) : (
            <>
              <Link
                href="/auth/login"
                className="hover:text-orange-600 transition"
              >
                Đăng nhập
              </Link>
              <Link
                href="/auth/register"
                className="hover:text-orange-600 transition"
              >
                Đăng ký
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
