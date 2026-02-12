'use client';

import { useState, useMemo } from 'react';
import { Calculator, Plus, Trash2, RefreshCw, X } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Category, ALL_ITEMS } from '@/lib/sabjirate-seed';
import {
  calculateAllPrices,
  calculateCustomPrice,
  getPriceUnit,
  validateWeightInput,
} from '@/lib/priceCalculator';

interface ShoppingListItem {
  id: string;
  item: { id: string; en: string; hi: string; mr: string };
  pricePerUnit: number;
  calculations: Array<{
    weight: number;
    unit: string;
    localTerm: string;
    localTermHi: string;
    localTermMr: string;
    price: number;
    priceFormatted: string;
    priceHindi: string;
    priceMarathi: string;
  }>;
  customCalculations?: Array<{
    weight: number;
    unit: string;
    price: number;
    priceFormatted: string;
    priceHindi: string;
    priceMarathi: string;
    isCustom: boolean;
  }>;
}

export function PriceCalculator() {
  const [category, setCategory] = useState<Category>(Category.VEGETABLES);
  const [selectedItemId, setSelectedItemId] = useState<string>('');
  const [pricePerUnit, setPricePerUnit] = useState<string>('');
  const [showCustomWeight, setShowCustomWeight] = useState(false);
  const [customWeight, setCustomWeight] = useState<string>('');
  const [customWeightUnit, setCustomWeightUnit] = useState<'g' | 'kg' | 'ml' | 'L'>('g');
  const [shoppingList, setShoppingList] = useState<ShoppingListItem[]>([]);

  const isDairy = category === Category.DAIRY;
  const priceUnit = getPriceUnit(category);

  // Get items for current category
  const categoryItems = useMemo(() => {
    switch (category) {
      case Category.VEGETABLES:
        return ALL_ITEMS.VEGETABLES;
      case Category.FRUITS:
        return ALL_ITEMS.FRUITS;
      case Category.DAIRY:
        return ALL_ITEMS.DAIRY;
      case Category.KIRANA:
        return ALL_ITEMS.KIRANA;
    }
  }, [category]);

  // Get selected item
  const selectedItem = useMemo(() => {
    return categoryItems.find((item) => item.id === selectedItemId);
  }, [categoryItems, selectedItemId]);

  // Calculate all prices when inputs change
  const calculations = useMemo(() => {
    if (!selectedItem || !pricePerUnit) return [];
    const price = parseFloat(pricePerUnit);
    if (isNaN(price)) return [];
    return calculateAllPrices(category, price);
  }, [selectedItem, pricePerUnit, category]);

  // Custom weight calculation
  const customCalculation = useMemo(() => {
    if (!showCustomWeight || !selectedItem || !pricePerUnit || !customWeight) return null;
    const price = parseFloat(pricePerUnit);
    const weight = parseFloat(customWeight);
    if (isNaN(price) || isNaN(weight)) return null;
    return calculateCustomPrice(category, weight, customWeightUnit, price);
  }, [showCustomWeight, selectedItem, pricePerUnit, customWeight, customWeightUnit, category]);

  // Total price of all items
  const grandTotal = useMemo(() => {
    return shoppingList.reduce((sum, item) => {
      const mainItemPrice = item.calculations.find(
        (c) => c.weight === 500 || c.weight === 1000
      );
      return sum + (mainItemPrice?.price || 0);
    }, 0);
  }, [shoppingList]);

  const handleCategoryChange = (newCategory: Category) => {
    setCategory(newCategory);
    setSelectedItemId('');
    setPricePerUnit('');
    setShowCustomWeight(false);
    setCustomWeight('');
    // Auto-set correct unit for custom weight
    setCustomWeightUnit(newCategory === Category.DAIRY ? 'ml' : 'g');
  };

  const handleAddToList = () => {
    if (!selectedItem || !pricePerUnit) return;

    const newItem: ShoppingListItem = {
      id: Date.now().toString(),
      item: selectedItem,
      pricePerUnit: parseFloat(pricePerUnit),
      calculations: [...calculations],
    };

    // Add custom calculation if present
    if (customCalculation) {
      newItem.customCalculations = [customCalculation];
    }

    setShoppingList([...shoppingList, newItem]);
    setSelectedItemId('');
    setPricePerUnit('');
    setShowCustomWeight(false);
    setCustomWeight('');
  };

  const handleRemoveFromList = (id: string) => {
    setShoppingList(shoppingList.filter((item) => item.id !== id));
  };

  const handleClearList = () => {
    setShoppingList([]);
  };

  const handleQuickAddWeight = (calculation: any) => {
    // This could add a specific weight to the list
    // For now, just adding all calculations
  };

  return (
    <div className="space-y-6">
      {/* Calculator Card */}
      <Card className="bg-slate-900/50 border-slate-800 backdrop-blur">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="w-5 h-5 text-lime-400" />
                Price Calculator
              </CardTitle>
              <CardDescription className="text-slate-400">
                Enter price per {priceUnit} to get all weight conversions
              </CardDescription>
            </div>
            <Badge variant="secondary" className="bg-slate-800 text-slate-300">
              {isDairy ? '🥛 Dairy (Liter/ML)' : '🥬 Weight (Gram/Kg)'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Category Selection */}
          <div>
            <label className="text-sm font-medium mb-2 block text-slate-300">
              Select Category
            </label>
            <Select value={category} onValueChange={handleCategoryChange}>
              <SelectTrigger className="bg-slate-800 border-slate-700">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-700">
                <SelectItem value={Category.VEGETABLES}>
                  🥦 Vegetables
                </SelectItem>
                <SelectItem value={Category.FRUITS}>🍎 Fruits</SelectItem>
                <SelectItem value={Category.DAIRY}>🥛 Milk & Dairy</SelectItem>
                <SelectItem value={Category.KIRANA}>🧺 Kirana</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Item Selection */}
          <div>
            <label className="text-sm font-medium mb-2 block text-slate-300">
              Select Item
            </label>
            <Select value={selectedItemId} onValueChange={setSelectedItemId}>
              <SelectTrigger className="bg-slate-800 border-slate-700">
                <SelectValue placeholder="Choose an item..." />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-700 max-h-80 overflow-y-auto">
                {categoryItems.map((item) => (
                  <SelectItem key={item.id} value={item.id}>
                    <div className="flex items-center gap-2">
                      <span className="text-sm">{item.en}</span>
                      <span className="text-xs text-slate-400">({item.hi})</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Price Per Unit Input */}
          <div>
            <label className="text-sm font-medium mb-2 block text-slate-300">
              Price per {priceUnit} (₹)
            </label>
            <Input
              type="number"
              placeholder={`Enter price per ${priceUnit}`}
              value={pricePerUnit}
              onChange={(e) => setPricePerUnit(e.target.value)}
              className="bg-slate-800 border-slate-700 text-white text-lg font-semibold"
            />
          </div>

          {/* Calculations Display */}
          {calculations.length > 0 && selectedItem && (
            <div className="space-y-3">
              <h4 className="font-semibold text-lime-400 flex items-center gap-2">
                <RefreshCw className="w-4 h-4" />
                All Weights for {selectedItem.en}
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[500px] overflow-y-auto pr-2">
                {calculations.map((calc, index) => (
                  <Card
                    key={index}
                    className="bg-slate-800/50 border-slate-700 hover:border-lime-500/50 transition-colors"
                  >
                    <CardContent className="pt-4">
                      <div className="space-y-2">
                        {/* Weight with local term */}
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-lg text-white">
                            {calc.weight} {calc.unit}
                          </span>
                          <Badge variant="outline" className="text-xs bg-slate-900 text-slate-400 border-slate-700">
                            {calc.localTerm}
                          </Badge>
                        </div>
                        {/* Local terms in Hindi and Marathi */}
                        <div className="text-xs text-slate-500">
                          {calc.localTermHi} • {calc.localTermMr}
                        </div>
                        {/* Price */}
                        <div className="space-y-1 pt-2 border-t border-slate-700">
                          <div className="text-2xl font-bold text-lime-400">
                            {calc.priceFormatted}
                          </div>
                          <div className="text-xs text-slate-400 flex gap-2">
                            <span>{calc.priceHindi}</span>
                            <span className="text-slate-600">|</span>
                            <span>{calc.priceMarathi}</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Custom Weight Input */}
          <div className="pt-4 border-t border-slate-700">
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-medium text-slate-300">
                Custom Weight / Quantity
              </label>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowCustomWeight(!showCustomWeight)}
                className="text-slate-400 hover:text-white"
              >
                {showCustomWeight ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
              </Button>
            </div>

            {showCustomWeight && (
              <div className="space-y-3 bg-slate-800/30 p-4 rounded-lg">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Input
                      type="number"
                      placeholder="Weight"
                      value={customWeight}
                      onChange={(e) => setCustomWeight(e.target.value)}
                      className="bg-slate-800 border-slate-700"
                    />
                  </div>
                  <Select
                    value={customWeightUnit}
                    onValueChange={(value: any) => setCustomWeightUnit(value)}
                  >
                    <SelectTrigger className="bg-slate-800 border-slate-700">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700">
                      {isDairy ? (
                        <>
                          <SelectItem value="ml">ml</SelectItem>
                          <SelectItem value="L">Liter (L)</SelectItem>
                        </>
                      ) : (
                        <>
                          <SelectItem value="g">grams (g)</SelectItem>
                          <SelectItem value="kg">kg</SelectItem>
                        </>
                      )}
                    </SelectContent>
                  </Select>
                </div>

                {customCalculation && (
                  <Card className="bg-gradient-to-br from-lime-500/10 to-lime-600/10 border-lime-500/30">
                    <CardContent className="pt-4">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-bold">
                            {customCalculation.weight} {customCalculation.unit}
                          </span>
                          <Badge variant="outline" className="text-xs bg-lime-500/20 text-lime-400 border-lime-500/50">
                            Custom
                          </Badge>
                        </div>
                        <div className="space-y-1 pt-2 border-t border-slate-700">
                          <div className="text-2xl font-bold text-lime-400">
                            {customCalculation.priceFormatted}
                          </div>
                          <div className="text-xs text-slate-400 flex gap-2">
                            <span>{customCalculation.priceHindi}</span>
                            <span className="text-slate-600">|</span>
                            <span>{customCalculation.priceMarathi}</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </div>

          {/* Add to List Button */}
          <Button
            onClick={handleAddToList}
            disabled={!selectedItem || !pricePerUnit}
            className="w-full bg-lime-500 hover:bg-lime-400 text-black font-bold text-lg py-6"
          >
            <Plus className="w-5 h-5 mr-2" />
            Add to Shopping List
          </Button>
        </CardContent>
      </Card>

      {/* Shopping List */}
      {shoppingList.length > 0 && (
        <Card className="bg-slate-900/50 border-slate-800 backdrop-blur">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Shopping List</CardTitle>
                <CardDescription>
                  {shoppingList.length} {shoppingList.length === 1 ? 'item' : 'items'}
                </CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleClearList}
                className="border-slate-700 text-slate-400 hover:bg-slate-800"
              >
                Clear All
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {shoppingList.map((listItem) => {
              const mainCalc = listItem.calculations.find(
                (c) => c.weight === 500 || c.weight === 1000
              );
              return (
                <Card
                  key={listItem.id}
                  className="bg-slate-800/50 border-slate-700"
                >
                  <CardContent className="pt-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="font-semibold text-lg">{listItem.item.en}</div>
                        <div className="text-xs text-slate-400">
                          {listItem.item.hi} • {listItem.item.mr}
                        </div>
                        <div className="text-sm text-slate-500 mt-1">
                          ₹{listItem.pricePerUnit} per {priceUnit}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveFromList(listItem.id)}
                        className="text-slate-400 hover:text-red-400 hover:bg-red-400/10"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>

                    {/* Show 500g/ml price */}
                    {mainCalc && (
                      <div className="pt-3 border-t border-slate-700">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">
                            {mainCalc.weight} {mainCalc.unit} ({mainCalc.localTerm})
                          </span>
                          <span className="text-lg font-bold text-lime-400">
                            {mainCalc.priceFormatted}
                          </span>
                        </div>
                        <div className="text-xs text-slate-400">
                          {mainCalc.priceHindi} • {mainCalc.priceMarathi}
                        </div>
                      </div>
                    )}

                    {/* Custom calculation */}
                    {listItem.customCalculations &&
                      listItem.customCalculations.length > 0 &&
                      listItem.customCalculations.map((custom, idx) => (
                        <div key={idx} className="pt-2 border-t border-slate-700/50">
                          <div className="flex items-center justify-between">
                            <span className="text-sm">
                              {custom.weight} {custom.unit} (Custom)
                            </span>
                            <span className="font-bold text-lime-400">
                              {custom.priceFormatted}
                            </span>
                          </div>
                          <div className="text-xs text-slate-400">
                            {custom.priceHindi} • {custom.priceMarathi}
                          </div>
                        </div>
                      ))}
                  </CardContent>
                </Card>
              );
            })}

            {/* Grand Total */}
            <Card className="bg-gradient-to-br from-lime-500/10 to-lime-600/10 border-lime-500/30">
              <CardContent className="pt-4">
                <div className="flex items-center justify-between">
                  <span className="font-semibold">Grand Total (500{isDairy ? 'ml' : 'g'} or 1{isDairy ? 'L' : 'kg'} each)</span>
                  <span className="text-2xl font-bold text-lime-400">
                    ₹{grandTotal.toFixed(2)}
                  </span>
                </div>
              </CardContent>
            </Card>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
