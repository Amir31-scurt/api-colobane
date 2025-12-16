// src/core/domain/brand.ts

export interface Brand {
    id: number;
    name: string;
    slug: string;
    description?: string;
    primaryColor?: string;
    secondaryColor?: string;
    logoUrl?: string;
    isActive: boolean;
    createdAt: Date;
  }
  