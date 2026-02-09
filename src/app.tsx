'use client';

// SabjiRate - Main Application Component
import { useState, useEffect, useRef } from 'react';
import { Calculator, ShoppingCart, Home as HomeIcon, Clock, Trash2, X, Plus, Check, Search, ArrowLeft, Sun, Moon } from 'lucide-react';
import { Category, ALL_ITEMS } from '@/lib/sabjirate-seed';
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
  { grams: 62.5, name: 'Adha Chatak', nameHi: 'आधा चटक', nameMr: 'अर्धा चटक' },
  { grams: 125, name: '1 Chatak', nameHi: 'एक चटक', nameMr: 'एक चटक' },
  { grams: 250, name: 'Pav', nameHi: 'पाव', nameMr: 'पाव' },
  { grams: 375, name: 'Dedh Pav', nameHi: 'डेढ पाव', nameMr: 'डेढ पाव' },
  { grams: 500, name: 'Half Kilo', nameHi: 'आधा किलो', nameMr: 'अर्धा किलो' },
  { grams: 750, name: 'Paune Kilo', nameHi: 'पाउने किलो', nameMr: 'पावणे किलो' },
  { grams: 1000, name: '1 Kilo', nameHi: 'एक किलो', nameMr: 'एक किलो' },
];

const DAIRY_QUANTITIES = [
  { ml: 250, name: '250 ml', nameHi: '250 मिली', nameMr: '250 मिली' },
  { ml: 500, name: '500 ml', nameHi: '500 मिली', nameMr: '500 मिली' },
  { ml: 750, name: '750 ml', nameHi: '750 मिली', nameMr: '750 मिली' },
  { ml: 1000, name: '1 Liter', nameHi: '1 लीटर', nameMr: '1 लिटर' },
];

const numberToWords = (num: number): { hi: string; mr: string } => {
  const units = ['', 'एक', 'दो', 'तीन', 'चार', 'पांच', 'छह', 'सात', 'आठ', 'नौ', 'दस'];
  const tens = ['', 'दस', 'बीस', 'तीस', 'चालीस', 'पचास', 'सड़स', 'अस्सी', 'अट्ठी', 'नब्बी'];
  const hundreds = ['', 'सौ', 'दो सौ', 'तीन सौ', 'चार सौ', 'पांच सौ', 'छह सौ', 'सात सौ', 'आठ सौ', 'नौ सौ'];
  
  const unitsMr = ['', 'एक', 'दोन', 'तीन', 'चार', 'पाच', 'सहा', 'सात', 'आठ', 'नव', 'दहा'];
  const tensMr = ['', 'वीस', 'बीस', 'तीस', 'चाळीस', 'पन्नास', 'शहत्तर', 'अठ्ठर', 'नव्व्या', 'एक्याणी'];
  const hundredsMr = ['', 'शंभर', 'दोनशे', 'तीनशे', 'चारशे', 'पन्नाशे', 'शहाशे', 'सातशे', 'आठशे', 'नवाशे'];
  
  if (num === 0) return { hi: 'शून्य', mr: 'शून्या' };
  
  const numInt = Math.floor(num);
  const decimals = num % 1;
  
  let hi = '';
  let mr = '';
  
  if (numInt >= 1000) {
    const thousands = Math.floor(numInt / 1000);
    const remainder = numInt % 1000;
    
    if (thousands === 1) {
      hi += 'एक हजार';
      mr += 'एक हजार';
    } else if (thousands === 2) {
      hi += 'दो हजार';
      mr += 'दोन हजार';
    } else {
      hi += `${thousands} हजार`;
      mr += `${thousands} हजार`;
    }
    
    if (remainder > 0) {
      const remainderWords = getNumberWords(remainder);
      hi += ` ${remainderWords.hi}`;
      mr += ` ${remainderWords.mr}`;
    }
  } else {
    const words = getNumberWords(numInt);
    hi = words.hi;
    mr = words.mr;
  }
  
  if (decimals > 0) {
    const paise = Math.round(decimals * 100);
    const paiseWords = getNumberWords(paise);
    hi += ` ${paiseWords.hi} पैसे`;
    mr += ` ${paiseWords.mr} पैसे`;
  }
  
  return { hi, mr };
};

