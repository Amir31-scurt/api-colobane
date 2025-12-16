// src/core/domain/category.ts
export interface Category {
    id: number;
    name: string;
    slug: string;
    isGlobal: boolean;
    createdAt: Date;
  }
  