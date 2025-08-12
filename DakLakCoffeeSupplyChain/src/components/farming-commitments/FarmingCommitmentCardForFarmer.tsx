"use client";

import { FarmingCommitment } from "@/lib/api/farmingCommitments";
import {
  FarmingCommitmentStatusMap,
} from "@/lib/constants/FarmingCommitmentStatus";
import Link from "next/link";
import StatusBadge from "../crop-seasons/StatusBadge";

export default function FarmingCommitmentCardForFarmer({
  commitment,
}: {
  commitment: FarmingCommitment;
}) {
  return (
    <tr key={commitment.commitmentId} className='border-t hover:bg-gray-50'>
      <td className='px-4 py-3'>
        <Link
          href={`/dashboard/farmer/farming-commitments/${commitment.commitmentId}`}
        >
          <div className='font-medium'>{commitment.commitmentName}</div>
          <div className='text-sm text-muted-foreground flex items-center gap-1'>
            {commitment.commitmentCode}
          </div>
        </Link>
      </td>

      <td className='px-4 py-3'>{commitment.companyName}</td>
      <td className='px-4 py-3'>{commitment.totalPrice?.toLocaleString()} VNĐ</td>

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
