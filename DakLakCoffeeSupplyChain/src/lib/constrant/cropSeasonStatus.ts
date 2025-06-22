export type CropSeasonStatusValue = 'Active' | 'Paused' | 'Completed' | 'Cancelled';

export const CropSeasonStatusMap: Record<CropSeasonStatusValue, {
  label: string;
  color: 'green' | 'yellow' | 'blue' | 'red';
  icon: string; 
}> = {
  Active: {
    label: 'Đang hoạt động',
    color: 'green',
    icon: 'Đ'
  },
  Paused: {
    label: 'Tạm dừng',
    color: 'yellow',
    icon: 'T'
  },
  Completed: {
    label: 'Hoàn thành',
    color: 'blue',
    icon: 'H'
  },
  Cancelled: {
    label: 'Đã hủy',
    color: 'red',
    icon: 'Đ'
  }
};
