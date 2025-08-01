import React from 'react';
import { ContractViewAllDto } from "@/lib/api/contracts";

interface ContractCardProps {
  contract: ContractViewAllDto;
}

export const ContractCard: React.FC<ContractCardProps> = ({ contract }) => {
  return (
    <div className="rounded-2xl shadow-md border p-4 space-y-2 bg-white hover:shadow-lg transition-all">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">{contract.contractTitle}</h2>
        <span className="text-sm text-gray-500">{contract.contractCode}</span>
      </div>
      <div className="text-sm">
        <p><strong>Người bán:</strong> {contract.sellerName}</p>
        <p><strong>Người mua:</strong> {contract.buyerName}</p>
        <p><strong>Số vòng giao:</strong> {contract.deliveryRounds ?? 'N/A'}</p>
        <p><strong>Tổng số lượng:</strong> {contract.totalQuantity ?? 'N/A'}</p>
        <p><strong>Tổng giá trị:</strong> {contract.totalValue?.toLocaleString() ?? 'N/A'} VNĐ</p>
        <p><strong>Thời gian:</strong> {contract.startDate} → {contract.endDate}</p>
        <p><strong>Trạng thái:</strong> <span className="font-medium text-blue-600">{contract.status}</span></p>
      </div>
    </div>
  );
};

export default ContractCard;