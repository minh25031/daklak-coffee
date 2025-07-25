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

  const showHeaderFooter =
    pathname === "/" || pathname.startsWith("/marketplace");

  return (
    <html lang="vi">
      <head>
        <script src="https://cdn.lordicon.com/lordicon.js"></script>
      </head>
      <body className="bg-white text-black">
        {showHeaderFooter && <Header />}
        <main className="min-h-screen">{children}</main>
        {showHeaderFooter && <Footer />}
      </body>
    </html>
  );
}
