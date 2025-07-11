import FilterBadge from "./FilterBadge";

interface StatusMeta {
  label: string;
  color: string;
  icon: string;
}

interface FilterStatusPanelProps<T extends string | number | symbol> {
  selectedStatus: T | null;
  setSelectedStatus: (value: T | null) => void;
  statusCounts: Record<T, number>;
  statusMap: Record<T, StatusMeta>;
}

export default function FilterStatusPanel<T extends string | number | symbol>({
  selectedStatus,
  setSelectedStatus,
  statusCounts,
  statusMap,
}: FilterStatusPanelProps<T>) {
  const totalCount = (Object.values(statusCounts) as number[]).reduce(
    (sum, val) => sum + val,
    0
  );

  return (
    <div className='bg-white rounded-xl shadow-sm p-4 space-y-3'>
      <h2 className='text-sm font-medium text-gray-700'>Lọc theo trạng thái</h2>

      <FilterBadge
        icon='Đ'
        label='Tất cả trạng thái'
        count={totalCount}
        color='orange'
        active={selectedStatus === null}
        onClick={() => setSelectedStatus(null)}
      />

      {(Object.entries(statusMap) as [T, StatusMeta][]).map(
        ([key, { label, color, icon }]) => {
          return (
            <FilterBadge
              key={key as string}
              icon={icon}
              label={label}
              color={color}
              count={statusCounts[key] ?? 0}
              active={selectedStatus === key}
              onClick={() =>
                setSelectedStatus(selectedStatus === key ? null : key)
              }
            />
          );
        }
      )}
    </div>
  );
}
