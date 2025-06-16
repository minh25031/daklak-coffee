"use client";

import "@/styles/globals.css";
import { usePathname } from "next/navigation";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  // ✅ Chỉ hiện header/footer ở trang gốc & marketplace
  const showHeaderFooter =
    pathname === "/" || pathname.startsWith("/marketplace");

  return (
    <html lang="vi">
      <body className="bg-white text-black">
        {showHeaderFooter && <Header />}
        <main className="min-h-screen">{children}</main>
        {showHeaderFooter && <Footer />}
      </body>
    </html>
  );
}
