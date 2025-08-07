import api from "./axios";

// Soft delete delivery item
export async function softDeleteContractDeliveryItem(deliveryItemId: string): Promise<void> {
  await api.patch(`/ContractDeliveryItems/soft-delete/${deliveryItemId}`);
}
