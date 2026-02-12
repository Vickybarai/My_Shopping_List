// Price Calculator Logic with Strict Business Rules
// Implements canonical weight mappings for Indian market

import { formatPriceWithLanguages } from './numberConverter';
import { Category } from '@/lib/sabjirate-seed';
import { CANONICAL_WEIGHTS } from '@/lib/sabjirate-seed';

export interface CalculationResult {
  weight: number;
  unit: string;
  localTerm: string;
  localTermHi: string;
  localTermMr: string;
  price: number;
  priceFormatted: string;
  priceHindi: string;
  priceMarathi: string;
}

export interface CustomWeightResult {
  weight: number;
  unit: string;
  price: number;
  priceFormatted: string;
  priceHindi: string;
  priceMarathi: string;
  isCustom: boolean;
}

/**
 * Calculate prices for all canonical weights
 * STRICT RULE: Dairy uses ML, others use Grams
 */
export function calculateAllPrices(
  category: Category,
  pricePerUnit: number
): CalculationResult[] {
  const isDairy = category === Category.DAIRY;
  
  // STRICT RULE: Select correct weight set
  const weights = isDairy ? CANONICAL_WEIGHTS.DAIRY_WEIGHTS : CANONICAL_WEIGHTS.VEG_WEIGHTS;
  
  return weights.map((weight) => {
    let calculatedPrice: number;
    let displayUnit: string;
    
    if (isDairy) {
      // DAIRY RULE: Price per Liter, calculate from ML
      const ml = weight.ml;
      const liters = ml / 1000;
      calculatedPrice = liters * pricePerUnit;
      displayUnit = 'ml';
    } else {
      // VEGETABLE/FRUIT/KIRANA RULE: Price per Kg, calculate from Grams
      const grams = weight.grams;
      const kg = grams / 1000;
      calculatedPrice = kg * pricePerUnit;
      displayUnit = 'g';
    }
    
    const priceData = formatPriceWithLanguages(calculatedPrice);
    
    return {
      weight: isDairy ? weight.ml : weight.grams,
      unit: displayUnit,
      localTerm: weight.localTerm,
      localTermHi: weight.hi,
      localTermMr: weight.mr,
      price: calculatedPrice,
      priceFormatted: priceData.numeric,
      priceHindi: priceData.hindi,
      priceMarathi: priceData.marathi,
    };
  });
}

/**
 * Calculate price for custom weight
 * Works for both dairy (ml) and others (grams)
 */
export function calculateCustomPrice(
  category: Category,
  customWeight: number,
  customUnit: 'g' | 'kg' | 'ml' | 'L',
  pricePerUnit: number
): CustomWeightResult {
  const isDairy = category === Category.DAIRY;
  
  let baseWeightInGramsOrMl: number;
  let displayUnit: string;
  
  if (isDairy) {
    // DAIRY RULE: Convert everything to ML
    if (customUnit === 'L') {
      baseWeightInGramsOrMl = customWeight * 1000;
      displayUnit = 'ml';
    } else {
      baseWeightInGramsOrMl = customWeight;
      displayUnit = 'ml';
    }
    
    // Calculate: price per Liter * (ml / 1000)
    const liters = baseWeightInGramsOrMl / 1000;
    const calculatedPrice = liters * pricePerUnit;
    const priceData = formatPriceWithLanguages(calculatedPrice);
    
    return {
      weight: baseWeightInGramsOrMl,
      unit: displayUnit,
      price: calculatedPrice,
      priceFormatted: priceData.numeric,
      priceHindi: priceData.hindi,
      priceMarathi: priceData.marathi,
      isCustom: true,
    };
  } else {
    // VEGETABLE/FRUIT/KIRANA RULE: Convert everything to Grams
    if (customUnit === 'kg') {
      baseWeightInGramsOrMl = customWeight * 1000;
      displayUnit = 'g';
    } else {
      baseWeightInGramsOrMl = customWeight;
      displayUnit = 'g';
    }
    
    // Calculate: price per Kg * (grams / 1000)
    const kg = baseWeightInGramsOrMl / 1000;
    const calculatedPrice = kg * pricePerUnit;
    const priceData = formatPriceWithLanguages(calculatedPrice);
    
    return {
      weight: baseWeightInGramsOrMl,
      unit: displayUnit,
      price: calculatedPrice,
      priceFormatted: priceData.numeric,
      priceHindi: priceData.hindi,
      priceMarathi: priceData.marathi,
      isCustom: true,
    };
  }
}

/**
 * Get default price unit based on category
 */
export function getPriceUnit(category: Category): string {
  if (category === Category.DAIRY) {
    return '1 Liter';
  }
  return '1 Kg';
}

/**
 * Validate weight input based on category
 * STRICT RULE: Dairy cannot use grams/kg, others cannot use ml/L
 */
export function validateWeightInput(
  category: Category,
  unit: 'g' | 'kg' | 'ml' | 'L'
): { valid: boolean; error?: string } {
  const isDairy = category === Category.DAIRY;
  
  if (isDairy) {
    // DAIRY RULE: Only ml and L allowed
    if (unit === 'g' || unit === 'kg') {
      return {
        valid: false,
        error: 'Dairy products use Liters/mL only, not grams/kg',
      };
    }
  } else {
    // VEGETABLE/FRUIT/KIRANA RULE: Only g and kg allowed
    if (unit === 'ml' || unit === 'L') {
      return {
        valid: false,
        error: 'Vegetables/Fruits/Kirana use grams/kg only, not Liters/mL',
      };
    }
  }
  
  return { valid: true };
}

/**
 * Format weight display with local term
 */
export function formatWeightWithLocalTerm(
  weight: number,
  unit: string,
  localTerm?: string
): string {
  if (localTerm) {
    return `${weight} ${unit} (${localTerm})`;
  }
  return `${weight} ${unit}`;
}

/**
 * Get weight options for dropdown based on category
 */
export function getWeightOptions(category: Category): Array<{
  value: string;
  label: string;
  weight: number;
  isCustom?: boolean;
}> {
  const isDairy = category === Category.DAIRY;
  const weights = isDairy ? CANONICAL_WEIGHTS.DAIRY_WEIGHTS : CANONICAL_WEIGHTS.VEG_WEIGHTS;
  const unit = isDairy ? 'ml' : 'g';
  
  return weights.map((w) => ({
    value: (isDairy ? w.ml : w.grams).toString(),
    label: `${isDairy ? w.ml : w.grams} ${unit} (${w.localTerm})`,
    weight: isDairy ? w.ml : w.grams,
  }));
}
