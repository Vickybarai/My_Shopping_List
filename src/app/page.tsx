'use client';

// SabjiRate - Main Application Component
import { useState, useEffect } from 'react';
import { Calculator, ShoppingCart, Home as HomeIcon, Clock, Trash2, X, Plus, Check, Search, ArrowLeft, Sun, Moon, AlertTriangle } from 'lucide-react';
import { Category, SubCategory, CATEGORY_INFO, ALL_ITEMS, KIRANA_GRAINS, KIRANA_PULSES, KIRANA_SWEETENERS, KIRANA_OILS, KIRANA_BEVERAGES, KIRANA_BREAKFAST, KIRANA_SPICES, KIRANA_DRY_FRUITS } from '@/lib/sabjirate-seed';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useTheme } from 'next-themes';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';

type View = 'home' | 'lists' | 'history';

interface ListItem {
  id: string;
  itemId: number;
  name: string;
  nameHi: string;
  nameMr: string;
  category: Category;
  quantity: {
    grams?: number;
    ml?: number;
    name: string;
    nameHi: string;
    nameMr: string;
  };
  price: string;
  calculatedPrices: {
    weight: string;
    nameHi: string;
    nameMr: string;
    grams?: number;
    ml?: number;
    price: number;
    wordsHi: string;
    wordsMr: string;
  }[];
}

interface ShoppingList {
  id: string;
  name: string;
  createdAt: Date;
  items: ListItem[];
  category: Category;
}

const INDIAN_WEIGHTS = [
  { grams: 62.5, name: 'Adha Chatak', nameHi: 'आधा चटक', nameMr: 'अर्धा छटक' },
  { grams: 125, name: '1 Chatak', nameHi: 'एक चटक', nameMr: 'एक छटक' },
  { grams: 250, name: 'Pav', nameHi: 'पाव', nameMr: 'पाव' },
  { grams: 375, name: 'Dedh Pav', nameHi: 'डेढ़ पाव', nameMr: 'डेढ पाव' },
  { grams: 500, name: 'Half Kilo', nameHi: 'आधा किलो', nameMr: 'अर्धा किलो' },
  { grams: 750, name: 'Paune Kilo', nameHi: 'पौने किलो', nameMr: 'पावणे किलो' },
  { grams: 1000, name: '1 Kilo', nameHi: 'एक किलो', nameMr: 'एक किलो' },
];

const DAIRY_QUANTITIES = [
  { ml: 250, name: '250 ml', nameHi: '250 मिली', nameMr: '250 मिली' },
  { ml: 500, name: '500 ml', nameHi: '500 मिली', nameMr: '500 मिली' },
  { ml: 750, name: '750 ml', nameHi: '750 मिली', nameMr: '750 मिली' },
  { ml: 1000, name: '1 Liter', nameHi: '1 लीटर', nameMr: '1 लिटर' },
];

// Fixed numberToWords function - no paise, only rupees
const numberToWords = (num: number): { hi: string; mr: string } => {
  const numInt = Math.floor(num);

  if (numInt === 0) return { hi: 'शून्य', mr: 'शून्या' };

  const units = ['', 'एक', 'दो', 'तीन', 'चार', 'पाँच', 'छह', 'सात', 'आठ', 'नौ', 'दस'];
  const tens = ['', 'दस', 'बीस', 'तीस', 'चालीस', 'पचास', 'साठ', 'सत्तर', 'अस्सी', 'नब्बे'];

  const unitsMr = ['', 'एक', 'दोन', 'तीन', 'चार', 'पाच', 'सहा', 'सात', 'आठ', 'नव', 'दहा'];
  const tensMr = ['', 'वीस', 'बीस', 'तीस', 'चाळीस', 'पन्नास', 'साठ', 'सत्तर', 'अस्सी', 'नव्व्या'];

  let hi = '';
  let mr = '';

  if (numInt >= 100) {
    const hundredDigit = Math.floor(numInt / 100);
    const remainder = numInt % 100;

    if (hundredDigit === 1) {
      hi += 'सौ';
      mr += 'शंभर';
    } else if (hundredDigit === 2) {
      hi += 'दो सौ';
      mr += 'दोन शे';
    } else {
      hi += `${units[hundredDigit]} सौ`;
      mr += `${unitsMr[hundredDigit]}शे`;
    }

    if (remainder > 0) {
      hi += ' ';
      mr += ' ';
      if (remainder < 10) {
        hi += units[remainder];
        mr += unitsMr[remainder];
      } else if (remainder < 20) {
        const teensHi = ['दस', 'ग्यारह', 'बारह', 'तेरह', 'चौदह', 'पन्द्रह', 'सोलह', 'सत्रह', 'अठारह', 'उन्नीस'];
        const teensMr = ['दहा', 'अकरा', 'बारा', 'तेरा', 'चौदा', 'पंधरा', 'सोळा', 'सत्रा', 'अठरा', 'एकोणीस'];
        const index = remainder - 10;
        hi += teensHi[index];
        mr += teensMr[index];
      } else {
        const tensDigit = Math.floor(remainder / 10);
        const unitDigit = remainder % 10;
        hi += (unitDigit > 0 ? `${units[unitDigit]} ${tens[tensDigit - 1]}` : tens[tensDigit - 1]);
        mr += (unitDigit > 0 ? `${unitsMr[unitDigit]} ${tensMr[tensDigit - 1]}` : tensMr[tensDigit - 1]);
      }
    }
  } else {
    if (numInt < 10) {
      hi += units[numInt];
      mr += unitsMr[numInt];
    } else if (numInt < 20) {
      const teensHi = ['दस', 'ग्यारह', 'बारह', 'तेरह', 'चौदह', 'पन्द्रह', 'सोलह', 'सत्रह', 'अठारह', 'उन्नीस'];
      const teensMr = ['दहा', 'अकरा', 'बारा', 'तेरा', 'चौदा', 'पंधरा', 'सोळा', 'सत्रा', 'अठरा', 'एकोणीस'];
      hi += teensHi[numInt - 10];
      mr += teensMr[numInt - 10];
    } else {
      const tensDigit = Math.floor(numInt / 10);
      const unitDigit = numInt % 10;
      hi += (unitDigit > 0 ? `${units[unitDigit]} ${tens[tensDigit - 1]}` : tens[tensDigit - 1]);
      mr += (unitDigit > 0 ? `${unitsMr[unitDigit]} ${tensMr[tensDigit - 1]}` : tensMr[tensDigit - 1]);
    }
  }

  return { hi, mr };
};

