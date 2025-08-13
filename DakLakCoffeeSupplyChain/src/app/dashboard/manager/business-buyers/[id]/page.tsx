"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  getBusinessBuyerById,
  BusinessBuyerViewDetailsDto,
} from "@/lib/api/businessBuyers";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { FiCalendar } from "react-icons/fi";
import {
  Building2,
  User,
  Mail,
  Phone,
  Globe,
  MapPin,
  BadgeInfo,
  CalendarDays,
  Pencil,
  BadgePercent,
  Hash,
} from "lucide-react";

function formatDate(dateStr?: string) {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(d);
}

export default function BusinessBuyerDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const [buyer, setBuyer] = useState<BusinessBuyerViewDetailsDto | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        const data = await getBusinessBuyerById(id as string);
        setBuyer(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  if (loading) return <div className="p-6">Đang tải dữ liệu...</div>;
  if (!buyer)
    return <div className="p-6 text-red-500">Không tìm thấy khách hàng.</div>;

  return (
    <div className="w-full min-h-screen bg-orange-50 px-4 py-6 lg:px-20 flex justify-center">
      <div className="w-full max-w-6xl space-y-6">
        {/* Hero */}
        <div className="bg-gradient-to-r from-orange-50 to-amber-100 border border-amber-200 rounded-2xl p-5 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-orange-500/10 text-orange-600 flex items-center justify-center border border-orange-200">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-semibold text-gray-800">
                  {buyer.companyName}
                </h1>
              </div>
              <div className="text-xs text-gray-500 mt-1 flex items-center gap-4">
                <span className="inline-flex items-center gap-1">
                  <CalendarDays className="w-3 h-3" />
                  Tạo: {formatDate(buyer.createdAt)}
                </span>
                <span className="inline-flex items-center gap-1">
                  Cập nhật: {formatDate(buyer.updatedAt)}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {buyer.website && (
              <Button
                variant="outline"
                onClick={() =>
                  window.open(
                    buyer.website.startsWith("http")
                      ? buyer.website
                      : `https://${buyer.website}`,
                    "_blank"
                  )
                }
              >
                Mở website
              </Button>
            )}
            <Button
              className="bg-[#f59e0b] hover:bg-[#d97706] text-white font-medium px-4 py-2 rounded-lg shadow-md flex items-center gap-2"
              onClick={() =>
                router.push(
                  `/dashboard/manager/business-buyers/${buyer.buyerId}/edit`
                )
              }
            >
              <Pencil className="w-4 h-4" /> Chỉnh sửa
            </Button>
          </div>
        </div>

        {/* Buyer Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Thông tin doanh nghiệp</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-3 text-sm">
              <InfoRow
                icon={<Hash className="w-4 h-4" />}
                label="Mã khách hàng"
                value={buyer.buyerCode}
              />
              <InfoRow
                icon={<Building2 className="w-4 h-4" />}
                label="Tên công ty"
                value={buyer.companyName}
              />
              <InfoRow
                icon={<User className="w-4 h-4" />}
                label="Người liên hệ"
                value={buyer.contactPerson}
              />
              <InfoRow
                icon={<BadgeInfo className="w-4 h-4" />}
                label="Chức vụ"
                value={buyer.position}
              />
              <InfoRow
                icon={<MapPin className="w-4 h-4" />}
                label="Địa chỉ"
                value={buyer.companyAddress}
                multiline
              />
              <InfoRow
                icon={<BadgePercent className="w-4 h-4" />}
                label="Mã số thuế"
                value={buyer.taxId || "—"}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Thông tin liên hệ</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-3 text-sm">
              <InfoRow
                icon={<Mail className="w-4 h-4" />}
                label="Email"
                value={buyer.email || "—"}
                actionLabel={buyer.email ? "Gửi email" : undefined}
                onAction={() =>
                  buyer.email &&
                  (window.location.href = `mailto:${buyer.email}`)
                }
              />
              <InfoRow
                icon={<Phone className="w-4 h-4" />}
                label="Điện thoại"
                value={buyer.phone || "—"}
                actionLabel={buyer.phone ? "Gọi" : undefined}
                onAction={() =>
                  buyer.phone && (window.location.href = `tel:${buyer.phone}`)
                }
              />
              <InfoRow
                icon={<Globe className="w-4 h-4" />}
                label="Website"
                value={buyer.website || "—"}
                actionLabel={buyer.website ? "Mở" : undefined}
                onAction={() =>
                  buyer.website &&
                  window.open(
                    buyer.website.startsWith("http")
                      ? buyer.website
                      : `https://${buyer.website}`,
                    "_blank"
                  )
                }
              />
              <InfoRow
                icon={<CalendarDays className="w-4 h-4" />}
                label="Ngày tạo"
                value={formatDate(buyer.createdAt)}
              />
              <InfoRow
                icon={<CalendarDays className="w-4 h-4" />}
                label="Ngày cập nhật"
                value={formatDate(buyer.updatedAt)}
              />
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <div className="flex justify-end mt-4">
          <Button variant="outline" onClick={() => router.back()}>
            ← Quay lại
          </Button>
        </div>
      </div>
    </div>
  );
}

function InfoRow({
  icon,
  label,
  value,
  multiline,
  actionLabel,
  onAction,
}: {
  icon?: React.ReactNode;
  label: string;
  value: string;
  multiline?: boolean;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <div className="flex items-start justify-between gap-3">
      <div className="flex items-start gap-2">
        {icon && <div className="text-gray-500 mt-0.5">{icon}</div>}
        <div>
          <div className="text-xs text-gray-500">{label}</div>
          <div
            className={
              "text-gray-800 " + (multiline ? "whitespace-pre-wrap" : "")
            }
          >
            {value}
          </div>
        </div>
      </div>
      {actionLabel && onAction && (
        <Button size="sm" variant="outline" onClick={onAction} className="h-7">
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
