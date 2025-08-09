"use client";

import { Badge } from "@/components/ui/badge";
import { FarmingCommitment } from "@/lib/api/farmingCommitments";
import {
  FarmingCommitmentStatusMap,
  FarmingCommitmentStatusValue,
} from "@/lib/constants/FarmingCommitmentStatus";
import { cn } from "@/lib/utils";
import Link from "next/link";

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
      <td className='px-4 py-3'>{commitment.totalPrice?.toLocaleString()}</td>

      <td className='px-4 py-3'>
        <Badge
          className={cn(
            "inline-flex items-center justify-center w-32 h-8 px-2 py-1 text-xs font-medium rounded-full border text-center",
            commitment.status === "Active"
              ? "bg-green-100 text-green-700 border-green-500"
              : commitment.status === "Completed"
              ? "bg-gray-100 text-gray-700 border-gray-500"
              : commitment.status === "Cancelled"
              ? "bg-rose-100 text-rose-700 border-rose-500"
              : commitment.status === "Pending"
              ? "bg-blue-100 text-blue-700 border-blue-500"
              : "bg-red-100 text-red-700 border-red-500"
          )}
        >
          {FarmingCommitmentStatusMap[
            commitment.status as FarmingCommitmentStatusValue
          ]?.label || commitment.status}
        </Badge>
      </td>

      <td className='px-4 py-3'>
        {new Date(commitment.commitmentDate).toLocaleDateString("vi-VN")}
      </td>

      <td className='px-4 py-3 text-center align-middle'></td>
    </tr>
  );
}
