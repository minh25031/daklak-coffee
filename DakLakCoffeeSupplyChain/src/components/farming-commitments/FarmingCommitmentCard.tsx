"use client";

import { Badge } from "@/components/ui/badge";
import { FarmingCommitment } from "@/lib/api/farmingCommitments";
import {
  FarmingCommitmentStatusMap,
  FarmingCommitmentStatusValue,
} from "@/lib/constants/FarmingCommitmentStatus";
import { cn } from "@/lib/utils";
import Link from "next/link";
import StatusBadge from "../crop-seasons/StatusBadge";

export default function FarmingCommitmentCard({
  commitment,
}: {
  commitment: FarmingCommitment;
}) {
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
      <td className='px-4 py-3'>{commitment.totalPrice.toLocaleString()} VNĐ</td>

      <td className='px-4 py-3'>
        <StatusBadge status={commitment.status} map={FarmingCommitmentStatusMap} />
      </td>

      <td className='px-4 py-3'>
        {new Date(commitment.commitmentDate).toLocaleDateString("vi-VN")}
      </td>

      <td className='px-4 py-3 text-center align-middle'></td>
    </tr>
  );
}
