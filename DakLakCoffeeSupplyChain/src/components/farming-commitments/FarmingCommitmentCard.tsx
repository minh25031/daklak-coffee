"use client";

import { FarmingCommitment } from "@/lib/api/farmingCommitments";
import { FarmingCommitmentStatusMap } from "@/lib/constants/FarmingCommitmentStatus";
import Link from "next/link";
import StatusBadge from "../crop-seasons/StatusBadge";
import BasicDropdown from "../ui/dropdownMenu";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { FiEdit, FiInfo } from "react-icons/fi";
import { useRouter } from "next/navigation";

export default function FarmingCommitmentCard({
  commitment,
}: {
  commitment: FarmingCommitment;
}) {
  const router = useRouter();

  return (
    <tr key={commitment.commitmentId} className='border-t hover:bg-gray-50'>
      <td className='px-4 py-3'>
        <Link
          href={`/dashboard/manager/farming-commitments/${commitment.commitmentId}`}
        >
          <div className='font-medium'>{commitment.commitmentName}</div>
          <div className='text-sm text-muted-foreground flex items-center gap-1'>
            {commitment.commitmentCode}
          </div>
        </Link>
      </td>

      <td className='px-4 py-3'>{commitment.farmerName}</td>
      <td className='px-4 py-3'>
        {commitment.totalPrice.toLocaleString()} VNĐ
      </td>

      <td className='px-4 py-3'>
        <StatusBadge
          status={commitment.status}
          map={FarmingCommitmentStatusMap}
        />
      </td>

      <td className='px-4 py-3'>
        {new Date(commitment.commitmentDate).toLocaleDateString("vi-VN")}
      </td>

      <td className='px-4 py-3 text-center align-middle'>
        <BasicDropdown>
          <DropdownMenu.Item
            className='px-3 py-2 hover:bg-gray-100 rounded cursor-pointer flex items-center'
            disabled={commitment.status !== "Pending"}
            style={{
              cursor: commitment.status !== "Pending" ? "not-allowed" : "pointer",
            }}
            onClick={() => {
              router.push(`/dashboard/manager/farming-commitments/${commitment.commitmentId}/edit?registrationId=${commitment.registrationId}`);
          }}
          >
            <FiEdit className='mr-1' /> Chỉnh sửa
          </DropdownMenu.Item>
          <DropdownMenu.Item
            className='px-3 py-2 hover:bg-gray-100 rounded cursor-pointer flex items-center'
            onClick={() => {
              router.push(`/dashboard/manager/farming-commitments/${commitment.commitmentId}`);
            }}
          >
            <FiInfo className='mr-1' /> Chi tiết
          </DropdownMenu.Item>
        </BasicDropdown>
      </td>
    </tr>
  );
}
