// SabjiRate - Type-safe interfaces for the application

export type Category = 'VEGETABLES' | 'FRUITS' | 'DAIRY' | 'KIRANA';
export type CategoryLower = 'vegetables' | 'fruits' | 'dairy' | 'kirana';

export type BaseUnit = 'KILOGRAM' | 'LITER';

export interface Product {
  id: string;
  nameEn: string;
  nameHi?: string | null;
  nameMr?: string | null;
  category: Category;
  baseUnit: BaseUnit;
  createdAt: string;
  updatedAt: string;
}

export interface ProductWithWeights extends Product {
  allowedWeights: number[];
}

export interface ListItem {
  id: string;
  productId: string;
  product?: Product;
  quantity: number;
  price: number;
  isChecked: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ShoppingList {
  id: string;
  name: string;
  type: 'current' | 'history';
  userId?: string | null;
  items?: ListItem[];
  createdAt: string;
  updatedAt: string;
}

export interface CalculationResult {
  productId: string;
  productName: string;
  category: Category;
  quantity: number;
  unit: string;
  pricePerUnit: number;
  totalPrice: number;
}

// Weight options per category (strict business logic)
export const DAIRY_WEIGHTS = [250, 500, 750, 1000] // ML
export const VEGETABLE_WEIGHTS = [62.5, 125, 250, 375, 500, 750, 1000] // Grams

// Helper to get allowed weights based on category
export function getAllowedWeights(category: Category): number[] {
  if (category === 'DAIRY') {
    return DAIRY_WEIGHTS;
  }
  return VEGETABLE_WEIGHTS;
}

// Helper to format weight display
export function formatWeight(weight: number, category: Category): string {
  if (category === 'DAIRY') {
    return `${weight} ml`;
  }
  return `${weight} g`;
}

// Helper to convert to base unit display
export function formatBaseUnit(unit: BaseUnit): string {
  return unit === 'LITER' ? 'Liter' : 'Kg';
}
