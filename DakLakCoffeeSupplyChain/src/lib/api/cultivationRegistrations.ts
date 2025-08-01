import { ParamValue } from "next/dist/server/request/params";
import api from "./axios";

export type CultivationRegistration = {
  registrationId: string;
  registrationCode: string;
  planId: string;
  farmerId: string;
  farmerName: string;
  farmerAvatarURL: string;
  farmerLicencesURL: string;
  farmerLocation: string;
  registeredArea: number; // in hectares
  registeredAt: string; // ISO date string
  totalWantedPrice: number; // total price for the registered area
  cultivationRegistrationViewDetailsDtos: Partial<CultivationRegistrationDetail>[];
};
export type CultivationRegistrationDetail = {
  cultivationRegistrationDetailId: string;
  registrationId: string;
  planDetailId: string;
  estimatedYield: number; // in kg
  wantedPrice: number; // price per kg
  expectedHarvestStart: string; // ISO date string
  expectedHarvestEnd: string; // ISO date string
  coffeeType: string; // e.g. "Arabica", "Robusta"
  //processingMethod: string; // e.g. "Washed", "Natural"
  expectedYield: number; // in kg per hectare
  note: string;
};

export async function getCultivationRegistrationsByPlanId(planId: ParamValue): Promise<CultivationRegistration[]> {
  const response = await api.get(`/CultivationRegistration/Available/${planId}`);
  return response.data;
}

export async function createCultivationRegistration(
  data: Partial<CultivationRegistration>
): Promise<CultivationRegistration | null> {
  const response = await api.post(`/CultivationRegistration`, data);
  return response.data;
}
