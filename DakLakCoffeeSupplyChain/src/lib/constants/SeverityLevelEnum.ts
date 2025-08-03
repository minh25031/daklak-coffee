export enum SeverityLevelEnum {
  Low = 0,
  Medium = 1,
  High = 2,
}

export const SeverityLevelLabel: Record<SeverityLevelEnum, string> = {
  [SeverityLevelEnum.Low]: "Nhẹ",
  [SeverityLevelEnum.Medium]: "Vừa",
  [SeverityLevelEnum.High]: "Nghiêm trọng",
};
