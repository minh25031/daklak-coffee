export type ProcurementPlanStatusValue = 'Draft' | 'Open' | 'Closed' | 'Cancelled';

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
  }
};
