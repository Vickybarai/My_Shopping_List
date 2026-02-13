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
  mode: 'weight' | 'packet';
  quantity: {
    grams?: number;
    ml?: number;
    packets?: number;
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

const PACKET_QUANTITIES = [
  { packets: 1, name: '1 Packet', nameHi: '1 पैकेट', nameMr: '1 पॅकेट' },
  { packets: 2, name: '2 Packets', nameHi: '2 पैकेट', nameMr: '2 पॅकेट' },
  { packets: 3, name: '3 Packets', nameHi: '3 पैकेट', nameMr: '3 पॅकेट' },
  { packets: 4, name: '4 Packets', nameHi: '4 पैकेट', nameMr: '4 पॅकेट' },
  { packets: 5, name: '5 Packets', nameHi: '5 पैकेट', nameMr: '5 पॅकेट' },
];

const DOZEN_QUANTITIES = [
  { dozens: 0.25, name: 'Quarter Dozen', nameHi: 'चौथाई दर्जन', nameMr: 'पाव डझन', count: 3 },
  { dozens: 0.5, name: 'Half Dozen', nameHi: 'आधा दर्जन', nameMr: 'अर्धा डझन', count: 6 },
  { dozens: 1, name: '1 Dozen', nameHi: 'एक दर्जन', nameMr: 'एक डझन', count: 12 },
  { dozens: 1.5, name: '1½ Dozen', nameHi: 'डेढ़ दर्जन', nameMr: 'दीड डझन', count: 18 },
  { dozens: 2, name: '2 Dozens', nameHi: 'दो दर्जन', nameMr: 'दोन डझन', count: 24 },
  { dozens: 2.5, name: '2½ Dozens', nameHi: 'ढाई दर्जन', nameMr: 'अडीच डझन', count: 30 },
  { dozens: 3, name: '3 Dozens', nameHi: 'तीन दर्जन', nameMr: 'तीन डझन', count: 36 },
  { dozens: 4, name: '4 Dozens', nameHi: 'चार दर्जन', nameMr: 'चार डझन', count: 48 },
  { dozens: 5, name: '5 Dozens', nameHi: 'पाँच दर्जन', nameMr: 'पाच डझन', count: 60 },
];

// Number words lookup (0-100) for Hindi and Marathi
const NUMBER_WORDS_HI: { [key: number]: string } = {
  0: 'शून्य', 1: 'एक', 2: 'दो', 3: 'तीन', 4: 'चार', 5: 'पाँच', 6: 'छह', 7: 'सात', 8: 'आठ', 9: 'नौ',
  10: 'दस', 11: 'ग्यारह', 12: 'बारह', 13: 'तेरह', 14: 'चौदह', 15: 'पन्द्रह', 16: 'सोलह', 17: 'सत्रह', 18: 'अठारह', 19: 'उन्नीस',
  20: 'बीस', 21: 'इक्कीस', 22: 'बाईस', 23: 'तेईस', 24: 'चौबीस', 25: 'पच्चीस', 26: 'छब्बीस', 27: 'सत्ताईस', 28: 'अट्ठाईस', 29: 'उनतीस',
  30: 'तीस', 31: 'इकतीस', 32: 'बतीस', 33: 'तैंतीस', 34: 'चौतीस', 35: 'पैंतीस', 36: 'छतीस', 37: 'सैंतीस', 38: 'अड़तीस', 39: 'उनतालीस',
  40: 'चालीस', 41: 'इकतालीस', 42: 'बयालीस', 43: 'तैंतालीस', 44: 'चौवालीस', 45: 'पैंतालीस', 46: 'छियालीस', 47: 'सैंतालीस', 48: 'अड़तालीस', 49: 'उनचास',
  50: 'पचास', 51: 'इक्यावन', 52: 'बावन', 53: 'तिरेपन', 54: 'चौवन', 55: 'पचपन', 56: 'छप्पन', 57: 'सत्तावन', 58: 'अट्ठावन', 59: 'उनसठ',
  60: 'साठ', 61: 'इकसठ', 62: 'बासठ', 63: 'तिरेसठ', 64: 'चौसठ', 65: 'पैंसठ', 66: 'छियासठ', 67: 'सड़सठ', 68: 'अड़सठ', 69: 'उनहत्तर',
  70: 'सत्तर', 71: 'इकहत्तर', 72: 'बहत्तर', 73: 'तिहत्तर', 74: 'चौहत्तर', 75: 'पचहत्तर', 76: 'छिहत्तर', 77: 'सत्तहत्तर', 78: 'अठहत्तर', 79: 'उनासी',
  80: 'अस्सी', 81: 'इक्यासी', 82: 'बयासी', 83: 'तिरासी', 84: 'चौरासी', 85: 'पचासी', 86: 'छियासी', 87: 'सत्तासी', 88: 'अट्ठासी', 89: 'नवासी',
  90: 'नब्बे', 91: 'इक्यानवे', 92: 'बानवे', 93: 'तिरानवे', 94: 'चौरानवे', 95: 'पचानवे', 96: 'छियानवे', 97: 'सत्तानवे', 98: 'अट्ठानवे', 99: 'निन्यानवे',
  100: 'सौ'
};

const NUMBER_WORDS_MR: { [key: number]: string } = {
  0: 'शून्या', 1: 'एक', 2: 'दोन', 3: 'तीन', 4: 'चार', 5: 'पाच', 6: 'सहा', 7: 'सात', 8: 'आठ', 9: 'नव',
  10: 'दहा', 11: 'अकरा', 12: 'बारा', 13: 'तेरा', 14: 'चौदा', 15: 'पंधरा', 16: 'सोळा', 17: 'सत्रा', 18: 'अठरा', 19: 'एकोणीस',
  20: 'वीस', 21: 'एकवीस', 22: 'बावीस', 23: 'तेवीस', 24: 'चोवीस', 25: 'पंचीस', 26: 'शेवीस', 27: 'सत्तावीस', 28: 'अठ्तावीस', 29: 'एकोणतीस',
  30: 'तीस', 31: 'एकतीस', 32: 'बतीस', 33: 'तेतीस', 34: 'चौतीस', 35: 'पंचतीस', 36: 'छतीस', 37: 'सैंतीस', 38: 'अठतीस', 39: 'एकोणचाळीस',
  40: 'चाळीस', 41: 'एकताळीस', 42: 'बेचाळीस', 43: 'तेचाळीस', 44: 'चौचाळीस', 45: 'पंचेचाळीस', 46: 'शेचाळीस', 47: 'सैंताळीस', 48: 'अठेचाळीस', 49: 'एकोणन्नवेचाळीस',
  50: 'पन्नास', 51: 'एक्यावन्नवे', 52: 'बावन्नवे', 53: 'त्रेपन्नवे', 54: 'चौवन्नवे', 55: 'पंचावन्नवे', 56: 'शावन्नवे', 57: 'सत्तावन्नवे', 58: 'अठ्यावन्नवे', 59: 'एकोणसठ',
  60: 'साठ', 61: 'एकसठ', 62: 'बासठ', 63: 'त्रेसठ', 64: 'चौसठ', 65: 'पसठ', 66: 'शेसठ', 67: 'सत्तौसठ', 68: 'अठ्सठ', 69: 'एकोणहत्तर',
  70: 'सत्तर', 71: 'एकहत्तर', 72: 'बहत्तर', 73: 'त्रेहत्तर', 74: 'चौहत्तर', 75: 'पंचहत्तर', 76: 'शेहत्तर', 77: 'सत्त्तहत्तर', 78: 'अठ्हत्तर', 79: 'एकोणासी',
  80: 'अस्सी', 81: 'एक्यासी', 82: 'बयासी', 83: 'त्र्यासी', 84: 'चौऱ्यासी', 85: 'पंच्यासी', 86: 'शेयासी', 87: 'सत्त्यासी', 88: 'अठ्यासी', 89: 'एकोणनव्वे',
  90: 'नव्वे', 91: 'एक्याणनव्वे', 92: 'बयाणनव्वे', 93: 'त्रयाणनव्वे', 94: 'चौऱ्याणनव्वे', 95: 'पंच्याणनव्वे', 96: 'शेणनव्वे', 97: 'सत्त्याणनव्वे', 98: 'अठ्याणनव्वे', 99: 'नव्याणनव्वे',
  100: 'शंभर'
};

// Fixed numberToWords function - uses lookup table for 0-100
const numberToWords = (num: number): { hi: string; mr: string } => {
  const numInt = Math.floor(num);

  // Direct lookup for 0-100
  if (numInt <= 100 && numInt >= 0) {
    return {
      hi: NUMBER_WORDS_HI[numInt] || 'शून्य',
      mr: NUMBER_WORDS_MR[numInt] || 'शून्या'
    };
  }

  // For numbers above 100, use hundreds + lookup for remainder
  const hundredDigit = Math.floor(numInt / 100);
  const remainder = numInt % 100;

  let hi = '';
  let mr = '';

  // Hundred part
  if (hundredDigit === 1) {
    hi += 'सौ';
    mr += 'शंभर';
  } else if (hundredDigit === 2) {
    hi += 'दो सौ';
    mr += 'दोनशे';
  } else if (hundredDigit >= 3 && hundredDigit <= 10) {
    hi += `${NUMBER_WORDS_HI[hundredDigit]} सौ`;
    mr += `${NUMBER_WORDS_MR[hundredDigit]}शे`;
  }

  // Remainder part
  if (remainder > 0 && remainder <= 100) {
    hi += ' ';
    mr += ' ';
    hi += NUMBER_WORDS_HI[remainder];
    mr += NUMBER_WORDS_MR[remainder];
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
  const [calculatorDozen, setCalculatorDozen] = useState<number>(1);
  const [calculatorMode, setCalculatorMode] = useState<'weight' | 'packet' | 'dozen' | 'liter'>('weight');
  const [calculatorCustomName, setCalculatorCustomName] = useState('');

  // Custom Item Prompt States
  const [customItemName, setCustomItemName] = useState('');
  const [customItemCategory, setCustomItemCategory] = useState<Category | null>(null);
  const [showCustomItemPrompt, setShowCustomItemPrompt] = useState(false);

  // List management state
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [allSelectedItems, setAllSelectedItems] = useState<Array<{id: string, category: Category}>>([]);
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
  const [isCustomItemForList, setIsCustomItemForList] = useState(false);
  
  // Delete confirmation
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [listToDelete, setListToDelete] = useState<string | null>(null);

  // Discard confirmation for back button
  const [showDiscardConfirm, setShowDiscardConfirm] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState<(() => void) | null>(null);

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

  // Handle back button with discard confirmation
  // Only show discard confirmation when going to HOME (setActiveCategory(null))
  // When going back to subcategories (setActiveSubCategory(null)), preserve selections
  const handleBackWithDiscardCheck = (navigationAction: () => void, goingToHome: boolean) => {
    if (goingToHome && allSelectedItems.length > 0) {
      // Show discard confirmation only when going to HOME with selected items
      setPendingNavigation(() => {
        setAllSelectedItems([]);
        setSelectedItems(new Set());
        setSearchQuery('');
        navigationAction();
        setShowDiscardConfirm(false);
      });
      setShowDiscardConfirm(true);
    } else {
      // Going back to subcategories - preserve selections, no confirmation
      navigationAction();
    }
  };

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

  const toggleItemSelection = (itemId: string) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(itemId)) {
      newSelected.delete(itemId);
      // Remove from allSelectedItems
      setAllSelectedItems(allSelectedItems.filter(item => item.id !== itemId));
    } else {
      newSelected.add(itemId);
      // Add to allSelectedItems with current category and full item data
      const itemData = getFilteredItems().find((item: any) => item.id === itemId);
      if (itemData) {
        setAllSelectedItems([...allSelectedItems, { 
          id: itemId, 
          category: activeCategory!,
          name: itemData.en,
          nameHi: itemData.hi,
          nameMr: itemData.mr
        }]);
      }
    }
    setSelectedItems(newSelected);
  };

  /**
   * Create List - Business Logic Implementation
   * 
   * REQUIREMENTS MET:
   * ✅ All selected items across all categories combined into single consolidated list
   * ✅ No category separation inside the created list - all items appear together
   * ✅ Every selected item appears in the final list
   * ✅ No duplicate entries (unique ID using itemId + timestamp + index)
   * ✅ No selected item is lost during list creation
   * ✅ Preserves navigation stack integrity (step-by-step navigation)
   * ✅ Maintains separation between UI logic and business logic
   * ✅ Does not alter existing working behavior
   */
  const createList = () => {
    // Validation: Don't create empty lists
    if (allSelectedItems.length === 0) return;

    const now = new Date();
    const listName = `List - ${now.toLocaleDateString()} ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;

    // Create items from all selected items across categories
    // Each item gets unique ID using itemId + timestamp + index to prevent duplicates
    const items = allSelectedItems.map((selected: any, index: number) => {
      // Find item data from the appropriate category
      let itemData: any = null;
      if (selected.category === Category.VEG_FRUITS) {
        itemData = [...ALL_ITEMS.VEGETABLES, ...ALL_ITEMS.FRUITS].find((i: any) => i.id === selected.id);
      } else if (selected.category === Category.DAIRY) {
        itemData = ALL_ITEMS.DAIRY.find((i: any) => i.id === selected.id);
      } else if (selected.category === Category.KIRANA) {
        const allKirana = [...KIRANA_GRAINS, ...KIRANA_PULSES, ...KIRANA_SWEETENERS, ...KIRANA_OILS, ...KIRANA_BEVERAGES, ...KIRANA_BREAKFAST, ...KIRANA_SPICES, ...KIRANA_DRY_FRUITS];
        itemData = allKirana.find((i: any) => i.id === selected.id);
      }

      return {
        id: `${selected.id}-${Date.now()}-${index}`,
        itemId: selected.id,
        name: itemData?.en || selected.name || 'Custom Item',
        nameHi: itemData?.hi || selected.nameHi || '',
        nameMr: itemData?.mr || selected.nameMr || '',
        category: selected.category,
        mode: 'weight',
        quantity: {
          grams: undefined,
          ml: undefined,
          name: 'Not selected',
          nameHi: 'चयन नहीं',
          nameMr: 'निवडले नाही',
        },
        price: '',
        calculatedPrices: [],
      };
    });

    const newList: ShoppingList = {
      id: `list-${Date.now()}`,
      name: listName,
      createdAt: now,
      items,
      category: 'mixed', // Indicates cross-category consolidated list
    };

    // Update state - preserve navigation integrity
    // Clear selections after list is created (all items are now in the list)
    // Set searchQuery to empty for clean state
    setShoppingLists([newList, ...shoppingLists]);
    setAllSelectedItems([]);
    setSelectedItems(new Set());
    setActiveCategory(null);
    setActiveSubCategory(null);
    setSearchQuery('');
    
    // Navigate to lists view - step-by-step navigation
    setCurrentView('lists');
    setCurrentList(newList);
  };

  const calculateAllPrices = (price: number, quantity: any, mode: 'weight' | 'packet' | 'dozen', itemCategory: Category | null = null) => {
    // Handle invalid price
    if (isNaN(price) || price <= 0) {
      return [];
    }

    // Handle invalid quantity
    if (!quantity || typeof quantity !== 'object') {
      return [];
    }

    const category = itemCategory || activeCategory;
    if (mode === 'packet') {
      // For packet mode, calculate prices for 1-5 packets
      return PACKET_QUANTITIES.map(q => {
        const calculatedPrice = price * q.packets;
        const words = numberToWords(calculatedPrice);
        return {
          weight: `${q.packets} Packet${q.packets > 1 ? 's' : ''}`,
          nameHi: `${q.packets} पैकेट`,
          nameMr: `${q.packets} पॅकेट`,
          packets: q.packets,
          price: calculatedPrice,
          wordsHi: words.hi,
          wordsMr: words.mr,
        };
      });
    }

    if (mode === 'dozen') {
      // For dozen mode (fruits), calculate prices for half dozen to 2 dozens
      return DOZEN_QUANTITIES.map(q => {
        const calculatedPrice = price * q.dozens;
        const words = numberToWords(calculatedPrice);
        return {
          weight: `${q.dozens} Dozen${q.dozens !== 1 ? 's' : ''}`,
          nameHi: `${q.dozens} दर्जन`,
          nameMr: `${q.dozens} डझन`,
          dozens: q.dozens,
          price: calculatedPrice,
          wordsHi: words.hi,
          wordsMr: words.mr,
        };
      });
    }

    // For weight mode (original logic)
    const allQuantities = category === Category.DAIRY ? DAIRY_QUANTITIES : INDIAN_WEIGHTS;
    const quantityGrams = quantity.grams || quantity.ml || 1;

    // Validate quantities exist
    if (!allQuantities || allQuantities.length === 0) {
      return [];
    }

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
        // For packet mode, calculate total price (per packet × number of packets), for weight mode convert to 1KG price
        if (item.mode === 'packet') {
          total += price * (item.quantity.packets || 1);
        } else if (item.mode === 'dozen') {
          // For dozen mode, convert to 1KG equivalent for consistent comparison
          const pricePerDozen = (price / item.quantity.dozens);
          total += pricePerDozen;
        } else {
          const quantityGrams = item.quantity.grams || item.quantity.ml || 1;
          const pricePerKg = (price / (quantityGrams / 1000));
          total += pricePerKg; // Sum of 1KG prices
        }
      }
    });
    return total;
  };

  // Open Calculator Helper
  const openCalculator = (forceCustom: boolean = false) => {
    if (editingItem) {
      // Load existing item data when editing
      setCalculatorItem(editingItem);
      setCalculatorPrice(editingItem.price);

      // Preserve the existing mode, only default if mode is missing
      if (editingItem.mode) {
        setCalculatorMode(editingItem.mode);
        if (editingItem.mode === 'dozen') {
          setCalculatorDozen(editingItem.quantity.dozens || 1);
          setCalculatorQuantity(null);
        } else {
          setCalculatorQuantity(editingItem.quantity);
          setCalculatorDozen(1);
        }
      } else {
        // Default settings based on category
        if (activeCategory === Category.VEG_FRUITS) {
          // Fruits: Default to dozen mode
          setCalculatorMode('dozen');
          setCalculatorDozen(1);
          setCalculatorQuantity(null);
        } else if (activeCategory === Category.DAIRY) {
          // Dairy: Default to liter mode with 500ml
          setCalculatorMode('liter');
          setCalculatorQuantity(DAIRY_QUANTITIES[1]); // 500 ml
          setCalculatorDozen(1);
        } else {
          // Others: Default to weight mode with 1 Kilo
          setCalculatorMode('weight');
          setCalculatorQuantity(INDIAN_WEIGHTS[5]); // 1 Kilo
          setCalculatorDozen(1);
        }
      }
      setShowCalculator(true);
    } else if (activeSubCategory && selectedItems.size === 1) {
      // Load selected item for new addition
      const selectedItem = getFilteredItems().find((item: any) => selectedItems.has(Array.from(selectedItems)[0]));
      setCalculatorItem(selectedItem);
      setCalculatorPrice('');
      // For fruits, default to dozen mode
      if (activeCategory === Category.VEG_FRUITS) {
        setCalculatorMode('dozen');
        setCalculatorDozen(1);
        setCalculatorQuantity(null);
      } else {
        setCalculatorMode('weight');
        setCalculatorQuantity(null);
        setCalculatorDozen(1);
      }
      setShowCalculator(true);
    } else if (forceCustom) {
      // Show custom item prompt for custom items (Custom Item button)
      setShowCustomItemPrompt(true);
    } else if (customItemName && customItemCategory) {
      // Opening calculator with custom item data (after custom item prompt)
      setCalculatorMode('weight');
      setCalculatorQuantity(null);
      setCalculatorDozen(1);
      setCalculatorItem({ en: customItemName, hi: '', mr: '' });
      setCalculatorPrice('');
      setShowCalculator(true);
    } else {
      // Floating calculator button - open blank calculator for adding custom item directly to list
      setCalculatorItem(null);
      setCalculatorCustomName('');
      setCalculatorPrice('');
      setCalculatorQuantity(null);
      setCalculatorDozen(1);
      setCalculatorMode('weight');
      setShowCalculator(true);
    }
  };

  // Handle Add/Update Item in Calculator
  const handleAddOrUpdateItem = () => {
    const quantityData = calculatorMode === 'dozen'
      ? {
          dozens: calculatorDozen,
          count: DOZEN_QUANTITIES.find(q => q.dozens === calculatorDozen)?.count || 12,
          name: DOZEN_QUANTITIES.find(q => q.dozens === calculatorDozen)?.name || '1 Dozen',
          nameHi: DOZEN_QUANTITIES.find(q => q.dozens === calculatorDozen)?.nameHi || 'एक दर्जन',
          nameMr: DOZEN_QUANTITIES.find(q => q.dozens === calculatorDozen)?.nameMr || 'एक डझन',
        }
      : calculatorMode === 'packet'
      ? {
          packets: calculatorQuantity?.packets,
          name: `${calculatorQuantity?.packets} Packet${(calculatorQuantity?.packets || 0) > 1 ? 's' : ''}`,
          nameHi: `${calculatorQuantity?.packets} पैकेट`,
          nameMr: `${calculatorQuantity?.packets} पॅकेट`,
        }
      : {
          grams: calculatorQuantity?.grams,
          ml: calculatorQuantity?.ml,
          name: calculatorQuantity?.name,
          nameHi: calculatorQuantity?.nameHi,
          nameMr: calculatorQuantity?.nameMr,
        };

    if (editingItem) {
      const updatedItems = [...currentList!.items];
      const index = updatedItems.findIndex(i => i.id === editingItem.id);
      if (index !== -1) {
        updatedItems[index] = {
          ...editingItem,
          mode: calculatorMode,
          price: calculatorPrice,
          quantity: quantityData,
          calculatedPrices: calculateAllPrices(parseFloat(calculatorPrice), calculatorMode === 'dozen' ? calculatorDozen : calculatorQuantity, calculatorMode, editingItem.category),
        };
        const updatedList = { ...currentList!, items: updatedItems };
        setCurrentList(updatedList);
        setShoppingLists(shoppingLists.map(l => l.id === currentList!.id ? updatedList : l));
      }
    } else {
      const newItem = {
        id: `item-${Date.now()}`,
        itemId: calculatorItem?.id || -1,
        name: calculatorCustomName || calculatorItem?.en || 'Custom Item',
        nameHi: '',
        nameMr: '',
        category: activeCategory!,
        mode: calculatorMode,
        quantity: quantityData,
        price: calculatorPrice,
        calculatedPrices: calculateAllPrices(parseFloat(calculatorPrice), calculatorMode === 'dozen' ? calculatorDozen : calculatorQuantity, calculatorMode, activeCategory!),
      };
      const updatedList = { ...currentList!, items: [...currentList!.items, newItem] };
      setCurrentList(updatedList);
      setShoppingLists(shoppingLists.map(l => l.id === currentList!.id ? updatedList : l));
    }
    setShowCalculator(false);
    setEditingItem(null);
    setCalculatorItem(null);
    setCalculatorCustomName('');
    setCalculatorPrice('');
    setCalculatorQuantity(null);
    setCalculatorDozen(1);
    setCalculatorMode('weight');
  };

  return (
    <div
      className="min-h-screen flex flex-col bg-gradient-to-br from-slate-100 via-white to-slate-100 dark:bg-gradient-to-br dark:from-slate-950 dark:via-black dark:to-slate-950"
      style={{ fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, "Noto Sans Devanagari", sans-serif' }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Header - Only app name and theme toggle */}
      <header className="sticky top-0 z-50 backdrop-blur-lg border-b bg-white/80 border-slate-300 dark:bg-black/80 dark:border-slate-800">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-extrabold tracking-tight bg-gradient-to-r from-lime-400 to-lime-600 bg-clip-text text-transparent">
              SabjiRate
            </h1>
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
            </div>
          </div>

          {/* Sub-header - Back, Clear, Custom Item buttons */}
          {activeCategory && (
            <div className="flex items-center gap-2 mt-3 pt-3 border-t border-slate-200 dark:border-slate-700">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleBackWithDiscardCheck(() => {
                  if (activeSubCategory) {
                    // Going to subcategories - preserve selections
                    setActiveSubCategory(null);
                  } else {
                    // Going to home - might show discard confirmation
                    setActiveCategory(null);
                  }
                }, activeSubCategory === null)}
                className="text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => openCalculator(true)}
                className="border-slate-300 text-slate-600 hover:bg-slate-200 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add custom item to
              </Button>
              {allSelectedItems.length > 0 && (
                <Button
                  size="sm"
                  onClick={createList}
                  className="bg-lime-500 hover:bg-lime-600 text-black font-medium"
                >
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  Create List ({allSelectedItems.length})
                </Button>
              )}
            </div>
          )}
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
                {/* Sub-header sub - Category name and text */}
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                    {activeCategory === Category.VEG_FRUITS && '🥬🍎 Fruits & Vegetables'}
                    {activeCategory === Category.KIRANA && '🧺 Kirana / Grocery'}
                  </h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Select a subcategory
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {activeCategory === Category.VEG_FRUITS && CATEGORY_INFO[Category.VEG_FRUITS].subcategories.map((sub) => (
                    <Card
                      key={sub.key}
                      onClick={() => { setActiveSubCategory(sub.key); setSearchQuery(''); }}
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
                      onClick={() => { setActiveSubCategory(sub.key); setSearchQuery(''); }}
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
                
                {/* Custom Item Button in subcategory selection view */}
                <div className="mt-6 flex justify-center">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openCalculator(true)}
                    className="border-slate-300 text-slate-600 hover:bg-slate-200 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Custom Item
                  </Button>
                </div>
              </div>
            ) : (
              // Items View
              <div>
                {/* Sub-header sub - Subcategory name and text */}
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
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

                <div className="flex gap-3 mb-4">
                  <div className="flex-1 relative text-slate-900 dark:text-white">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <Input
                      type="text"
                      placeholder="Search items..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 bg-white border-slate-300 text-slate-900 placeholder:text-slate-400 dark:bg-slate-800 dark:border-slate-700 dark:text-white dark:placeholder:text-slate-500"
                    />
                  </div>
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
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => { setEditingItem(item); openCalculator(); }}
                          className="border-slate-300 text-slate-600 dark:border-slate-600 dark:text-slate-300"
                        >
                          {item.price ? 'Edit Price' : 'Add Price'}
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => {
                            const updatedList = { ...currentList!, items: currentList!.items.filter(i => i.id !== item.id) };
                            setCurrentList(updatedList);
                            setShoppingLists(shoppingLists.map(l => l.id === currentList!.id ? updatedList : l));
                          }}
                          className="bg-red-600 text-white border-red-700 hover:bg-red-700 dark:bg-red-700 dark:border-red-700 dark:text-white"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    {item.price && item.quantity && (
                      <div className="p-3 rounded-lg bg-slate-200 dark:bg-slate-900/50">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm text-slate-600 dark:text-slate-300">
                            Base: {item.quantity.name} @ ₹{item.price} {item.mode === 'packet' ? `/packet` : item.mode === 'dozen' ? `(${item.quantity.count} pieces)` : item.mode === 'weight' && item.category === Category.DAIRY ? `(liter)` : ''}
                          </span>
                          <span className="text-lg font-bold text-lime-500">
                            {item.mode === 'packet'
                              ? `${item.quantity.packets} Packet${item.quantity.packets > 1 ? 's' : ''} = ₹${(parseFloat(item.price) * item.quantity.packets).toFixed(2)}`
                              : item.mode === 'dozen'
                              ? `1 Dozen = ₹${((parseFloat(item.price) / item.quantity.dozens)).toFixed(2)} (₹${((parseFloat(item.price) / item.quantity.count)).toFixed(2)}/piece)`
                              : `1 ${item.category === Category.DAIRY ? 'Liter' : 'KG'} = ₹${((parseFloat(item.price) / ((item.quantity.grams || item.quantity.ml) / 1000))).toFixed(2)}`
                            }
                          </span>
                        </div>
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
                      Total Cost
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
            {/* Custom Item Name Input (only when adding custom item via floating button, NOT when editing) */}
            {calculatorCustomName && !editingItem && (
              <div>
                <Label className="text-sm font-medium text-slate-700 dark:text-slate-200">
                  Item Name
                </Label>
                <Input
                  type="text"
                  placeholder="Enter item name (optional)"
                  value={calculatorCustomName}
                  onChange={(e) => setCalculatorCustomName(e.target.value)}
                  className="w-full px-4 py-3 bg-white border-slate-300 text-slate-900 placeholder:text-slate-400 dark:bg-slate-800 dark:border-slate-700 dark:text-white dark:placeholder:text-slate-500"
                />
              </div>
            )}

            {/* Mode Toggle - All 4 Options Available */}
            <div className="flex gap-2 flex-wrap">
              <Button
                type="button"
                variant={calculatorMode === 'dozen' ? 'default' : 'outline'}
                onClick={() => { setCalculatorMode('dozen'); setCalculatorQuantity(null); }}
                className={calculatorMode === 'dozen' ? 'bg-lime-500 hover:bg-lime-600 text-black' : 'border-slate-300 text-slate-600 dark:border-slate-600 dark:text-slate-300'}
              >
                ◉ Dozen
              </Button>
              <Button
                type="button"
                variant={calculatorMode === 'weight' ? 'default' : 'outline'}
                onClick={() => { setCalculatorMode('weight'); setCalculatorQuantity(null); }}
                className={calculatorMode === 'weight' ? 'bg-lime-500 hover:bg-lime-600 text-black' : 'border-slate-300 text-slate-600 dark:border-slate-600 dark:text-slate-300'}
              >
                ⚖️ Weight
              </Button>
              <Button
                type="button"
                variant={calculatorMode === 'packet' ? 'default' : 'outline'}
                onClick={() => { setCalculatorMode('packet'); setCalculatorQuantity(null); }}
                className={calculatorMode === 'packet' ? 'bg-lime-500 hover:bg-lime-600 text-black' : 'border-slate-300 text-slate-600 dark:border-slate-600 dark:text-slate-300'}
              >
                📦 Packet
              </Button>
              <Button
                type="button"
                variant={calculatorMode === 'liter' ? 'default' : 'outline'}
                onClick={() => { setCalculatorMode('liter'); setCalculatorQuantity(null); }}
                className={calculatorMode === 'liter' ? 'bg-lime-500 hover:bg-lime-600 text-black' : 'border-slate-300 text-slate-600 dark:border-slate-600 dark:text-slate-300'}
              >
                🥤 Liter
              </Button>
            </div>

            {/* Quantity Selection */}
            <div className="space-y-3">
              {calculatorMode === 'dozen' ? (
                <>
                  <Label className="text-sm font-medium text-slate-700 dark:text-slate-200">
                    Select quantity (dozens)
                  </Label>
                  <select
                    value={String(calculatorDozen)}
                    onChange={(e) => setCalculatorDozen(Number(e.target.value))}
                    className="w-full px-4 py-3 rounded-md border bg-white border-slate-300 text-slate-900 placeholder:text-slate-400 dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                  >
                    {DOZEN_QUANTITIES.map((q, idx) => (
                      <option key={idx} value={String(q.dozens)}>
                        {q.name} ({q.nameHi} / {q.nameMr}) - {q.count} pieces
                      </option>
                    ))}
                  </select>
                </>
              ) : calculatorMode === 'liter' ? (
                <>
                  <Label className="text-sm font-medium text-slate-700 dark:text-slate-200">
                    Select quantity (liters)
                  </Label>
                  <select
                    value={calculatorQuantity?.ml ? String(calculatorQuantity.ml) : ''}
                    onChange={(e) => {
                      const quantity = DAIRY_QUANTITIES.find(q => String(q.ml) === e.target.value);
                      setCalculatorQuantity(quantity);
                    }}
                    className="w-full px-4 py-3 rounded-md border bg-white border-slate-300 text-slate-900 placeholder:text-slate-400 dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                  >
                    <option value="">Select liter</option>
                    {DAIRY_QUANTITIES.map((q, idx) => (
                      <option key={idx} value={String(q.ml)}>
                        {q.name} ({q.nameHi} / {q.nameMr})
                      </option>
                    ))}
                  </select>
                </>
              ) : (
                <>
                  <Label className="text-sm font-medium text-slate-700 dark:text-slate-200">
                    Select quantity ({calculatorMode === 'weight' ? 'weight' : 'packet count'})
                  </Label>
                  <select
                    value={calculatorMode === 'weight'
                      ? String(calculatorQuantity?.grams !== undefined ? calculatorQuantity.grams : calculatorQuantity?.ml !== undefined ? calculatorQuantity.ml : '')
                      : String(calculatorQuantity?.packets !== undefined ? calculatorQuantity.packets : '')}
                    onChange={(e) => {
                      const value = e.target.value;
                      const quantities = calculatorMode === 'packet' ? PACKET_QUANTITIES : INDIAN_WEIGHTS;
                      const quantity = quantities.find(q => String(calculatorMode === 'packet' ? q.packets : (q.grams || q.ml)) === value);
                      setCalculatorQuantity(quantity);
                    }}
                    className="w-full px-4 py-3 rounded-md border bg-white border-slate-300 text-slate-900 placeholder:text-slate-400 dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                  >
                    <option value="">Select {calculatorMode === 'weight' ? 'weight' : 'packet count'}</option>
                    {(calculatorMode === 'packet' ? PACKET_QUANTITIES : INDIAN_WEIGHTS).map((q, idx) => (
                      <option key={idx} value={String(calculatorMode === 'packet' ? q.packets : (q.grams || q.ml))}>
                        {q.name} ({q.nameHi} / {q.nameMr}) {calculatorMode === 'weight' ? `- ${q.grams ? `${q.grams}g` : `${q.ml}ml`}` : ''}
                      </option>
                    ))}
                  </select>
                </>
              )}
              <Input
                type="number"
                placeholder="Enter price (₹)"
                value={calculatorPrice}
                onChange={(e) => setCalculatorPrice(e.target.value)}
                className="w-full px-4 py-3 bg-white border-slate-300 text-slate-900 placeholder:text-slate-400 dark:bg-slate-800 dark:border-slate-700 dark:text-white dark:placeholder:text-slate-500"
              />
            </div>

            {calculatorPrice && (calculatorMode === 'dozen' || calculatorQuantity) && (
              <div className="space-y-2">
                <Label className="text-sm font-medium text-slate-700 dark:text-slate-200">
                  {calculatorMode === 'dozen' ? 'Price for all dozen quantities:' : calculatorMode === 'packet' ? 'Price for all packet quantities:' : activeCategory === Category.DAIRY ? 'Price for all liter quantities:' : 'Price for all quantities:'}
                </Label>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {calculateAllPrices(parseFloat(calculatorPrice), calculatorQuantity, calculatorMode).map((q, idx) => (
                    <div key={idx} className="p-3 rounded-md border bg-slate-50 border-slate-200 dark:bg-slate-800 dark:border-slate-700">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-slate-900 dark:text-white">
                            {q.weight}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            {q.nameHi} / {q.nameMr} {calculatorMode === 'weight' && (q.grams ? `- ${q.grams}g` : `- ${q.ml}ml`)}
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
            {calculatorPrice && (calculatorMode === 'dozen' || calculatorQuantity) && (
              <Button
                onClick={handleAddOrUpdateItem}
                disabled={!calculatorPrice || (calculatorMode !== 'dozen' && !calculatorQuantity)} className="bg-lime-500 hover:bg-lime-600 text-black font-medium">
                  {editingItem ? 'Update Item' : 'Add to List'}
                </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Custom Item Prompt Dialog */}
      <Dialog open={showCustomItemPrompt} onOpenChange={setShowCustomItemPrompt}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl text-slate-900 dark:text-white">
              Add Custom Item
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label className="text-sm font-medium text-slate-700 dark:text-slate-200">
                Enter item name
              </Label>
              <Input
                type="text"
                placeholder="Enter item name (e.g., Special Chocolate)"
                value={customItemName}
                onChange={(e) => setCustomItemName(e.target.value)}
                className="w-full px-4 py-3 rounded-md border bg-white border-slate-300 text-slate-900 placeholder:text-slate-400 dark:bg-slate-800 dark:border-slate-700 dark:text-white"
              />
            </div>
            <div>
              <Label className="text-sm font-medium text-slate-700 dark:text-slate-200">
                Select category
              </Label>
              <select
                value={customItemCategory || ''}
                onChange={(e) => setCustomItemCategory(e.target.value as Category)}
                className="w-full px-4 py-3 rounded-md border bg-white border-slate-300 text-slate-900 placeholder:text-slate-400 dark:bg-slate-800 dark:border-slate-700 dark:text-white"
              >
                <option value="">Select category</option>
                <option value={Category.VEG_FRUITS}>🥬🍎 Fruits & Vegetables</option>
                <option value={Category.DAIRY}>🥛 Milk & Dairy</option>
                <option value={Category.KIRANA}>🧺 Kirana / Grocery</option>
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowCustomItemPrompt(false)}
              className="border-slate-400 text-slate-600 hover:bg-slate-200 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
            >
              Cancel
            </Button>
            <Button
              onClick={() => { setShowCustomItemPrompt(false); if (customItemName && customItemCategory) { openCalculator(true); }}}
              disabled={!customItemName || !customItemCategory}
              className="bg-lime-500 hover:bg-lime-600 text-black font-medium"
            >
              Continue to Calculator
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Discard Confirmation Dialog */}
      <Dialog open={showDiscardConfirm} onOpenChange={setShowDiscardConfirm}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl text-slate-900 dark:text-white">
              Discard Selections?
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="flex items-center gap-3 mb-4 text-amber-600 dark:text-amber-400">
              <AlertTriangle className="w-6 h-6" />
              <p className="text-sm">
                You have {allSelectedItems.length} item(s) selected. Going back will discard these selections.
              </p>
            </div>
            <div className="flex gap-3 justify-end">
              <Button
                variant="outline"
                onClick={() => setShowDiscardConfirm(false)}
                className="border-slate-400 text-slate-600 hover:bg-slate-200 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
              >
                No
              </Button>
              <Button
                variant="destructive"
                onClick={() => {
                  if (pendingNavigation) {
                    pendingNavigation();
                  }
                }}
                className="bg-red-500 hover:bg-red-600 text-white"
              >
                Yes
              </Button>
            </div>
          </div>
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
                    const listToRemove = shoppingLists.find(l => l.id === listToDelete);
                    if (listToRemove) {
                      const isCurrentList = currentList && currentList.id === listToDelete;

                      // Move list to deleted history before deleting
                      const deletedList = { ...listToRemove, id: `deleted-${Date.now()}` };
                      setDeletedLists([deletedList, ...deletedLists]);

                      // Clear current list if it's the one being deleted
                      if (isCurrentList) {
                        setCurrentList(null);
                      }

                      // Always remove the list from active lists
                      setShoppingLists(shoppingLists.filter(l => l.id !== listToDelete));
                    }
                  }
                  setShowDeleteConfirm(false);
                  setListToDelete(null);
                }}
                className="bg-red-500 hover:bg-red-600 text-white"
              >
                Delete List
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

    </div>
  );
}
