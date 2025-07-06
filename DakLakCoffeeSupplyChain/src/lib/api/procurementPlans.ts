import api from "./axios";

export type ProcurementPlan = {
  planId: string;
  planCode: string;
  title: string;
  description: string;
  totalQuantity: number;
  createdBy: {
    managerId: string;
    userId: string;
    managerCode: string;
    companyName: string;
    companyAddress: string;
    website: string;
    contactEmail: string;
  };
  startDate: string;
  endDate: string;
  progressPercentage: number;
  createdAt: string;
  updatedAt: string;
  status: string;
  procurementPlansDetails: ProcurementPlansDetails[];
};

export type ProcurementPlansDetails = {
  planDetailsId: string;
  planDetailCode: string;
  planId: string;
  coffeeType: {
    coffeeTypeId: string;
    typeCode: string;
    typeName: string;
    botanicalName: string;
    description: string;
    typicalRegion: string;
    specialtyLevel: string;
  };
  processingMethodName: string;
  targetQuantity: number;
  targetRegion: string;
  minimumRegistrationQuantity: number;
  minPriceRange: number;
  maxPriceRange: number;
  note: string;
  progressPercentage: number;
  status: string;
  createdAt: string;
  updatedAt: string;
};

export async function getAllProcurementPlans(): Promise<ProcurementPlan[]> {
  const response = await api.get("/ProcurementPlans");
  return response.data;
}

export async function getProcurementPlanById(planId: string): Promise<ProcurementPlan | null> {
  const response = await api.get(`/ProcurementPlans/${planId}`);
  return response.data;
}
