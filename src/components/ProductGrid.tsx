'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import type { CategoryLower, Product } from '@/types/sabjirate';

interface ProductGridProps {
  category: CategoryLower;
}

export function ProductGrid({ category }: ProductGridProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProducts() {
      try {
        setLoading(true);
        const response = await fetch(`/api/products?category=${category}`);
        if (!response.ok) throw new Error('Failed to fetch products');
        const data = await response.json();
        setProducts(data);
      } catch (error) {
        console.error('Error fetching products:', error);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, [category]);

  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {[...Array(8)].map((_, i) => (
          <Card key={i} className="p-4 bg-[#121212] border-[#1e1e1e] animate-pulse">
            <div className="h-20 bg-[#1e1e1e] rounded mb-3" />
            <div className="h-4 bg-[#1e1e1e] rounded mb-2" />
            <div className="h-4 bg-[#1e1e1e] rounded w-2/3" />
          </Card>
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <Card className="p-8 bg-[#121212] border-[#1e1e1e] text-center">
        <p className="text-gray-400">
          No products available for {category} yet.
        </p>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {products.map((product) => (
        <Card
          key={product.id}
          className="p-4 bg-[#121212] border-[#1e1e1e] hover:border-[#ccff00]/50 transition-colors cursor-pointer"
        >
          <div className="flex flex-col">
            <div className="flex items-center justify-center h-20 mb-3 bg-[#0a0a0a] rounded-lg">
              <span className="text-3xl">🥬</span>
            </div>
            <h3 className="font-semibold text-sm mb-1 line-clamp-1">
              {product.nameEn}
            </h3>
            {product.nameHi && (
              <p className="text-xs text-gray-400 mb-2">{product.nameHi}</p>
            )}
            <div className="mt-auto">
              <p className="text-[#ccff00] font-bold text-sm">
                ₹{(Math.random() * 50 + 20).toFixed(0)}/{product.baseUnit === 'LITER' ? 'L' : 'kg'}
              </p>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
