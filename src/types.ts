export interface ProductSpecs {
  material: string;
  dimensions: string;
  weight?: string;
  care?: string;
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  shortDescription: string;
  description: string;
  imageUrl: string;
  gallery: string[];
  variants: string[];
  specs: ProductSpecs;
  whatsappNumber?: string;
  featured?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProductFormInput {
  name: string;
  category: string;
  price: string | number;
  stock: string | number;
  shortDescription: string;
  description: string;
  imageUrl: string;
  galleryText?: string;
  variantsText?: string;
  material?: string;
  dimensions?: string;
  weight?: string;
  care?: string;
  whatsappNumber?: string;
  featured?: boolean;
}

export interface StoreSettings {
  storeName: string;
  whatsappNumber: string;
  storeLocation: string;
}

export type SortOption = 'newest' | 'price_asc' | 'price_desc' | 'name_asc';

export type PriceRangeFilter = 'all' | 'under_1m' | '1m_to_5m' | 'above_5m';

export interface CatalogFilters {
  query: string;
  category: string;
  onlyInStock: boolean;
  priceRange: PriceRangeFilter;
  sortBy: SortOption;
}
