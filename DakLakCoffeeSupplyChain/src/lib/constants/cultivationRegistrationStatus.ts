export type CultivationRegistrationStatusValue = 'Pending' | 'Approved' | 'Rejected' | 'Cancelled';

export const CultivationRegistrationStatusMap: Record<CultivationRegistrationStatusValue, {
  label: string;
  color: 'green' | 'yellow' | 'blue' | 'red' | 'gray';
  icon: string;
}> = {
  'Approved': {
    label: 'Đã có cam kết',
    color: 'green',
    icon: 'A'
  },
  'Rejected': {
    label: 'Đã từ chối',
    color: 'red',
    icon: 'R'
  },
  'Pending': {
    label: 'Đang chờ duyệt',
    color: 'blue',
    icon: 'P'
  },
  'Cancelled': {
    label: 'Đã hủy hợp đồng',
    color: 'red',
    icon: 'C'
  },
};
