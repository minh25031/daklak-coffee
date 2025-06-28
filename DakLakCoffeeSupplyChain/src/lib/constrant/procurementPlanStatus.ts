export type ProcurementPlanStatusValue = 'Draft' | 'Open' | 'Closed' | 'Cancelled' | 'Delete';

export const ProcurementPlanStatusMap: Record<ProcurementPlanStatusValue, {
  label: string;
  color: 'green' | 'yellow' | 'blue' | 'red';
  icon: string; 
}> = {
  Open: {
    label: 'Đang mở',
    color: 'green',
    icon: 'O'
  },
  Closed: {
    label: 'Đã đóng',
    color: 'yellow',
    icon: 'C'
  },
  Draft: {
    label: 'Bản nháp',
    color: 'blue',
    icon: 'D'
  },
  Cancelled: {
    label: 'Đã hủy',
    color: 'red',
    icon: 'Đ'
  },
  Delete: {
    label: 'Đã xóa',
    color: 'red',
    icon: 'X'
  }
};
