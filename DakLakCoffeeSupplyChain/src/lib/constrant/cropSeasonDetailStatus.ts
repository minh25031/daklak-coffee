export enum CropSeasonDetailStatusEnum {
  Planned = 0,
  Harvesting = 1,
  Harvested = 2,
  Completed = 3,
  Cancelled = 4,
}

export type CropSeasonDetailStatusValue = keyof typeof CropSeasonDetailStatusEnum;

export const CropSeasonDetailStatusMap: Record<CropSeasonDetailStatusValue, {
  label: string;
  color: 'green' | 'yellow' | 'blue' | 'red' | 'gray';
}> = {
  Planned: {
    label: 'Lên kế hoạch',
    color: 'gray',
  },
  Harvesting: {
    label: 'Đang thu hoạch',
    color: 'yellow',
  },
  Harvested: {
    label: 'Đã thu hoạch',
    color: 'green',
  },
  Completed: {
    label: 'Hoàn thành',
    color: 'blue',
  },
  Cancelled: {
    label: 'Đã hủy',
    color: 'red',
  },
};

export function mapStatusFromEnum(value: number): CropSeasonDetailStatusValue {
  return Object.keys(CropSeasonDetailStatusEnum).find(
    (key) => CropSeasonDetailStatusEnum[key as keyof typeof CropSeasonDetailStatusEnum] === value
  ) as CropSeasonDetailStatusValue;
}

export function mapStatusToEnum(value: CropSeasonDetailStatusValue): number {
  return CropSeasonDetailStatusEnum[value];
}
