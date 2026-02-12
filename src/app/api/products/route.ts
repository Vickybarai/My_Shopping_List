import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import type { Category, BaseUnit } from '@/types/sabjirate';

// GET /api/products?category={category}
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const category = searchParams.get('category');

    if (!category) {
      return NextResponse.json(
        { error: 'Category parameter is required' },
        { status: 400 }
      );
    }

    // Map lowercase category to enum
    const categoryMap: Record<string, Category> = {
      vegetables: 'VEGETABLES',
      fruits: 'FRUITS',
      dairy: 'DAIRY',
      kirana: 'KIRANA',
    };

    const categoryEnum = categoryMap[category.toLowerCase()];
    if (!categoryEnum) {
      return NextResponse.json(
        { error: 'Invalid category' },
        { status: 400 }
      );
    }

    // Fetch products with category-specific business logic
    const products = await db.product.findMany({
      where: { category: categoryEnum },
      orderBy: { nameEn: 'asc' },
    });

    // Apply business logic: Add allowed weights based on category
    const productsWithWeights = products.map(product => {
      const baseUnit = product.baseUnit as BaseUnit;
      
      if (categoryEnum === 'DAIRY') {
        // STRICT DAIRY RULE: Liter only
        return {
          ...product,
          baseUnit: 'LITER' as BaseUnit,
          allowedWeights: [250, 500, 750, 1000], // ML
        };
      } else {
        // STRICT VEGETABLE RULE: Kg only
        return {
          ...product,
          baseUnit: 'KILOGRAM' as BaseUnit,
          allowedWeights: [62.5, 125, 250, 375, 500, 750, 1000], // Grams
        };
      }
    });

    return NextResponse.json(productsWithWeights);
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/products - Create a new product
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { nameEn, nameHi, nameMr, category, baseUnit } = body;

    // Validate required fields
    if (!nameEn || !category || !baseUnit) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate category
    const validCategories = ['VEGETABLES', 'FRUITS', 'DAIRY', 'KIRANA'];
    if (!validCategories.includes(category)) {
      return NextResponse.json(
        { error: 'Invalid category' },
        { status: 400 }
      );
    }

    // Validate base unit
    const validUnits = ['KILOGRAM', 'LITER'];
    if (!validUnits.includes(baseUnit)) {
      return NextResponse.json(
        { error: 'Invalid base unit' },
        { status: 400 }
      );
    }

    // STRICT BUSINESS RULE: Dairy must use LITER
    if (category === 'DAIRY' && baseUnit !== 'LITER') {
      return NextResponse.json(
        { error: 'Dairy products must use LITER as base unit' },
        { status: 400 }
      );
    }

    // STRICT BUSINESS RULE: Non-dairy must use KILOGRAM
    if (category !== 'DAIRY' && baseUnit !== 'KILOGRAM') {
      return NextResponse.json(
        { error: 'Non-dairy products must use KILOGRAM as base unit' },
        { status: 400 }
      );
    }

    const product = await db.product.create({
      data: {
        nameEn,
        nameHi: nameHi || null,
        nameMr: nameMr || null,
        category: category as Category,
        baseUnit: baseUnit as BaseUnit,
      },
    });

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
