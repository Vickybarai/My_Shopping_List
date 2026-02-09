import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// POST /api/lists/[id]/items - Add item to list
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { productId, quantity, price } = body;

    if (!productId || !quantity || !price) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const item = await db.listItem.create({
      data: {
        listId: params.id,
        productId,
        quantity: parseFloat(quantity),
        price: parseFloat(price),
      },
      include: {
        product: true,
      },
    });

    return NextResponse.json(item, { status: 201 });
  } catch (error) {
    console.error('Error creating list item:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
