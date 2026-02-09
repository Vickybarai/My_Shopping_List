'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Calculator, Plus, Trash2 } from 'lucide-react';
import type { CategoryLower, CalculationResult } from '@/types/sabjirate';
import { getAllowedWeights, formatWeight, formatBaseUnit } from '@/types/sabjirate';

interface WeightCalculatorProps {
  category: CategoryLower;
}

export function WeightCalculator({ category }: WeightCalculatorProps) {
  const [products, setProducts] = useState<any[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<string>('');
  const [selectedWeight, setSelectedWeight] = useState<string>('');
  const [pricePerUnit, setPricePerUnit] = useState<string>('');
  const [calculations, setCalculations] = useState<CalculationResult[]>([]);

  // Category mapping
  const categoryMap: Record<CategoryLower, 'VEGETABLES' | 'FRUITS' | 'DAIRY' | 'KIRANA'> = {
    vegetables: 'VEGETABLES',
    fruits: 'FRUITS',
    dairy: 'DAIRY',
    kirana: 'KIRANA',
  };

  const currentCategory = categoryMap[category];
  const allowedWeights = getAllowedWeights(currentCategory);
  const isDairy = currentCategory === 'DAIRY';
  
  // Derive total amount from calculations
  const totalAmount = calculations.reduce((sum, calc) => sum + calc.totalPrice, 0);

  useEffect(() => {
    async function fetchProducts() {
      try {
        const response = await fetch(`/api/products?category=${category}`);
        if (response.ok) {
          const data = await response.json();
          setProducts(data);
        }
      } catch (error) {
        console.error('Error fetching products:', error);
      }
    }
    fetchProducts();
  }, [category]);

  function handleAddCalculation() {
    if (!selectedProduct || !selectedWeight || !pricePerUnit) {
      return;
    }

    const product = products.find(p => p.id === selectedProduct);
    if (!product) return;

    const weight = parseFloat(selectedWeight);
    const price = parseFloat(pricePerUnit);
    
    // STRICT BUSINESS LOGIC
    let totalPrice: number;
    if (isDairy) {
      // Dairy: ML to L conversion
      const liters = weight / 1000;
      totalPrice = liters * price;
    } else {
      // Vegetables/Kirana: Grams to Kg conversion
      const kg = weight / 1000;
      totalPrice = kg * price;
    }

    const newCalculation: CalculationResult = {
      productId: product.id,
      productName: product.nameEn,
      category: currentCategory,
      quantity: weight,
      unit: isDairy ? 'ml' : 'g',
      pricePerUnit: price,
      totalPrice: parseFloat(totalPrice.toFixed(2)),
    };

    setCalculations([...calculations, newCalculation]);
    setSelectedProduct('');
    setSelectedWeight('');
    setPricePerUnit('');
  }

  function handleRemoveCalculation(index: number) {
    setCalculations(calculations.filter((_, i) => i !== index));
  }

  function handleClearAll() {
    setCalculations([]);
  }

  return (
    <Card className="p-6 bg-[#121212] border-[#1e1e1e]">
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <Calculator className="w-5 h-5 text-[#ccff00]" />
          <h3 className="font-semibold">Price Calculator</h3>
        </div>

        <div className="space-y-3">
          {/* Product Selection */}
          <div>
            <label className="text-sm text-gray-400 mb-1 block">Select Product</label>
            <Select value={selectedProduct} onValueChange={setSelectedProduct}>
              <SelectTrigger className="bg-[#0a0a0a] border-[#1e1e1e]">
                <SelectValue placeholder="Choose a product..." />
              </SelectTrigger>
              <SelectContent className="bg-[#0a0a0a] border-[#1e1e1e]">
                {products.map((product) => (
                  <SelectItem key={product.id} value={product.id}>
                    {product.nameEn}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Weight Selection - Category Specific */}
          <div>
            <label className="text-sm text-gray-400 mb-1 block">
              Select Weight ({isDairy ? 'ML' : 'Grams'})
            </label>
            <Select value={selectedWeight} onValueChange={setSelectedWeight}>
              <SelectTrigger className="bg-[#0a0a0a] border-[#1e1e1e]">
                <SelectValue placeholder="Choose weight..." />
              </SelectTrigger>
              <SelectContent className="bg-[#0a0a0a] border-[#1e1e1e]">
                {allowedWeights.map((weight) => (
                  <SelectItem key={weight} value={weight.toString()}>
                    {formatWeight(weight, currentCategory)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Price Per Unit */}
          <div>
            <label className="text-sm text-gray-400 mb-1 block">
              Price per {formatBaseUnit(isDairy ? 'LITER' : 'KILOGRAM')} (₹)
            </label>
            <Input
              type="number"
              placeholder={`Enter price per ${isDairy ? 'liter' : 'kg'}`}
              value={pricePerUnit}
              onChange={(e) => setPricePerUnit(e.target.value)}
              className="bg-[#0a0a0a] border-[#1e1e1e]"
            />
          </div>

          {/* Add Button */}
          <Button
            onClick={handleAddCalculation}
            disabled={!selectedProduct || !selectedWeight || !pricePerUnit}
            className="w-full bg-[#ccff00] text-black hover:bg-[#b3e600] font-semibold"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add to Calculation
          </Button>
        </div>

        {/* Calculation Results */}
        {calculations.length > 0 && (
          <div className="mt-6 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-sm">Calculations</h4>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearAll}
                className="text-gray-400 hover:text-white"
              >
                <Trash2 className="w-4 h-4 mr-1" />
                Clear All
              </Button>
            </div>

            <div className="space-y-2 max-h-64 overflow-y-auto">
              {calculations.map((calc, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-[#0a0a0a] rounded-lg border border-[#1e1e1e]"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{calc.productName}</p>
                    <p className="text-xs text-gray-400">
                      {calc.quantity} {calc.unit} @ ₹{calc.pricePerUnit}/{isDairy ? 'L' : 'kg'}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="font-semibold text-[#ccff00]">₹{calc.totalPrice.toFixed(2)}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveCalculation(index)}
                      className="text-gray-400 hover:text-red-400"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-[#1e1e1e]">
              <div className="flex items-center justify-between">
                <span className="font-semibold">Total Amount</span>
                <span className="text-2xl font-bold text-[#ccff00]">
                  ₹{totalAmount.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
