// src/core/domain/product.ts

export interface Product {
    id: number;
    brandId: number;
    name: string;
    slug: string;
    description?: string;
    price: number;
    stock: number;
    imageUrl?: string;
    isActive: boolean;
    createdAt: Date;
    
    categories?: {
      id: number;
      name: string;
      slug: string;
    }[];
  }
  