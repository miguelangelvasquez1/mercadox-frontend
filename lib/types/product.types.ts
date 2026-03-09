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