import { apiClient } from "./apiClient";
import type { PageResponse } from "../types/page.types";
import type {
  CreatePurchaseRequest,
  EntityCreatedResponse,
  Purchase
} from "../types/purchase.types";

export const purchaseService = {
  buy(payload: CreatePurchaseRequest): Promise<EntityCreatedResponse> {
    return apiClient.post<EntityCreatedResponse>('/purchases/buy', payload);
  },

  getMyPurchases(page = 0, size = 20): Promise<PageResponse<Purchase>> {
    return apiClient.get<PageResponse<Purchase>>('/purchases', {
      params: { page, size },
    });
  },
};