export interface ProductCategory {
  id: number;
  name: string;
}

export interface ProductSummary {
  id: number;
  name: string;
  imageUrl: string;
  price: number;
  categoryName: string;
  stock: number;
}

export interface ProductDetail {
  id: number;
  name: string;
  description: string;
  imageUrl: string;
  price: number;
  categoryName: string;
  stock: number;
}

export interface CreateProductStockRequestDTO {
  code: string;
  expirationDate: string | null;
}

export interface CreateProductRequestDTO {
  name : string;
  price : number;
  stockItems : CreateProductStockRequestDTO[];
  productCategoryId: number;
  description: string;
}

export interface BulkStockResponseDTO {
  totalProcessed : number;
  successfullyAdded : number;
  failed : number;
  errors : string[];
  processedAt : string;
}