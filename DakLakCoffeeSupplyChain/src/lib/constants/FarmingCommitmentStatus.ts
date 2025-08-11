export type FarmingCommitmentStatusValue = 'Pending' | 'Active' | 'Completed' | 'Cancelled' | 'Breached' | 'Rejected';

export const FarmingCommitmentStatusMap: Record<FarmingCommitmentStatusValue, {
  label: string;
  color: 'green' | 'yellow' | 'blue' | 'red' | 'gray';
  icon: string;
}> = {
  'Active': {
    label: 'Đang hoạt động',
    color: 'green',
    icon: 'A'
  },
  'Completed': {
    label: 'Đã hoàn thành',
    color: 'gray',
    icon: 'D'
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
  'Breached': {
    label: 'Đã bị vi phạm',
    color: 'red',
    icon: 'X'
  },
  'Rejected': {
    label: 'Đã bị từ chối',
    color: 'red',
    icon: 'X'
  }
};
