export type CultivationRegistrationDetailStatusValue = 'Pending' | 'Approved' | 'Rejected';

export const CultivationRegistrationDetailStatusMap: Record<CultivationRegistrationDetailStatusValue, {
  label: string;
  color: 'green' | 'yellow' | 'blue' | 'red' | 'gray';
  icon: string;
}> = {
  'Approved': {
    label: 'Đã duyệt',
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
  }
};
