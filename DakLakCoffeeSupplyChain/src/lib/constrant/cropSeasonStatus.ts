export type CropSeasonStatusValue = 'Active' | 'Paused' | 'Completed' | 'Cancelled';

export const CropSeasonStatusMap: Record<CropSeasonStatusValue, {
  label: string;
  color: 'green' | 'rose' | 'blue' | 'indigo';
  icon: string; // để hiện ký hiệu bên trái như "Đ", "T"
}> = {
  Active: {
    label: 'Đang hoạt động',
    color: 'green',
    icon: 'Đ'
  },
  Paused: {
    label: 'Tạm dừng',
    color: 'rose',
    icon: 'T'
  },
  Completed: {
    label: 'Hoàn thành',
    color: 'blue',
    icon: 'H'
  },
  Cancelled: {
    label: 'Đã hủy',
    color: 'indigo',
    icon: 'Đ'
  }
};
