export type CropSeasonStatusValue = 'Active' | 'Paused' | 'Completed' | 'Cancelled';

export enum CropSeasonStatusEnum {
  Active = 0,
  Paused = 1,
  Completed = 2,
  Cancelled = 3,
}

export const CropSeasonStatusMap: Record<CropSeasonStatusValue, {
  label: string;
  color: 'green' | 'yellow' | 'blue' | 'red';
  icon: string;
}> = {
  Active: { label: 'Đang hoạt động', color: 'green', icon: 'Đ' },
  Paused: { label: 'Tạm dừng', color: 'yellow', icon: 'T' },
  Completed: { label: 'Hoàn thành', color: 'blue', icon: 'H' },
  Cancelled: { label: 'Đã hủy', color: 'red', icon: 'Đ' },
};

export const CropSeasonStatusNumberToValue: Record<number, CropSeasonStatusValue> = {
  0: 'Active',
  1: 'Paused',
  2: 'Completed',
  3: 'Cancelled',
};

export const CropSeasonStatusValueToNumber: Record<CropSeasonStatusValue, number> = {
  Active: 0,
  Paused: 1,
  Completed: 2,
  Cancelled: 3,
};
