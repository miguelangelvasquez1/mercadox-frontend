export interface CreatePurchaseItemRequest {
  productId: number;
  quantity: number;
}

export interface CreatePurchaseRequest {
  items: CreatePurchaseItemRequest[];
  contactEmail?: string;
}

export interface EntityCreatedResponse {
  id: number;
  message: string;
  timestamp: string;
}

export interface PurchaseItem {
  id: number;
  productId: number;
  productName: string;
  imageUrl: string;
}

export interface Purchase {
  id: number;
  referenceId: string;
  items: PurchaseItem[];
  totalItems: number;
  total: number;
  createdAt: string;
  completedAt: string | null;
}