import { apiClient } from "./apiClient";
import type { PageResponse } from "../types/page.types";
import type { ProductCategory, ProductSummary, ProductDetail, CreateProductRequestDTO, BulkStockResponseDTO, CreateProductStockRequestDTO } from "../types/product.types";
import type { EntityCreatedResponse } from "../types/purchase.types";

export const productService = {
  getCategories(): Promise<ProductCategory[]> {
    return apiClient.get<ProductCategory[]>('/productCategories');
  },

  getProducts(page = 0): Promise<PageResponse<ProductSummary>> {
    return apiClient.get<PageResponse<ProductSummary>>('/products', {
      params: { page },
    });
  },


  filterProducts(params: {
    searchQuery?: string;
    categoryId?: number;
    maxPrice?: number;
    page?: number;
    sortBy?: string;
    sortDirection?: 'ASC' | 'DESC';
  }): Promise<PageResponse<ProductSummary>> {
    return apiClient.get<PageResponse<ProductSummary>>('/products/filter', {
      params,
    });
  },

  getProductDetail(productId: number): Promise<ProductDetail> {
    return apiClient.get<ProductDetail>(`/products/${productId}`);
  },

  createProduct(request: CreateProductRequestDTO, image: File): Promise<EntityCreatedResponse> {
    const formData = new FormData();
    formData.append('product', new Blob([JSON.stringify(request)], { type: 'application/json' }));
    formData.append('image', image);
    return apiClient.post<EntityCreatedResponse>('/products', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  deleteProduct(productId: number): Promise<void> {
    return apiClient.delete<void>(`/products/${productId}`);
  },

  deleteStockItem(productId: number, stockId: number): Promise<void> {
    return apiClient.delete<void>(`/products/${productId}/stock/${stockId}`);
  },

  addBulkStockItems(productId: number, requests: CreateProductStockRequestDTO[]): Promise<BulkStockResponseDTO> {
    return apiClient.post<BulkStockResponseDTO>(`/products/${productId}/stock/bulk`, requests);
  },
};