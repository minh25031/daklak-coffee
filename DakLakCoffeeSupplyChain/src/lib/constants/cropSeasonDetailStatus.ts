export type CropSeasonDetailStatusValue = 'Planned' | 'InProgress' | 'Completed' | 'Cancelled';

export enum CropSeasonDetailStatusEnum {
  Planned = 0,
  InProgress = 1,
  Completed = 2,
  Cancelled = 3,
}

export const CropSeasonDetailStatusMap: Record<CropSeasonDetailStatusValue, {
  label: string;
  color: 'gray' | 'yellow' | 'green' | 'red';
}> = {
  Planned: {
    label: 'Đã lên kế hoạch',
    color: 'gray',
  },
  InProgress: {
    label: 'Đang canh tác',
    color: 'yellow',
  },
  Completed: {
    label: 'Đã hoàn thành',
    color: 'green',
  },
  Cancelled: {
    label: 'Đã huỷ',
    color: 'red',
  },
};

// Mapping number <-> string
export const CropSeasonDetailStatusNumberToValue: Record<number, CropSeasonDetailStatusValue> = {
  0: 'Planned',
  1: 'InProgress',
  2: 'Completed',
  3: 'Cancelled',
};

export const CropSeasonDetailStatusValueToNumber: Record<CropSeasonDetailStatusValue, number> = {
  Planned: 0,
  InProgress: 1,
  Completed: 2,
  Cancelled: 3,
};
