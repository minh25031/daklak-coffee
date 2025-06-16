"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Sprout,
  Building2,
  PackageCheck,
  SearchCheck,
  Handshake,
  BarChart2,
} from "lucide-react";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-white text-gray-800">
      {/* Hero */}
      <section className="bg-orange-50 py-20 px-4 text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-orange-800 mb-4">
          Kết nối Nông dân – Doanh nghiệp – Thị trường
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-6">
          Nền tảng B2B giúp số hóa chuỗi cung ứng cà phê Việt Nam, truy xuất
          nguồn gốc, nâng cao chất lượng và tăng giá trị.
        </p>
        <div className="flex justify-center gap-4 flex-wrap">
          <Link href="/marketplace">
            <Button className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-2 rounded-md">
              🌿 Khám phá Marketplace
            </Button>
          </Link>
          <Link href="/auth/login">
            <Button variant="outline" className="px-6 py-2 rounded-md">
              Đăng nhập
            </Button>
          </Link>
        </div>
        {/* Hình minh họa */}
        <img
          src="/illustration_coffee.svg"
          alt="Coffee Illustration"
          className="w-72 mx-auto mt-10"
        />
      </section>

      {/* Vai trò */}
      <section className="py-16 px-4 max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
        <RoleCard
          title="Nông dân"
          color="text-green-700"
          icon={<Sprout className="w-5 h-5 text-green-600" />}
          description="Ghi nhận mùa vụ, cập nhật quá trình trồng trọt và sơ chế. Nhận tư vấn từ chuyên gia."
        />
        <RoleCard
          title="Doanh nghiệp"
          color="text-blue-700"
          icon={<Building2 className="w-5 h-5 text-blue-600" />}
          description="Quản lý kế hoạch thu mua, hợp đồng, tồn kho và đánh giá chất lượng lô hàng."
        />
        <RoleCard
          title="Thị trường"
          color="text-yellow-800"
          icon={<PackageCheck className="w-5 h-5 text-yellow-700" />}
          description="Truy xuất nguồn gốc lô hàng, phản hồi chất lượng và phân phối B2B minh bạch."
        />
      </section>

      {/* Tại sao chọn chúng tôi */}
      <section className="bg-white py-20 px-4 text-center">
        <h2 className="text-2xl font-bold mb-6 text-orange-700">
          Tại sao chọn DakLak SupplyChain?
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          <BenefitCard
            title="📦 Truy xuất minh bạch"
            desc="Giúp thị trường biết chính xác nguồn gốc, chất lượng, và lịch sử lô hàng."
            icon={<SearchCheck className="text-orange-600 w-6 h-6" />}
          />
          <BenefitCard
            title="🤝 Kết nối bền vững"
            desc="Tăng độ tin cậy giữa nông dân và doanh nghiệp bằng hệ thống minh bạch."
            icon={<Handshake className="text-orange-600 w-6 h-6" />}
          />
          <BenefitCard
            title="📈 Quản lý hiệu quả"
            desc="Tiết kiệm chi phí vận hành, giám sát mùa vụ, hợp đồng và kho hàng."
            icon={<BarChart2 className="text-orange-600 w-6 h-6" />}
          />
        </div>
      </section>

      {/* Video (tuỳ chọn) */}
      <section className="py-16 px-4 max-w-4xl mx-auto text-center">
        <h2 className="text-2xl font-bold text-orange-700 mb-4">🎬 Giới thiệu hệ thống</h2>
        <p className="text-gray-600 mb-6">Xem video để hiểu cách nền tảng giúp cải thiện chuỗi cung ứng.</p>
        <div className="aspect-video shadow rounded-lg overflow-hidden">
          <iframe
            className="w-full h-full"
            src="https://www.youtube.com/embed/YOUTUBE_VIDEO_ID"
            title="DakLak SupplyChain Intro"
            allowFullScreen
          />
        </div>
      </section>
    </main>
  );
}

function RoleCard({
  title,
  color,
  icon,
  description,
}: {
  title: string;
  color: string;
  icon: React.ReactNode;
  description: string;
}) {
  return (
    <div className="border rounded-xl p-6 shadow hover:shadow-lg transition-all bg-white">
      <div className="flex items-center gap-2 mb-2">
        {icon}
        <h3 className={`text-xl font-semibold ${color}`}>{title}</h3>
      </div>
      <p className="text-gray-600 text-sm">{description}</p>
    </div>
  );
}

function BenefitCard({
  title,
  desc,
  icon,
}: {
  title: string;
  desc: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="p-6 bg-orange-50 rounded-xl shadow hover:shadow-md transition-all text-left">
      <div className="flex items-center gap-2 mb-2">
        {icon}
        <h3 className="text-lg font-semibold text-orange-700">{title}</h3>
      </div>
      <p className="text-gray-600 text-sm">{desc}</p>
    </div>
  );
}
