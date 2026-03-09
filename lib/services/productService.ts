import { apiClient } from "./apiClient";
import type { PageResponse } from "../types/page.types";
import type { ProductCategory, ProductSummary, ProductDetail } from "../types/product.types";

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
};