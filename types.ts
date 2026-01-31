
export type WeightUnit = 'g' | 'kg';

export interface ProductItem {
  id: string;
  name: string;
  weight: number | '';
  unit: WeightUnit;
  quantity: number | '';
  priceEur: number | '';
}

export interface ComparisonResult {
  id: string;
  pricePerKgEur: number;
  pricePerKgBgn: number;
  isBestValue: boolean;
  totalWeightKg: number;
}
