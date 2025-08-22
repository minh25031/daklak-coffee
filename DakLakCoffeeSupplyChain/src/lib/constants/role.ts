export const roleSlugMap: Record<string, string> = {
  Admin: "admin",
  BusinessManager: "manager",
  BusinessStaff: "staff", 
  Farmer: "farmer",
  AgriculturalExpert: "expert",
  DeliveryStaff: "delivery", 
};

export const roleIdToNameMap: Record<number, string> = {
  1: "Chuyên gia nông nghiệp",
  2: "Quản lý doanh nghiệp",
  3: "Nhân viên doanh nghiệp",
  4: "Nông dân",
  5: "Nhân viên giao hàng",
  6: "Quản trị viên",
};

export const roleRawToDisplayName: Record<string, string> = {
  Admin: "Quản trị viên",
  BusinessManager: "Quản lý doanh nghiệp",
  BusinessStaff: "Nhân viên doanh nghiệp",
  Farmer: "Nông dân",
  AgriculturalExpert: "Chuyên gia nông nghiệp",
  DeliveryStaff: "Nhân viên giao hàng",
};

export const roleNameToVietnamese: Record<string, string> = {
  Admin: "Quản trị viên",
  BusinessManager: "Quản lý doanh nghiệp",
  BusinessStaff: "Nhân viên doanh nghiệp",
  Farmer: "Nông dân",
  AgriculturalExpert: "Chuyên gia nông nghiệp",
  DeliveryStaff: "Nhân viên giao hàng",
};
