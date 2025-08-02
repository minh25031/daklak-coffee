"use client";

import React, { useEffect, useState } from "react";
import { ChevronDownIcon, ChevronUpIcon } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { AppToast } from "../ui/AppToast";
import {
  CultivationRegistrationDetail,
  updateCultivationRegistrationDetailStatus,
} from "@/lib/api/cultivationRegistrations";
import { getErrorMessage } from "@/lib/utils";
import { ConfirmDialog } from "../ui/confirmDialog";
import { FiCheck } from "react-icons/fi";

const STORAGE_KEY_PREFIX = "registration-expanded-";

type RegistrationCardProps = {
  registrationId: string;
  registrationCode: string;
  farmerName: string;
  farmerAvatarURL: string | null;
  farmerLocation: string;
  registeredArea: number;
  registeredAt: string;
  cultivationRegistrationViewDetailsDtos: Partial<CultivationRegistrationDetail>[];
  onUpdate?: () => void;
};

export default function RegistrationCard({
  registrationId,
  registrationCode,
  farmerName,
  farmerAvatarURL,
  farmerLocation,
  registeredArea,
  registeredAt,
  cultivationRegistrationViewDetailsDtos,
  onUpdate,
}: RegistrationCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [loadingApprovalId, setLoadingApprovalId] = useState<string | null>(
    null
  );
  const [currentDetailId, setCurrentDetailId] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY_PREFIX + registrationId);
    if (stored === "true") {
      setExpanded(true);
    }
  }, [registrationId]);

  const toggleExpanded = () => {
    setExpanded((prev) => {
      const newState = !prev;
      localStorage.setItem(
        STORAGE_KEY_PREFIX + registrationId,
        newState ? "true" : "false"
      );
      return newState;
    });
  };

  const openConfirmDialog = (detailId: string) => {
    setCurrentDetailId(detailId);
    setConfirmOpen(true);
  };

  const currentDetail =
    cultivationRegistrationViewDetailsDtos.find(
      (d) => d.cultivationRegistrationDetailId === currentDetailId
    ) || null;

  const handleApprove = async () => {
    if (!currentDetailId) return;

    setLoadingApprovalId(currentDetailId);
    try {
      await updateCultivationRegistrationDetailStatus(currentDetailId, {
        status: 1,
      });
      AppToast.success("Duyệt đơn đăng ký thành công!");
      setConfirmOpen(false);
      onUpdate?.();
    } catch (error) {
      AppToast.error(getErrorMessage(error) || "Duyệt đơn đăng ký thất bại!");
    } finally {
      setLoadingApprovalId(null);
    }
  };

  return (
    <div className='border border-gray-300 rounded-xl p-4 bg-orange-50 shadow-sm mx-6'>
      {/* Header */}
      <div className='flex items-center gap-4'>
        {farmerAvatarURL ? (
          <Image
            src={farmerAvatarURL}
            alt={`${farmerName} avatar`}
            width={56}
            height={56}
            className='w-14 h-14 rounded-full object-cover border border-gray-300'
          />
        ) : (
          <div className='w-14 h-14 rounded-full bg-gray-200 flex items-center justify-center text-gray-500'>
            <span className='text-xl font-semibold'>
              {farmerName.charAt(0)}
            </span>
          </div>
        )}

        {/* Info chính */}
        <div className='flex-1 min-w-0'>
          <h4 className='text-lg font-semibold truncate'>{farmerName}</h4>
          <p className='text-sm text-gray-600 truncate'>{farmerLocation}</p>
          <p className='text-sm text-gray-600 mt-1'>
            Diện tích đăng ký:{" "}
            <span className='font-medium'>
              {registeredArea.toLocaleString()} ha
            </span>
          </p>
          <p className='text-xs text-gray-400 mt-0.5'>
            Mã đơn: <span className='font-mono'>{registrationCode}</span> - Ngày
            đăng ký: {format(new Date(registeredAt), "dd/MM/yyyy HH:mm")}
          </p>
        </div>

        {/* Nút mở rộng */}
        <Button
          variant='outline'
          size='sm'
          className='flex items-center gap-1'
          onClick={toggleExpanded}
          aria-expanded={expanded}
          aria-controls={`detail-content-${registrationId}`}
          aria-label={expanded ? "Thu gọn chi tiết" : "Xem chi tiết"}
        >
          {expanded ? "Thu gọn" : "Xem chi tiết"}
          {expanded ? (
            <ChevronUpIcon className='w-4 h-4' />
          ) : (
            <ChevronDownIcon className='w-4 h-4' />
          )}
        </Button>
      </div>

      {/* Nội dung chi tiết khi mở rộng */}
      {expanded && (
        <div
          id={`detail-content-${registrationId}`}
          className='mt-4 border-t border-gray-200 pt-4 space-y-3 text-sm text-gray-700'
        >
          {cultivationRegistrationViewDetailsDtos.map((detail) => {
            const isApproved = detail.status === 1;
            return (
              <div
                key={detail.cultivationRegistrationDetailId}
                className='bg-orange-100 p-3 rounded-md border border-orange-100'
              >
                <p>
                  <strong>Loại cà phê:</strong> {detail.coffeeType}
                </p>
                <p>
                  <strong>Sản lượng ước tính:</strong>{" "}
                  {detail.estimatedYield !== undefined
                    ? detail.estimatedYield.toLocaleString()
                    : "Chưa cập nhật"}{" "}
                  kg
                </p>
                <p>
                  <strong>Giá mong muốn:</strong>{" "}
                  {detail.wantedPrice
                    ? detail.wantedPrice.toLocaleString() + " VNĐ/kg"
                    : "Chưa cập nhật"}
                </p>
                <p>
                  <strong>Thời gian thu hoạch:</strong>{" "}
                  {detail.expectedHarvestStart} - {detail.expectedHarvestEnd}
                </p>
                {detail.note && (
                  <p>
                    <strong>Ghi chú:</strong> {detail.note}
                  </p>
                )}

                {/* Nút Duyệt */}
                <div className='flex justify-end'>
                  {isApproved ? (
                    <Button size='sm' disabled className='cursor-default'>
                      Đã duyệt
                    </Button>
                  ) : (
                    <Button
                      size='sm'
                      variant='outline'
                      disabled={
                        loadingApprovalId ===
                        detail.cultivationRegistrationDetailId
                      }
                      onClick={() =>
                        detail.cultivationRegistrationDetailId &&
                        openConfirmDialog(
                          detail.cultivationRegistrationDetailId
                        )
                      }
                      className='bg-green-200 hover:bg-emerald-400 hover:text-white text-green-800 transition'
                    >
                      <FiCheck className='inline-block' /> Duyệt chi tiết đơn
                    </Button>
                  )}
                </div>
              </div>
            );
          })}

          {/* Popup confirm duyệt */}
          <ConfirmDialog
            open={confirmOpen}
            onOpenChange={setConfirmOpen}
            title='Xác nhận duyệt chi tiết đơn đăng ký'
            description={
              <>
                Bạn có chắc chắn muốn duyệt chi tiết đơn{" "}
                <b>{currentDetail?.coffeeType ?? ""}</b> này? Sau khi duyệt,
                người nông dân sẽ được thông báo và bạn có thể tiến hành các
                bước tiếp theo. Bạn có thể tạo cam kết với họ để mở khóa tính
                năng báo cáo mùa vụ cho nông dân.
              </>
            }
            confirmText='Đồng ý'
            cancelText='Hủy'
            onConfirm={handleApprove}
            loading={loadingApprovalId !== null}
          />
        </div>
      )}
    </div>
  );
}