const getNumberWords = (num: number): { hi: string; mr: string } => {
  const units = ['', 'एक', 'दो', 'तीन', 'चार', 'पांच', 'छह', 'सात', 'आठ', 'नौ', 'दस'];
  const tens = ['', 'दस', 'बीस', 'तीस', 'चालीस', 'पचास', 'सड़स', 'अस्सी', 'अट्ठी', 'नब्बी'];
  const hundreds = ['', 'सौ', 'दो सौ', 'तीन सौ', 'चार सौ', 'पांच सौ', 'छह सौ', 'सात सौ', 'आठ सौ', 'नौ सौ'];
  
  const unitsMr = ['', 'एक', 'दोन', 'तीन', 'चार', 'पाच', 'सहा', 'सात', 'आठ', 'नव', 'दहा'];
  const tensMr = ['', 'वीस', 'बीस', 'तीस', 'चाळीस', 'पन्नास', 'शहत्तर', 'अठ्ठर', 'नव्व्या', 'एक्याणी'];
  const hundredsMr = ['', 'शंभर', 'दोनशे', 'तीनशे', 'चारशे', 'पन्नाशे', 'शहाशे', 'सातशे', 'आठशे', 'नवाशे'];
  
  let hi = '';
  let mr = '';
  
  if (num === 0) return { hi: '', mr: '' };
  
  if (num >= 100) {
    const hundredDigit = Math.floor(num / 100);
    const remainder = num % 100;
    hi += hundreds[hundredDigit];
    mr += hundredsMr[hundredDigit];
    
    if (remainder > 0) {
      const words = getTensWords(remainder);
      hi += ` ${words.hi}`;
      mr += ` ${words.mr}`;
    }
  } else {
    const words = getTensWords(num);
    hi = words.hi;
    mr = words.mr;
  }
  
  return { hi, mr };
};

