import { OrderStatus, orderStatusDisplayMap } from "@/lib/constants/orderStatus";
import FilterBadge from "../crop-seasons/FilterBadge";

interface Props {
  selectedStatus: OrderStatus | "ALL";
  setSelectedStatus: (value: OrderStatus | "ALL") => void;
  statusCounts: Record<string, number>;
}

export default function FilterOrderStatusPanel({
  selectedStatus,
  setSelectedStatus,
  statusCounts,
}: Props) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-4 space-y-3">
      <h2 className="text-sm font-medium text-gray-700">Lọc theo trạng thái</h2>

      {/* Tất cả */}
      <FilterBadge
        icon={orderStatusDisplayMap["ALL"].icon}
        label={orderStatusDisplayMap["ALL"].label}
        color="orange"
        count={Object.values(statusCounts).reduce((sum, val) => sum + val, 0)}
        active={selectedStatus === "ALL"}
        onClick={() => setSelectedStatus("ALL")}
      />

      {/* Các trạng thái cụ thể */}
      {Object.entries(orderStatusDisplayMap).map(([key, { label, color, icon }]) => {
        if (key === "ALL") return null;
        const count = statusCounts[key] || 0;
        return (
          <FilterBadge
            key={key}
            icon={icon}
            label={label}
            color={color}
            count={count}
            active={selectedStatus === key}
            onClick={() => setSelectedStatus(key as OrderStatus)}
          />
        );
      })}
    </div>
  );
}