// Main SabjiRate Component
export default function SabjiRateApp() {
  const { theme, setTheme } = useTheme();
  
  // View state
  const [currentView, setCurrentView] = useState<View>('home');
  const [activeCategory, setActiveCategory] = useState<Category | null>(null);
  const [activeSubCategory, setActiveSubCategory] = useState<SubCategory | null>(null);
  
  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  
  // Calculator state
  const [showCalculator, setShowCalculator] = useState(false);
  const [calculatorItem, setCalculatorItem] = useState<any>(null);
  const [calculatorPrice, setCalculatorPrice] = useState('');
  const [calculatorQuantity, setCalculatorQuantity] = useState<any>(null);
  
  // List management state
  const [selectedItems, setSelectedItems] = useState<Set<number>>(new Set());
  const [shoppingLists, setShoppingLists] = useState<ShoppingList[]>(() => {
    if (typeof window !== 'undefined') {
      const savedLists = localStorage.getItem('shoppingLists');
      return savedLists ? JSON.parse(savedLists) : [];
    }
    return [];
  });
  const [deletedLists, setDeletedLists] = useState<ShoppingList[]>(() => {
    if (typeof window !== 'undefined') {
      const savedDeletedLists = localStorage.getItem('deletedLists');
      return savedDeletedLists ? JSON.parse(savedDeletedLists) : [];
    }
    return [];
  });
  const [currentList, setCurrentList] = useState<ShoppingList | null>(null);
  const [editingItem, setEditingItem] = useState<ListItem | null>(null);
  
  // Delete confirmation
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [listToDelete, setListToDelete] = useState<string | null>(null);

  // Swipe gesture state
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null);

  // Mounted state for hydration fix
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  // Save lists to localStorage when they change
  useEffect(() => {
    if (mounted && typeof window !== 'undefined') {
      localStorage.setItem('shoppingLists', JSON.stringify(shoppingLists));
      localStorage.setItem('deletedLists', JSON.stringify(deletedLists));
    }
  }, [shoppingLists, deletedLists, mounted]);

  const categories = [
    { key: Category.VEG_FRUITS, title: '🥬🍎 Fruits & Vegetables', icon: '🥬', count: 70 },
    { key: Category.DAIRY, title: '🥛 Milk & Dairy', icon: '🥛', count: 9 },
    { key: Category.KIRANA, title: '🧺 Kirana / Grocery', icon: '🧺', count: 44 },
  ];

  const getFilteredItems = () => {
    if (!activeCategory) return [];

    const query = searchQuery.toLowerCase();

    // Handle VEG_FRUITS category with subcategories
    if (activeCategory === Category.VEG_FRUITS) {
      // If searching, search across both subcategories
      if (query) {
        const allItems = [...ALL_ITEMS.VEGETABLES, ...ALL_ITEMS.FRUITS];
        return allItems.filter((item: any) =>
          item.en.toLowerCase().includes(query) ||
          item.hi.includes(query) ||
          item.mr.includes(query)
        );
      }
      // If not searching and subcategory is selected, return that subcategory's items
      if (activeSubCategory) {
        return activeSubCategory === SubCategory.VEGETABLES ? ALL_ITEMS.VEGETABLES : ALL_ITEMS.FRUITS;
      }
      // If no subcategory selected yet, return empty (will show subcategory selection UI)
      return [];
    }

    // Handle KIRANA category with subcategories
    if (activeCategory === Category.KIRANA) {
      // If searching, search across all subcategories
      if (query) {
        const allItems = [...KIRANA_GRAINS, ...KIRANA_PULSES, ...KIRANA_SWEETENERS, ...KIRANA_OILS, ...KIRANA_BEVERAGES, ...KIRANA_BREAKFAST, ...KIRANA_SPICES, ...KIRANA_DRY_FRUITS];
        return allItems.filter((item: any) =>
          item.en.toLowerCase().includes(query) ||
          item.hi.includes(query) ||
          item.mr.includes(query)
        );
      }
      // If not searching and subcategory is selected, return that subcategory's items
      if (activeSubCategory) {
        switch (activeSubCategory) {
          case SubCategory.KIRANA_GRAINS:
            return KIRANA_GRAINS;
          case SubCategory.KIRANA_PULSES:
            return KIRANA_PULSES;
          case SubCategory.KIRANA_SWEETENERS:
            return KIRANA_SWEETENERS;
          case SubCategory.KIRANA_OILS:
            return KIRANA_OILS;
          case SubCategory.KIRANA_BEVERAGES:
            return KIRANA_BEVERAGES;
          case SubCategory.KIRANA_BREAKFAST:
            return KIRANA_BREAKFAST;
          case SubCategory.KIRANA_SPICES:
            return KIRANA_SPICES;
          case SubCategory.KIRANA_DRY_FRUITS:
            return KIRANA_DRY_FRUITS;
          default:
            return [];
        }
      }
      // If no subcategory selected yet, return empty (will show subcategory selection UI)
      return [];
    }

    // For other categories (DAIRY)
    const items = ALL_ITEMS.DAIRY;

    if (!query) return items;

    return items.filter((item: any) =>
      item.en.toLowerCase().includes(query) ||
      item.hi.includes(query) ||
      item.mr.includes(query)
    );
  };

  const toggleItemSelection = (itemId: number) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(itemId)) {
      newSelected.delete(itemId);
    } else {
      newSelected.add(itemId);
    }
    setSelectedItems(newSelected);
  };

  const createList = () => {
    if (selectedItems.size === 0) return;
    
    const now = new Date();
    const listName = `List - ${now.toLocaleDateString()} ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    
    const items = getFilteredItems().filter((item: any) => selectedItems.has(item.id)).map((item: any) => ({
      id: `${item.id}-${Date.now()}`,
      itemId: item.id,
      name: item.en,
      nameHi: item.hi,
      nameMr: item.mr,
      category: activeCategory!,
      quantity: {
        grams: undefined,
        ml: undefined,
        name: 'Not selected',
        nameHi: 'चयन नहीं',
        nameMr: 'निवडले नाही',
      },
      price: '',
      calculatedPrices: [],
    }));

    const newList: ShoppingList = {
      id: `list-${Date.now()}`,
      name: listName,
      createdAt: now,
      items,
      category: activeCategory!,
    };

    setShoppingLists([newList, ...shoppingLists]);
    setSelectedItems(new Set());
    setActiveCategory(null);
    setActiveSubCategory(null);
    setCurrentView('lists');
    setCurrentList(newList);
  };

  const calculateAllPrices = (price: number, quantity: any) => {
    const allQuantities = activeCategory === Category.DAIRY ? DAIRY_QUANTITIES : INDIAN_WEIGHTS;
    const quantityGrams = quantity.grams || quantity.ml || 1;
    const pricePerUnit = price / (quantityGrams / 1000);

    return allQuantities.map(q => {
      const gramsOrMl = q.grams || q.ml;
      const calculatedPrice = (gramsOrMl / 1000) * pricePerUnit;
      const words = numberToWords(calculatedPrice);
      return {
        weight: q.name,
        nameHi: q.nameHi,
        nameMr: q.nameMr,
        grams: q.grams,
        ml: q.ml,
        price: calculatedPrice,
        wordsHi: words.hi,
        wordsMr: words.mr,
      };
    });
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    setTouchStart({ x: touch.clientX, y: touch.clientY });
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!touchStart) return;
    const deltaX = e.touches[0].clientX - touchStart.x;
    const deltaY = Math.abs(e.touches[0].clientY - touchStart.y);
    
    // Detect horizontal swipe (left swipe = back)
    if (deltaX > 100 && deltaY < 50) {
      e.preventDefault();
      if (activeCategory) {
        // Close category view
        setActiveCategory(null);
        setActiveSubCategory(null);
        setSelectedItems(new Set());
        setSearchQuery('');
      } else if (currentList) {
        // Go back to lists
        setCurrentList(null);
      }
    }
  };

  const handleTouchEnd = () => {
    setTouchStart(null);
  };

  // Calculate total cost of all items in current list
  const calculateTotalCost = () => {
    if (!currentList || currentList.items.length === 0) return 0;
    let total = 0;
    currentList.items.forEach(item => {
      if (item.price && item.quantity) {
        const price = parseFloat(item.price);
        const quantityGrams = item.quantity.grams || item.quantity.ml || 1;
        const pricePerKg = (price / (quantityGrams / 1000));
        total += pricePerKg; // Sum of 1KG prices
      }
    });
    return total;
  };

  return (
    <div
      className="min-h-screen flex flex-col bg-gradient-to-br from-slate-100 via-white to-slate-100 dark:bg-gradient-to-br dark:from-slate-950 dark:via-black dark:to-slate-950"
      style={{ fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, "Noto Sans Devanagari", sans-serif' }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Header */}
      <header className="sticky top-0 z-40 backdrop-blur-lg border-b bg-white/80 border-slate-300 dark:bg-black/80 dark:border-slate-800">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {activeCategory && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => { setActiveCategory(null); setActiveSubCategory(null); setSelectedItems(new Set()); setSearchQuery(''); }}
                  className="text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white"
                >
                  <ArrowLeft className="w-4 h-4" />
                </Button>
              )}
              <h1 className="text-2xl font-extrabold tracking-tight bg-gradient-to-r from-lime-400 to-lime-600 bg-clip-text text-transparent">
                SabjiRate
              </h1>
            </div>
            <div className="flex gap-2 items-center">
              {mounted && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                  className="border-slate-400 text-slate-600 hover:bg-slate-200 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
                >
                  {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                </Button>
              )}
              {activeCategory && selectedItems.size > 0 && (
                <Button
                  size="sm"
                  onClick={createList}
                  className="bg-lime-500 hover:bg-lime-600 text-black font-medium"
                >
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  Create List ({selectedItems.size})
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-6 pb-24 overflow-y-auto">
        {activeCategory ? (
          // Category View
          <div>
            {(!activeSubCategory && (activeCategory === Category.VEG_FRUITS || activeCategory === Category.KIRANA)) ? (
              // Subcategory Selection View
              <div>
                <div className="mb-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => { setActiveCategory(null); setSelectedItems(new Set()); setSearchQuery(''); }}
                    className="text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </Button>
                </div>
                <h2 className="text-2xl font-bold mb-6 text-slate-900 dark:text-white">
                  {activeCategory === Category.VEG_FRUITS && '🥬🍎 Fruits & Vegetables'}
                  {activeCategory === Category.KIRANA && '🧺 Kirana / Grocery'}
                </h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                  Select a subcategory
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {activeCategory === Category.VEG_FRUITS && CATEGORY_INFO[Category.VEG_FRUITS].subcategories.map((sub) => (
                    <Card
                      key={sub.key}
                      onClick={() => { setActiveSubCategory(sub.key); setSelectedItems(new Set()); setSearchQuery(''); }}
                      className="cursor-pointer transition-all hover:scale-105 bg-slate-100 border-slate-200 hover:border-lime-500 dark:bg-slate-800/50 dark:border-slate-700 dark:hover:border-lime-500"
                    >
                      <CardContent className="p-6">
                        <div>
                          <h3 className="text-xl font-bold text-slate-900 dark:text-white">{sub.title}</h3>
                          <p className="text-sm text-slate-500 dark:text-slate-400">{sub.count} items</p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  {activeCategory === Category.KIRANA && CATEGORY_INFO[Category.KIRANA].subcategories.map((sub) => (
                    <Card
                      key={sub.key}
                      onClick={() => { setActiveSubCategory(sub.key); setSelectedItems(new Set()); setSearchQuery(''); }}
                      className="cursor-pointer transition-all hover:scale-105 bg-slate-100 border-slate-200 hover:border-lime-500 dark:bg-slate-800/50 dark:border-slate-700 dark:hover:border-lime-500"
                    >
                      <CardContent className="p-6">
                        <div>
                          <h3 className="text-xl font-bold text-slate-900 dark:text-white">{sub.title}</h3>
                          <p className="text-sm text-slate-500 dark:text-slate-400">{sub.count} items</p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ) : (
              // Items View
              <div>
                <div className="mb-4">
                  {activeSubCategory && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => { setActiveSubCategory(null); setSelectedItems(new Set()); setSearchQuery(''); }}
                      className="text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white"
                    >
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Back to Subcategories
                    </Button>
                  )}
                  <h2 className="text-2xl font-bold mb-1 text-slate-900 dark:text-white">
                    {activeSubCategory === SubCategory.VEGETABLES && '🥬 Vegetables'}
                    {activeSubCategory === SubCategory.FRUITS && '🍎 Fruits'}
                    {activeCategory === Category.DAIRY && '🥛 Milk & Dairy'}
                    {activeSubCategory === SubCategory.KIRANA_GRAINS && '🌾 Grains'}
                    {activeSubCategory === SubCategory.KIRANA_PULSES && '🫘 Pulses'}
                    {activeSubCategory === SubCategory.KIRANA_SWEETENERS && '🍬 Sweeteners'}
                    {activeSubCategory === SubCategory.KIRANA_OILS && '🫒 Oils'}
                    {activeSubCategory === SubCategory.KIRANA_BEVERAGES && '☕ Beverages'}
                    {activeSubCategory === SubCategory.KIRANA_BREAKFAST && '🥣 Breakfast'}
                    {activeSubCategory === SubCategory.KIRANA_SPICES && '🌶 Spices'}
                    {activeSubCategory === SubCategory.KIRANA_DRY_FRUITS && '🥜 Dry Fruits'}
                  </h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Select items to create a shopping list
                  </p>
                </div>

                <div className="mb-4 relative text-slate-900 dark:text-white">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <Input
                    type="text"
                    placeholder="Search items..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 bg-white border-slate-300 text-slate-900 placeholder:text-slate-400 dark:bg-slate-800 dark:border-slate-700 dark:text-white dark:placeholder:text-slate-500"
                  />
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {getFilteredItems().map((item: any) => (
                    <Card
                      key={item.id}
                      onClick={() => toggleItemSelection(item.id)}
                      className={`cursor-pointer transition-all ${
                        selectedItems.has(item.id)
                          ? 'border-lime-500 bg-lime-500/10'
                          : 'bg-slate-100 border-slate-200 hover:border-slate-300 dark:bg-slate-800/50 dark:border-slate-700 dark:hover:border-slate-600'
                      }`}
                    >
                      <CardContent className="p-4">
                        <div className="text-center">
                          <div className="text-3xl mb-2">
                            {activeSubCategory === SubCategory.VEGETABLES && '🥬'}
                            {activeSubCategory === SubCategory.FRUITS && '🍎'}
                            {activeCategory === Category.DAIRY && '🥛'}
                            {activeCategory === Category.KIRANA && '🧺'}
                          </div>
                          <p className="font-semibold text-sm mb-1 text-slate-900 dark:text-white">{item.en}</p>
                          <p className="text-xs mb-1 text-slate-600 dark:text-slate-200">{item.hi}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-300">{item.mr}</p>
                          {selectedItems.has(item.id) && (
                            <Badge className="mt-2 bg-lime-500 text-black">✓ Selected</Badge>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : currentList ? (
          // List Detail View
          <div>
            <div className="mb-6">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCurrentList(null)}
                className="mb-4 text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Lists
              </Button>
              <h2 className="text-2xl font-bold mb-1 text-slate-900 dark:text-white">
                {currentList.name}
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {currentList.items.length} items
              </p>
            </div>

            <div className="space-y-3">
              {currentList.items.map((item) => (
                <Card
                  key={item.id}
                  className="bg-slate-100 border-slate-200 dark:bg-slate-800/50 dark:border-slate-700"
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className="font-semibold text-slate-900 dark:text-white">{item.name}</p>
                        <p className="text-sm text-slate-600 dark:text-slate-300">{item.nameHi} | {item.nameMr}</p>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => { setEditingItem(item); openCalculator(); }}
                        className="border-slate-300 text-slate-600 dark:border-slate-600 dark:text-slate-300"
                      >
                        {item.price ? 'Edit Price' : 'Add Price'}
                      </Button>
                    </div>

                    {item.price && item.quantity && (
                      <div className="p-3 rounded-lg bg-slate-200 dark:bg-slate-900/50">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm text-slate-600 dark:text-slate-300">
                            Base: {item.quantity.name} @ ₹{item.price}
                          </span>
                          <span className="text-lg font-bold text-lime-500">
                            1 {activeCategory === Category.DAIRY && item.quantity.ml === 1000 ? 'Liter' : 'KG'} = ₹{((parseFloat(item.price) / ((item.quantity.grams || item.quantity.ml) / 1000))).toFixed(2)}
                          </span>
                        </div>

                        {item.calculatedPrices.length > 0 && (
                          <div className="space-y-2 mt-3 max-h-48 overflow-y-auto">
                            {item.calculatedPrices.map((cp, idx) => (
                              <div key={idx} className="flex justify-between items-center text-sm p-2 rounded bg-slate-100 dark:bg-slate-800">
                                <span className="text-slate-600 dark:text-slate-300">{cp.weight}</span>
                                <span className="font-semibold text-lime-500">₹{cp.price.toFixed(2)}</span>
                                <span className="text-xs text-slate-500 dark:text-slate-400">
                                  {cp.wordsHi} रुपये | {cp.wordsMr} रुपये
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}

              {/* Total Price Section */}
              {currentList.items.some(item => item.price && item.quantity) && (
                <div className="mt-6 p-4 rounded-lg bg-lime-100 border border-lime-300 dark:bg-lime-900/30 dark:border-lime-700">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold text-slate-900 dark:text-white">
                      Total Cost (1 KG prices)
                    </span>
                    <span className="text-2xl font-bold text-lime-600 dark:text-lime-400">
                      ₹{calculateTotalCost().toFixed(2)}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : currentView === 'home' ? (
          // Home View - Categories Only
          <div>
            <h2 className="text-2xl font-bold mb-6 text-slate-900 dark:text-white">
              Browse Categories
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {categories.map((cat) => (
                <Card
                  key={cat.key}
                  onClick={() => { setActiveCategory(cat.key); setSelectedItems(new Set()); setSearchQuery(''); }}
                  className="cursor-pointer transition-all hover:scale-105 bg-slate-100 border-slate-200 hover:border-lime-500 dark:bg-slate-800/50 dark:border-slate-700 dark:hover:border-lime-500"
                >
                  <CardContent className="p-6">
                    <div>
                      <h3 className="text-xl font-bold text-slate-900 dark:text-white">{cat.title}</h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400">{cat.count} items</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ) : currentView === 'lists' ? (
          // Lists View
          <div>
            <h2 className="text-2xl font-bold mb-6 text-slate-900 dark:text-white">
              Shopping Lists
            </h2>
            {shoppingLists.length === 0 ? (
              <div className="text-center py-12 text-slate-500 dark:text-slate-400">
                <ShoppingCart className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg mb-2">No lists yet</p>
                <p className="text-sm">Select items from a category to create a list</p>
              </div>
            ) : (
              <div className="space-y-3">
                {shoppingLists.map((list) => (
                  <Card
                    key={list.id}
                    onClick={() => setCurrentList(list)}
                    className="cursor-pointer transition-all hover:scale-[1.02] bg-slate-100 border-slate-200 hover:border-lime-500 dark:bg-slate-800/50 dark:border-slate-700 dark:hover:border-lime-500"
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold text-slate-900 dark:text-white">{list.name}</h3>
                          <p className="text-sm text-slate-500 dark:text-slate-400">
                            {list.items.length} items • Created {new Date(list.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className="bg-slate-200 text-slate-900 dark:bg-slate-700 dark:text-white">
                            {list.category}
                          </Badge>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => { setShowDeleteConfirm(true); setListToDelete(list.id); }}
                            className="ml-2"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        ) : (
          // History View
          <div>
            <h2 className="text-2xl font-bold mb-6 text-slate-900 dark:text-white">
              Deleted Lists History
            </h2>
            {deletedLists.length === 0 ? (
              <div className="text-center py-12 text-slate-500 dark:text-slate-400">
                <Clock className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg mb-2">No deleted lists</p>
                <p className="text-sm">Deleted lists will appear here</p>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex justify-between items-center mb-4">
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    {deletedLists.length} deleted lists
                  </p>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => { setDeletedLists([]); if (typeof window !== 'undefined') localStorage.removeItem('deletedLists'); }}
                    className="bg-red-500 hover:bg-red-600 text-white"
                  >
                    Clear History
                  </Button>
                </div>
                {deletedLists.map((list) => (
                  <Card
                    key={list.id}
                    className="bg-slate-100 border-slate-200 dark:bg-slate-800/50 dark:border-slate-700"
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold text-slate-900 dark:text-white">{list.name}</h3>
                          <p className="text-sm text-slate-500 dark:text-slate-400">
                            {list.items.length} items • Deleted {new Date(list.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <Badge className="bg-red-500/20 text-red-500 border-red-500/30">Deleted</Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Floating Calculator Icon */}
      <div className="fixed bottom-24 right-4 z-50">
        <Button
          size="lg"
          onClick={() => openCalculator()}
          className="rounded-full w-14 h-14 bg-lime-500 hover:bg-lime-600 text-black shadow-lg"
        >
          <Calculator className="w-6 h-6" />
        </Button>
      </div>

      {/* Delete List Icon in Current List */}
      {currentList && (
        <div className="fixed bottom-24 left-4 z-50">
          <Button
            size="lg"
            variant="destructive"
            onClick={() => { setShowDeleteConfirm(true); setListToDelete(currentList.id); }}
            className="rounded-full w-12 h-12 shadow-lg"
          >
            <Trash2 className="w-5 h-5" />
          </Button>
        </div>
      )}

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 border-t backdrop-blur-lg bg-white/80 border-slate-300 dark:bg-black/80 dark:border-slate-800">
        <div className="container mx-auto px-4">
          <div className="flex justify-around py-2">
            <Button
              variant="ghost"
              onClick={() => { setCurrentView('home'); setActiveCategory(null); setActiveSubCategory(null); setCurrentList(null); }}
              className={`flex-1 flex-col gap-1 ${currentView === 'home' ? 'text-lime-500' : 'text-slate-600 dark:text-slate-400'}`}
            >
              <HomeIcon className="w-5 h-5" />
              <span className="text-xs">Home</span>
            </Button>
            <Button
              variant="ghost"
              onClick={() => { setCurrentView('lists'); setActiveCategory(null); setActiveSubCategory(null); setCurrentList(null); }}
              className={`flex-1 flex-col gap-1 ${currentView === 'lists' ? 'text-lime-500' : 'text-slate-600 dark:text-slate-400'}`}
            >
              <ShoppingCart className="w-5 h-5" />
              <span className="text-xs">Lists</span>
            </Button>
            <Button
              variant="ghost"
              onClick={() => { setCurrentView('history'); setActiveCategory(null); setActiveSubCategory(null); setCurrentList(null); }}
              className={`flex-1 flex-col gap-1 ${currentView === 'history' ? 'text-lime-500' : 'text-slate-600 dark:text-slate-400'}`}
            >
              <Clock className="w-5 h-5" />
              <span className="text-xs">History</span>
            </Button>
          </div>
        </div>
      </nav>

      {/* Calculator Dialog */}
      <Dialog open={showCalculator} onOpenChange={setShowCalculator}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white border-slate-300 dark:bg-slate-900 dark:border-slate-700">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle className="text-xl text-slate-900 dark:text-white">
                  {calculatorItem ? calculatorItem.en : 'Price Calculator'}
                </DialogTitle>
                {calculatorItem && (
                  <p className="text-sm mt-1 text-slate-500 dark:text-slate-400">
                    {calculatorItem.hi} | {calculatorItem.mr}
                  </p>
                )}
              </div>
              {calculatorItem && (
                <div className="text-3xl">
                  {activeCategory === Category.VEG_FRUITS && (
                    activeSubCategory === SubCategory.VEGETABLES ? '🥬' : '🍎'
                  )}
                  {activeCategory === Category.DAIRY && '🥛'}
                  {activeCategory === Category.KIRANA && '🧺'}
                </div>
              )}
            </div>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-3">
              <Label className="text-sm font-medium text-slate-700 dark:text-slate-200">
                Select quantity
              </Label>
              <select
                value={String(calculatorQuantity?.grams !== undefined ? calculatorQuantity.grams : calculatorQuantity?.ml !== undefined ? calculatorQuantity.ml : '')}
                onChange={(e) => {
                  const value = e.target.value;
                  const allQuantities = activeCategory === Category.DAIRY ? DAIRY_QUANTITIES : INDIAN_WEIGHTS;
                  const quantity = allQuantities.find(q => String(q.grams || q.ml) === value);
                  setCalculatorQuantity(quantity);
                }}
                className="w-full px-4 py-3 rounded-md border bg-white border-slate-300 text-slate-900 placeholder:text-slate-400 dark:bg-slate-800 dark:border-slate-700 dark:text-white"
              >
                <option value="">Select quantity</option>
                {(activeCategory === Category.DAIRY ? DAIRY_QUANTITIES : INDIAN_WEIGHTS).map((q, idx) => (
                  <option key={idx} value={String(q.grams || q.ml)}>
                    {q.name} ({q.nameHi} / {q.nameMr}) - {q.grams ? `${q.grams}g` : `${q.ml}ml`}
                  </option>
                ))}
              </select>
              <Input
                type="number"
                placeholder="Enter price (₹)"
                value={calculatorPrice}
                onChange={(e) => setCalculatorPrice(e.target.value)}
                className="w-full px-4 py-3 bg-white border-slate-300 text-slate-900 placeholder:text-slate-400 dark:bg-slate-800 dark:border-slate-700 dark:text-white dark:placeholder:text-slate-500"
              />
            </div>

            {calculatorPrice && calculatorQuantity && (
              <div className="space-y-2">
                <Label className="text-sm font-medium text-slate-700 dark:text-slate-200">
                  Price for all quantities:
                </Label>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {calculateAllPrices(parseFloat(calculatorPrice), calculatorQuantity).map((q, idx) => (
                    <div key={idx} className="p-3 rounded-md border bg-slate-50 border-slate-200 dark:bg-slate-800 dark:border-slate-700">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-slate-900 dark:text-white">
                            {q.weight}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            {q.nameHi} / {q.nameMr} - {q.grams ? `${q.grams}g` : `${q.ml}ml`}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-lime-500">₹{q.price.toFixed(2)}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            {q.wordsHi} रुपये | {q.wordsMr} रुपये
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => { setShowCalculator(false); setEditingItem(null); setCalculatorItem(null); }}
              className="border-slate-400 text-slate-600 hover:bg-slate-200 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
            >
              Cancel
            </Button>
            {calculatorPrice && calculatorQuantity && (
              <Button
                onClick={() => {
                  if (editingItem) {
                    const updatedItems = [...currentList!.items];
                    const index = updatedItems.findIndex(i => i.id === editingItem.id);
                    if (index !== -1) {
                      updatedItems[index] = {
                        ...editingItem,
                        price: calculatorPrice,
                        quantity: {
                          grams: calculatorQuantity.grams,
                          ml: calculatorQuantity.ml,
                          name: calculatorQuantity.name,
                          nameHi: calculatorQuantity.nameHi,
                          nameMr: calculatorQuantity.nameMr,
                        },
                        calculatedPrices: calculateAllPrices(parseFloat(calculatorPrice), calculatorQuantity),
                      };
                      const updatedList = { ...currentList!, items: updatedItems };
                      setCurrentList(updatedList);
                      setShoppingLists(shoppingLists.map(l => l.id === currentList!.id ? updatedList : l));
                    } else {
                      const newItem = {
                        id: `item-${Date.now()}`,
                        itemId: calculatorItem.id,
                        name: calculatorItem.en,
                        nameHi: calculatorItem.hi,
                        nameMr: calculatorItem.mr,
                        category: activeCategory!,
                        quantity: {
                          grams: calculatorQuantity.grams,
                          ml: calculatorQuantity.ml,
                          name: calculatorQuantity.name,
                          nameHi: calculatorQuantity.nameHi,
                          nameMr: calculatorQuantity.nameMr,
                        },
                        price: calculatorPrice,
                        calculatedPrices: calculateAllPrices(parseFloat(calculatorPrice), calculatorQuantity),
                      };
                      const updatedList = { ...currentList!, items: [...currentList!.items, newItem] };
                      setCurrentList(updatedList);
                      setShoppingLists(shoppingLists.map(l => l.id === currentList!.id ? updatedList : l));
                    }
                    setShowCalculator(false);
                    setEditingItem(null);
                    setCalculatorItem(null);
                    setCalculatorPrice('');
                    setCalculatorQuantity(null);
                  }}
                  <Button
                onClick={() => {
                  if (editingItem) {
                    const updatedItems = [...currentList!.items];
                    const index = updatedItems.findIndex(i => i.id === editingItem.id);
                    if (index !== -1) {
                      updatedItems[index] = {
                        ...editingItem,
                        price: calculatorPrice,
                        quantity: {
                          grams: calculatorQuantity.grams,
                          ml: calculatorQuantity.ml,
                          name: calculatorQuantity.name,
                          nameHi: calculatorQuantity.nameHi,
                          nameMr: calculatorQuantity.nameMr,
                        },
                        calculatedPrices: calculateAllPrices(parseFloat(calculatorPrice), calculatorQuantity),
                      };
                      const updatedList = { ...currentList!, items: updatedItems };
                      setCurrentList(updatedList);
                      setShoppingLists(shoppingLists.map(l => l.id === currentList!.id ? updatedList : l));
                    } else {
                      const newItem = {
                        id: `item-${Date.now()}`,
                        itemId: calculatorItem.id,
                        name: calculatorItem.en,
                        nameHi: calculatorItem.hi,
                        nameMr: calculatorItem.mr,
                        category: activeCategory!,
                        quantity: {
                          grams: calculatorQuantity.grams,
                          ml: calculatorQuantity.ml,
                          name: calculatorQuantity.name,
                          nameHi: calculatorQuantity.nameHi,
                          nameMr: calculatorQuantity.nameMr,
                        },
                        price: calculatorPrice,
                        calculatedPrices: calculateAllPrices(parseFloat(calculatorPrice), calculatorQuantity),
                      };
                      const updatedList = { ...currentList!, items: [...currentList!.items, newItem] };
                      setCurrentList(updatedList);
                      setShoppingLists(shoppingLists.map(l => l.id === currentList!.id ? updatedList : l));
                    }
                    setShowCalculator(false);
                    setEditingItem(null);
                    setCalculatorItem(null);
                    setCalculatorPrice('');
                    setCalculatorQuantity(null);
                  }}
                  disabled={!calculatorPrice || !calculatorQuantity}
                  className="bg-lime-500 hover:bg-lime-600 text-black font-medium"
                >
                  {editingItem ? 'Update Item' : 'Add to List'}
                </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl text-slate-900 dark:text-white">
              Confirm Delete List
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="flex items-center gap-3 mb-4 text-amber-600 dark:text-amber-400">
              <AlertTriangle className="w-6 h-6" />
              <p className="text-sm">
                Are you sure you want to delete this list? This action cannot be undone.
              </p>
            </div>
            <div className="flex gap-3 justify-end">
              <Button
                variant="outline"
                onClick={() => { setShowDeleteConfirm(false); setListToDelete(null); }}
                className="border-slate-400 text-slate-600 hover:bg-slate-200 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() => {
                  if (listToDelete) {
                    // Move current list to deleted history
                    const listToDelete = shoppingLists.find(l => l.id === listToDelete);
                    if (listToDelete) {
                      const deletedList = { ...listToDelete, id: `deleted-${Date.now()}` };
                      setDeletedLists([deletedList, ...deletedLists]);
                      setShoppingLists(shoppingLists.filter(l => l.id !== listToDelete));
                    }
                    // Clear current list
                    if (currentList && currentList.id === listToDelete) {
                      setCurrentList(null);
                    }
                    setShowDeleteConfirm(false);
                    setListToDelete(null);
                  }
                }}
                className="bg-red-500 hover:bg-red-600 text-white"
              >
                Delete List
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Open Calculator Helper */}
      const openCalculator = () => {
        if (activeSubCategory && selectedItems.size === 1) {
          const selectedItem = getFilteredItems().find((item: any) => selectedItems.has(Array.from(selectedItems)[0]));
          setCalculatorItem(selectedItem);
        }
        setShowCalculator(true);
      };
}