const getTensWords = (num: number): { hi: string; mr: string } => {
  const units = ['', 'एक', 'दो', 'तीन', 'चार', 'पांच', 'छह', 'सात', 'आठ', 'नौ', 'दस'];
  const tens = ['', 'दस', 'बीस', 'तीस', 'चालीस', 'पचास', 'सड़स', 'अस्सी', 'अट्ठी', 'नब्बी'];
  const specialTens = ['दस', 'बीस', 'तीस', 'चालीस', 'पचास', 'सड़स', 'अस्सी', 'अट्ठी', 'नब्बी'];
  
  const unitsMr = ['', 'एक', 'दोन', 'तीन', 'चार', 'पाच', 'सहा', 'सात', 'आठ', 'नव', 'दहा'];
  const tensMr = ['', 'वीस', 'बीस', 'तीस', 'चाळीस', 'पन्नास', 'शहत्तर', 'अठ्ठर', 'नव्व्या', 'एक्याणी'];
  const specialTensMr = ['वीस', 'बीस', 'तीस', 'चाळीस', 'पन्नास', 'शहत्तर', 'अठ्ठर', 'नव्व्या', 'एक्याणी'];
  
  let hi = '';
  let mr = '';
  
  if (num < 10) {
    hi = units[num];
    mr = unitsMr[num];
  } else if (num < 20) {
    const tensDigit = Math.floor(num / 10);
    const unitDigit = num % 10;
    
    if (num === 10) {
      hi = 'दस';
      mr = 'दहा';
    } else if (num === 11) {
      hi = 'ग्यारह';
      mr = 'अकरा';
    } else if (num === 12) {
      hi = 'बारह';
      mr = 'बारा';
    } else if (num === 13) {
      hi = 'तेरह';
      mr = 'तेरा';
    } else if (num === 14) {
      hi = 'चौदह';
      mr = 'चौदा';
    } else if (num === 15) {
      hi = 'पन्द्रह';
      mr = 'पंधरा';
    } else if (num === 16) {
      hi = 'सोलह';
      mr = 'सोळा';
    } else if (num === 17) {
      hi = 'सत्रह';
      mr = 'सत्रा';
    } else if (num === 18) {
      hi = 'अठारह';
      mr = 'अठरा';
    } else if (num === 19) {
      hi = 'उन्नीस';
      mr = 'एकोणीस';
    } else {
      hi = `${units[unitDigit]}${tens[tensDigit].slice(1)}`;
      mr = `${unitsMr[unitDigit]}${tensMr[tensDigit].slice(1)}`;
    }
  } else if (num < 100) {
    const tensDigit = Math.floor(num / 10);
    const unitDigit = num % 10;
    
    if (unitDigit === 0) {
      hi = specialTens[tensDigit];
      mr = specialTensMr[tensDigit];
    } else {
      hi = `${units[unitDigit]} ${specialTens[tensDigit]}`;
      mr = `${unitsMr[unitDigit]} ${specialTensMr[tensDigit]}`;
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
  
  // Mounted ref for hydration fix
  const mounted = useRef(false);

  // Save lists to localStorage when they change
  useEffect(() => {
    mounted.current = true;
    if (typeof window !== 'undefined') {
      localStorage.setItem('shoppingLists', JSON.stringify(shoppingLists));
      localStorage.setItem('deletedLists', JSON.stringify(deletedLists));
    }
  }, [shoppingLists, deletedLists]);

  const categories = [
    { key: Category.VEGETABLES, title: '🥦 Vegetables', icon: '🥬', count: 60 },
    { key: Category.FRUITS, title: '🍎 Fruits', icon: '🍎', count: 35 },
    { key: Category.DAIRY, title: '🥛 Milk & Dairy', icon: '🥛', count: 9 },
    { key: Category.KIRANA, title: '🧺 Kirana / Grocery', icon: '🍚', count: 40 },
  ];

  const getFilteredItems = () => {
    if (!activeCategory) return [];
    
    const query = searchQuery.toLowerCase();
    const items = activeCategory === Category.VEGETABLES ? ALL_ITEMS.VEGETABLES
      : activeCategory === Category.FRUITS ? ALL_ITEMS.FRUITS
      : activeCategory === Category.DAIRY ? ALL_ITEMS.DAIRY
      : ALL_ITEMS.KIRANA;

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
        price: calculatedPrice,
        wordsHi: words.hi,
        wordsMr: words.mr,
      };
    });
  };

  const openCalculator = (item?: any) => {
    if (item) {
      setCalculatorItem(item);
    } else {
      setCalculatorItem(null);
    }
    setCalculatorPrice('');
    // Set default quantity to 1kg (or 1 liter for dairy)
    const defaultQuantities = activeCategory === Category.DAIRY ? DAIRY_QUANTITIES : INDIAN_WEIGHTS;
    const defaultQuantity = defaultQuantities[defaultQuantities.length - 1]; // Last item is 1kg or 1 liter
    setCalculatorQuantity(defaultQuantity);
    setShowCalculator(true);
  };

  const saveItemPrice = () => {
    if (!editingItem || !currentList) return;
    
    const allQuantities = activeCategory === Category.DAIRY ? DAIRY_QUANTITIES : INDIAN_WEIGHTS;
    const price = parseFloat(calculatorPrice);
    
    const updatedItems = currentList.items.map(item => {
      if (item.id === editingItem.id) {
        return {
          ...item,
          price: calculatorPrice,
          quantity: calculatorQuantity,
          calculatedPrices: price && calculatorQuantity ? calculateAllPrices(price, calculatorQuantity) : [],
        };
      }
      return item;
    });

    const updatedList = { ...currentList, items: updatedItems };
    const updatedLists = shoppingLists.map(list => 
      list.id === currentList.id ? updatedList : list
    );

    setCurrentList(updatedList);
    setShoppingLists(updatedLists);
    setEditingItem(null);
    setShowCalculator(false);
  };

  const deleteList = (listId: string) => {
    const listToDelete = shoppingLists.find(l => l.id === listId);
    if (listToDelete) {
      setShoppingLists(shoppingLists.filter(l => l.id !== listId));
      setDeletedLists([listToDelete, ...deletedLists]);
      if (currentList?.id === listId) {
        setCurrentList(null);
      }
    }
    setShowDeleteConfirm(false);
    setListToDelete(null);
  };

  const clearHistory = () => {
    setDeletedLists([]);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    setTouchStart({ x: touch.clientX, y: touch.clientY });
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!touchStart) return;
    const touch = e.touches[0];
    const deltaX = touch.clientX - touchStart.x;
    const deltaY = Math.abs(touch.clientY - touchStart.y);
    
    // Detect horizontal swipe (left swipe = back)
    if (deltaX > 100 && deltaY < 50) {
      e.preventDefault();
      if (activeCategory) {
        // Close category view
        setActiveCategory(null);
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

  const calculateTotalForQuantity = (gramsOrMl: number) => {
    if (!currentList || currentList.items.length === 0) return 0;
    let total = 0;
    currentList.items.forEach(item => {
      if (item.price && item.quantity) {
        const price = parseFloat(item.price);
        const quantityGrams = item.quantity.grams || item.quantity.ml || 1;
        const pricePerKg = (price / (quantityGrams / 1000));
        const priceForQuantity = (gramsOrMl / 1000) * pricePerKg;
        total += priceForQuantity;
      }
    });
    return total;
  };

  return (
    <div 
      className={`min-h-screen flex flex-col ${mounted ? (theme === 'dark' ? 'bg-gradient-to-br from-slate-950 via-black to-slate-950' : 'bg-gradient-to-br from-slate-100 via-white to-slate-100') : 'bg-gradient-to-br from-slate-100 via-white to-slate-100'}`}
      style={{ fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, "Noto Sans Devanagari", sans-serif' }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Header */}
      <header className={`sticky top-0 z-40 backdrop-blur-lg border-b ${mounted ? (theme === 'dark' ? 'bg-black/80 border-slate-800' : 'bg-white/80 border-slate-300') : 'bg-white/80 border-slate-300'}`}>
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {activeCategory && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => { setActiveCategory(null); setSelectedItems(new Set()); setSearchQuery(''); }}
                  className={theme === 'dark' ? 'text-slate-300 hover:text-white' : 'text-slate-600 hover:text-slate-900'}
                >
                  <ArrowLeft className="w-4 h-4" />
                </Button>
              )}
              <h1 className={`text-2xl font-extrabold tracking-tight bg-gradient-to-r from-lime-400 to-lime-600 bg-clip-text text-transparent`}>
                SabjiRate
              </h1>
            </div>
            <div className="flex gap-2 items-center">
              {mounted && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                  className={theme === 'dark' ? 'border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white' : 'border-slate-400 text-slate-600 hover:bg-slate-200'}
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
            <div className="mb-4">
              <h2 className={`text-2xl font-bold mb-1 ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                {activeCategory === Category.VEGETABLES && '🥦 Vegetables'}
                {activeCategory === Category.FRUITS && '🍎 Fruits'}
                {activeCategory === Category.DAIRY && '🥛 Milk & Dairy'}
                {activeCategory === Category.KIRANA && '🧺 Kirana / Grocery'}
              </h2>
              <p className={`text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                Select items to create a shopping list
              </p>
            </div>

            <div className={`mb-4 relative ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
              <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-400'}`} />
              <Input
                type="text"
                placeholder="Search items..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`pl-10 ${theme === 'dark' ? 'bg-slate-800 border-slate-700 text-white placeholder:text-slate-500' : 'bg-white border-slate-300 text-slate-900 placeholder:text-slate-400'}`}
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
                      : theme === 'dark' 
                        ? 'bg-slate-800/50 border-slate-700 hover:border-slate-600' 
                        : 'bg-slate-100 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <CardContent className="p-4">
                    <div className="text-center">
                      <div className="text-3xl mb-2">
                        {activeCategory === Category.VEGETABLES && '🥬'}
                        {activeCategory === Category.FRUITS && '🍎'}
                        {activeCategory === Category.DAIRY && '🥛'}
                        {activeCategory === Category.KIRANA && '🍚'}
                      </div>
                      <p className={`font-semibold text-sm mb-1 ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>{item.en}</p>
                      <p className={`text-xs mb-1 ${theme === 'dark' ? 'text-slate-200' : 'text-slate-600'}`}>{item.hi}</p>
                      <p className={`text-xs ${theme === 'dark' ? 'text-slate-300' : 'text-slate-500'}`}>{item.mr}</p>
                      {selectedItems.has(item.id) && (
                        <Badge className="mt-2 bg-lime-500 text-black">✓ Selected</Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ) : currentList ? (
          // List Detail View
          <div>
            <div className="mb-6">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCurrentList(null)}
                className={`mb-4 ${theme === 'dark' ? 'text-slate-300 hover:text-white' : 'text-slate-600 hover:text-slate-900'}`}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Lists
              </Button>
              <h2 className={`text-2xl font-bold mb-1 ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                {currentList.name}
              </h2>
              <p className={`text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                {currentList.items.length} items
              </p>
            </div>

            <div className="space-y-3">
              {currentList.items.map((item) => (
                <Card
                  key={item.id}
                  className={`${theme === 'dark' ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-100 border-slate-200'}`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>{item.name}</p>
                        <p className={`text-sm ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>{item.nameHi} | {item.nameMr}</p>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => { setEditingItem(item); openCalculator(); }}
                        className={theme === 'dark' ? 'border-slate-600 text-slate-300' : 'border-slate-300 text-slate-600'}
                      >
                        {item.price ? 'Edit Price' : 'Add Price'}
                      </Button>
                    </div>

                    {item.price && item.quantity && (
                      <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-slate-900/50' : 'bg-slate-200'}`}>
                        <div className="flex justify-between items-center mb-2">
                          <span className={`text-sm ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>
                            Base: {item.quantity.name} @ ₹{item.price}
                          </span>
                          <span className={`text-lg font-bold text-lime-500`}>
                            1 {activeCategory === Category.DAIRY && item.quantity.ml === 1000 ? 'Liter' : 'KG'} = ₹{((parseFloat(item.price) / ((item.quantity.grams || item.quantity.ml) / 1000))).toFixed(2)}
                          </span>
                        </div>

                        {item.calculatedPrices.length > 0 && (
                          <div className="space-y-2 mt-3 max-h-48 overflow-y-auto">
                            {item.calculatedPrices.map((cp, idx) => (
                              <div key={idx} className={`flex justify-between items-center text-sm p-2 rounded ${theme === 'dark' ? 'bg-slate-800' : 'bg-slate-100'}`}>
                                <span className={theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}>{cp.weight}</span>
                                <span className="font-semibold text-lime-500">₹{cp.price.toFixed(2)}</span>
                                <span className={`text-xs ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
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
            </div>
          </div>
        ) : currentView === 'home' ? (
          // Home View - Categories Only
          <div>
            <h2 className={`text-2xl font-bold mb-6 ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
              Browse Categories
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {categories.map((cat) => (
                <Card
                  key={cat.key}
                  onClick={() => { setActiveCategory(cat.key); setSelectedItems(new Set()); setSearchQuery(''); }}
                  className={`cursor-pointer transition-all hover:scale-105 ${
                    theme === 'dark' 
                      ? 'bg-slate-800/50 border-slate-700 hover:border-lime-500' 
                      : 'bg-slate-100 border-slate-200 hover:border-lime-500'
                  }`}
                >
                  <CardContent className="p-6">
                    <div>
                      <h3 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>{cat.title}</h3>
                      <p className={`text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>{cat.count} items</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ) : currentView === 'lists' ? (
          // Lists View
          <div>
            <h2 className={`text-2xl font-bold mb-6 ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
              Shopping Lists
            </h2>
            {shoppingLists.length === 0 ? (
              <div className={`text-center py-12 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
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
                    className={`cursor-pointer transition-all hover:scale-[1.02] ${
                      theme === 'dark' 
                        ? 'bg-slate-800/50 border-slate-700 hover:border-lime-500' 
                        : 'bg-slate-100 border-slate-200 hover:border-lime-500'
                    }`}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>{list.name}</h3>
                          <p className={`text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                            {list.items.length} items • Created {new Date(list.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={theme === 'dark' ? 'bg-slate-700 text-white' : 'bg-slate-200 text-slate-900'}>
                            {list.category}
                          </Badge>
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
            <div className="flex items-center justify-between mb-6">
              <h2 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                Deleted Lists History
              </h2>
              {deletedLists.length > 0 && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={clearHistory}
                  className={theme === 'dark' ? 'border-slate-700 text-slate-300' : 'border-slate-300 text-slate-600'}
                >
                  Clear History
                </Button>
              )}
            </div>
            {deletedLists.length === 0 ? (
              <div className={`text-center py-12 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                <Clock className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg mb-2">No history yet</p>
                <p className="text-sm">Deleted lists will appear here</p>
              </div>
            ) : (
              <div className="space-y-3">
                {deletedLists.map((list) => (
                  <Card
                    key={list.id}
                    className={`${theme === 'dark' ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-100 border-slate-200'}`}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>{list.name}</h3>
                          <p className={`text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
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
      <nav className={`fixed bottom-0 left-0 right-0 z-40 border-t backdrop-blur-lg ${theme === 'dark' ? 'bg-black/80 border-slate-800' : 'bg-white/80 border-slate-300'}`}>
        <div className="container mx-auto px-4">
          <div className="flex justify-around py-2">
            <Button
              variant="ghost"
              onClick={() => { setCurrentView('home'); setActiveCategory(null); setCurrentList(null); }}
              className={`flex-1 flex-col gap-1 ${currentView === 'home' ? 'text-lime-500' : theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}
            >
              <HomeIcon className="w-5 h-5" />
              <span className="text-xs">Home</span>
            </Button>
            <Button
              variant="ghost"
              onClick={() => { setCurrentView('lists'); setActiveCategory(null); setCurrentList(null); }}
              className={`flex-1 flex-col gap-1 ${currentView === 'lists' ? 'text-lime-500' : theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}
            >
              <ShoppingCart className="w-5 h-5" />
              <span className="text-xs">Lists</span>
            </Button>
            <Button
              variant="ghost"
              onClick={() => { setCurrentView('history'); setActiveCategory(null); setCurrentList(null); }}
              className={`flex-1 flex-col gap-1 ${currentView === 'history' ? 'text-lime-500' : theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}
            >
              <Clock className="w-5 h-5" />
              <span className="text-xs">History</span>
            </Button>
          </div>
        </div>
      </nav>

      {/* Calculator Dialog */}
      <Dialog open={showCalculator} onOpenChange={setShowCalculator}>
        <DialogContent className={`max-w-2xl max-h-[90vh] overflow-y-auto ${theme === 'dark' ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-300'}`}>
          <DialogHeader>
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle className={`text-xl ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                  {calculatorItem ? calculatorItem.en : 'Price Calculator'}
                </DialogTitle>
                {calculatorItem && (
                  <p className={`text-sm mt-1 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                    {calculatorItem.hi} | {calculatorItem.mr}
                  </p>
                )}
              </div>
              {calculatorItem && (
                <div className="text-3xl">
                  {activeCategory === Category.VEGETABLES && '🥬'}
                  {activeCategory === Category.FRUITS && '🍎'}
                  {activeCategory === Category.DAIRY && '🥛'}
                  {activeCategory === Category.KIRANA && '🍚'}
                </div>
              )}
            </div>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-3">
              <Label className={`text-sm font-medium ${theme === 'dark' ? 'text-slate-200' : 'text-slate-700'}`}>
                Select quantity
              </Label>
              <select
                value={calculatorQuantity?.grams || calculatorQuantity?.ml || ''}
                onChange={(e) => {
                  const value = e.target.value;
                  const allQuantities = activeCategory === Category.DAIRY ? DAIRY_QUANTITIES : INDIAN_WEIGHTS;
                  const quantity = allQuantities.find(q => (q.grams || q.ml) === parseFloat(value));
                  setCalculatorQuantity(quantity);
                }}
                className={`w-full px-4 py-3 rounded-md border ${
                  theme === 'dark' 
                    ? 'bg-slate-800 border-slate-700 text-white' 
                    : 'bg-white border-slate-300 text-slate-900'
                }`}
              >
                <option value="">Select quantity</option>
                {(activeCategory === Category.DAIRY ? DAIRY_QUANTITIES : INDIAN_WEIGHTS).map((q, idx) => (
                  <option key={idx} value={q.grams || q.ml}>
                    {q.name} ({q.nameHi} / {q.nameMr})
                  </option>
                ))}
              </select>
              <Input
                type="number"
                placeholder="Enter price (₹)"
                value={calculatorPrice}
                onChange={(e) => setCalculatorPrice(e.target.value)}
                className={`w-full px-4 py-3 ${
                  theme === 'dark' 
                    ? 'bg-slate-800 border-slate-700 text-white placeholder:text-slate-500' 
                    : 'bg-white border-slate-300 text-slate-900 placeholder:text-slate-400'
                }`}
              />
            </div>

            {calculatorPrice && calculatorQuantity && (
              <div className="space-y-2">
                <Label className={`text-sm font-medium ${theme === 'dark' ? 'text-slate-200' : 'text-slate-700'}`}>
                  Price for all quantities:
                </Label>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {(activeCategory === Category.DAIRY ? DAIRY_QUANTITIES : INDIAN_WEIGHTS).map((q, idx) => {
                    const quantityGrams = q.grams || q.ml;
                    const baseQuantityGrams = calculatorQuantity.grams || calculatorQuantity.ml;
                    const pricePerUnit = parseFloat(calculatorPrice) / (baseQuantityGrams / 1000);
                    const price = (quantityGrams / 1000) * pricePerUnit;
                    const words = numberToWords(price);
                    return (
                      <div
                        key={idx}
                        className={`p-3 rounded-md border ${
                          theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                              {q.name}
                            </p>
                            <p className={`text-xs ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                              {q.nameHi} / {q.nameMr}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-bold text-lime-500">₹{price.toFixed(2)}</p>
                            <p className={`text-xs ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                              {words.hi} रुपये | {words.mr} रुपये
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => { setShowCalculator(false); setEditingItem(null); }}
              className={theme === 'dark' ? 'border-slate-700 text-slate-300 hover:bg-slate-800' : 'border-slate-400 text-slate-600 hover:bg-slate-200'}
            >
              Close
            </Button>
            {editingItem && calculatorPrice && calculatorQuantity && (
              <Button
                className="bg-lime-500 hover:bg-lime-600 text-black font-medium"
                onClick={saveItemPrice}
              >
                <Check className="w-4 h-4 mr-2" />
                Save Price
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent className={`max-w-md ${theme === 'dark' ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-300'}`}>
          <DialogHeader>
            <DialogTitle className={`text-xl ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
              Delete List?
            </DialogTitle>
          </DialogHeader>
          <p className={`text-sm ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>
            This list will be moved to history and can be cleared permanently.
          </p>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => { setShowDeleteConfirm(false); setListToDelete(null); }}
              className={theme === 'dark' ? 'border-slate-700 text-slate-300 hover:bg-slate-800' : 'border-slate-400 text-slate-600 hover:bg-slate-200'}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => listToDelete && deleteList(listToDelete)}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete List
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
