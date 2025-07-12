import api from "@/lib/api/axios";

export type CoffeeType = {
  coffeeTypeId: string;
  typeName: string;
  typeCode: string;
  botanicalName?: string | null;
  description?: string;
  typicalRegion?: string;
  specialtyLevel?: string;
};

export async function getCoffeeTypes(): Promise<CoffeeType[]> {
  const response = await api.get("/CoffeeType");
  return response.data;
}
