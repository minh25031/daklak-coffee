export type FarmingCommitmentStatusValue = 0 | 1 | 2 | 3 | 4;

export const FarmingCommitmentStatusMap: Record<FarmingCommitmentStatusValue, {
  label: string;
  color: 'green' | '#ff4900' | 'blue' | 'red';
  icon: string; 
}> = {
  1: {
    label: 'Đang hoạt động',
    color: 'green',
    icon: 'A'
  },
  2: {
    label: 'Đã hoàn thành',
    color: '#ff4900',
    icon: 'D'
  },
  0: {
    label: 'Đang chờ duyệt',
    color: 'blue',
    icon: 'P'
  },
  3: {
    label: 'Đã hủy hợp đồng',
    color: 'red',
    icon: 'C'
  },
  4: {
    label: 'Đã bị vi phạm',
    color: 'red',
    icon: 'X'
  }
};
