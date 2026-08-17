export type ProductCategory = string;

export interface Product {
  id: string;
  slug: string;
  name: string;
  category: ProductCategory;
  priceCHF: number;
  stripePriceId?: string | null;
  description: string;
  care: string[];
  sizes: string[];
  stock: Partial<Record<string, number>>;
  images: string[];
  isNew?: boolean;
  dropId?: string | null;
  releaseDate?: string;
}

export interface Drop {
  id: string;
  slug: string;
  name: string;
  releaseDate: string;
  description: string;
  images: string[];
  notifyCount?: number;
  dueTo?: string | null;
  priceCHF?: number;
  sizes?: string[];
  stock?: Partial<Record<string, number>>;
}

export interface CartLine {
  productId: string;
  slug: string;
  name: string;
  size: string;
  priceCHF: number;
  image: string;
  quantity: number;
}
