import { NextRequest, NextResponse } from 'next/server';
import { ALL_ITEMS, Category } from '@/lib/sabjirate-seed';

// POST /api/ai/text-to-list - Parse text input to shopping list
export async function POST(request: NextRequest) {
  try {
    const { text } = await request.json();

    if (!text || typeof text !== 'string') {
      return NextResponse.json(
        { error: 'Text input is required' },
        { status: 400 }
      );
    }

    // Parse the text input
    // Examples: "Tomato 1kg, Onion 250g", "आलू 40 रुपये"
    const parsedItems = parseTextToList(text);

    return NextResponse.json({
      originalText: text,
      parsedItems,
      success: true,
    });
  } catch (error) {
    console.error('Error parsing text:', error);
    return NextResponse.json(
      { error: 'Failed to parse text', success: false },
      { status: 500 }
    );
  }
}

/**
 * Parse text input to extract items and quantities
 * Supports Hindi, Marathi, and English
 */
function parseTextToList(text: string): Array<{
  item: { id: string; en: string; hi: string; mr: string };
  quantity?: string;
  weight?: number;
  unit?: string;
  price?: number;
}> {
  const items: any[] = [];
  const lowercaseText = text.toLowerCase();

  // Split by commas, newlines, or "and"
  const segments = lowercaseText
    .split(/[,|\n| aur | और | व ]/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  for (const segment of segments) {
    // Try to find item name
    let foundItem: any = null;
    let quantity = '';
    let weight: number | undefined;
    let unit = '';
    let price: number | undefined;

    // Extract price (look for ₹, rs, रुपये, rupee patterns)
    const priceMatch = segment.match(/(?:₹|rs\.?|rupee|\d+\s*(?:रुपये|रु))/i);
    if (priceMatch) {
      const priceNumber = segment.match(/\d+(?:\.\d+)?/);
      if (priceNumber) {
        price = parseFloat(priceNumber[0]);
      }
    }

    // Extract weight (look for kg, gram, g, किलो, etc.)
    const weightMatch = segment.match(/(\d+(?:\.\d+)?)\s*(kg|g|gram|liter|ml|लीटर|किलो|ग्राम|एमएल)/i);
    if (weightMatch) {
      weight = parseFloat(weightMatch[1]);
      const unitText = weightMatch[2].toLowerCase();
      
      if (unitText.includes('kg') || unitText.includes('किलो')) {
        unit = 'kg';
      } else if (unitText.includes('liter') || unitText.includes('लीटर')) {
        unit = 'L';
      } else if (unitText.includes('ml') || unitText.includes('एमएल')) {
        unit = 'ml';
      } else {
        unit = 'g';
      }
    }

    // Try to match item in all categories
    const allItemsList = [
      ...ALL_ITEMS.VEGETABLES,
      ...ALL_ITEMS.FRUITS,
      ...ALL_ITEMS.DAIRY,
      ...ALL_ITEMS.KIRANA,
    ];

    for (const item of allItemsList) {
      const lowerEn = item.en.toLowerCase();
      const lowerHi = item.hi.toLowerCase();
      const lowerMr = item.mr.toLowerCase();

      // Check exact match
      if (lowercaseText.includes(lowerEn) || lowercaseText.includes(lowerHi) || lowercaseText.includes(lowerMr)) {
        foundItem = item;
        break;
      }
    }

    // If item found, add to list
    if (foundItem) {
      items.push({
        item: foundItem,
        quantity: weight ? `${weight}${unit}` : undefined,
        weight,
        unit,
        price,
      });
    }
  }

  return items;
}
