// my-leather-platform/components/product-details/ProductCard.tsx
"use client";

import React from 'react';
import { IProduct } from '@/types/product';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Package,
  Palette,
  Ruler,
  Star,
  Eye,
  ShoppingCart // Still needed for Sample
} from 'lucide-react'; // Removed FileText
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface ProductCardProps {
  product: IProduct;
  viewMode?: 'grid' | 'list';
}

export default function ProductCard({ product, viewMode = 'grid' }: ProductCardProps) {
  const {
    _id,
    name,
    productType,
    materialUsed,
    dimensions,
    colorVariants,
    moq,
    images,
    isFeatured,
    sampleAvailable,
    createdAt
  } = product;

  // Grid view (default)
  if (viewMode === 'grid') {
    return (
      <Card className="group overflow-hidden border border-border bg-card shadow-sm transition-all duration-300 hover:shadow-lg hover:border-amber-200 h-full flex flex-col">
        <div className="relative overflow-hidden">
          {/* Image */}
          <div className="aspect-video bg-muted">
            {images && images.length > 0 ? (
              <img
                src={images[0]}
                alt={name}
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-muted">
                <Package className="h-12 w-12 text-muted-foreground" />
              </div>
            )}
          </div>

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-wrap gap-1">
            {isFeatured && (
              <Badge className="bg-amber-100 text-amber-800 border-amber-200">
                <Star className="mr-1 h-3 w-3" />
                Featured
              </Badge>
            )}
            {sampleAvailable && (
              <Badge variant="outline" className="border-green-200 text-green-800 bg-green-50">
                <ShoppingCart className="mr-1 h-3 w-3" />
                Sample
              </Badge>
            )}
          </div>
        </div>

        <CardContent className="p-6 flex flex-col flex-1">
          <div className="space-y-4 flex-1 flex flex-col">
            {/* Header */}
            <div>
              <h3 className="text-lg font-semibold text-foreground line-clamp-1">{name}</h3>
              <p className="text-sm text-muted-foreground">{productType} • {materialUsed}</p>
            </div>

            {/* Details */}
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="flex items-center gap-2">
                <Package className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">{productType}</span>
              </div>
              <div className="flex items-center gap-2">
                <Ruler className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">{dimensions}</span>
              </div>
              <div className="flex items-center gap-2">
                <Palette className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">{materialUsed}</span>
              </div>
              <div className="flex items-center gap-2">
                <Eye className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">MOQ: {moq}</span>
              </div>
            </div>

            {/* Colors - Fixed height container */}
            <div className="min-h-[32px] flex items-start">
              {colorVariants && colorVariants.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {colorVariants.slice(0, 3).map((color, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {color}
                    </Badge>
                  ))}
                  {colorVariants.length > 3 && (
                    <Badge variant="secondary" className="text-xs">
                      +{colorVariants.length - 3} more
                    </Badge>
                  )}
                </div>
              )}
            </div>

            {/* MOQ and Action - Push to bottom */}
            <div className="flex items-center justify-between pt-2 mt-auto">
              <div>
                <div className="text-sm font-medium text-muted-foreground">
                  Minimum Order
                </div>
                <div className="text-lg font-bold text-foreground">
                  {moq}
                </div>
              </div>
              {/* Reverted to original "View Details" button */}
              <Button size="sm" asChild className="bg-amber-700 text-white hover:bg-amber-800">
                <Link href={`/catalog/finished-products/${_id}`}>
                  View Details
                </Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // List view (similar reversion)
  return (
    <Card className="group overflow-hidden border border-border bg-card shadow-sm transition-all duration-300 hover:shadow-lg hover:border-amber-200">
      <div className="flex flex-col md:flex-row">
        {/* Image */}
        <div className="relative flex-shrink-0 md:w-48">
          <div className="aspect-video md:aspect-square bg-muted">
            {images && images.length > 0 ? (
              <img
                src={images[0]}
                alt={name}
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-muted">
                <Package className="h-12 w-12 text-muted-foreground" />
              </div>
            )}
          </div>

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-wrap gap-1">
            {isFeatured && (
              <Badge className="bg-amber-100 text-amber-800 border-amber-200">
                <Star className="mr-1 h-3 w-3" />
                Featured
              </Badge>
            )}
            {sampleAvailable && (
              <Badge variant="outline" className="border-green-200 text-green-800 bg-green-50">
                <ShoppingCart className="mr-1 h-3 w-3" />
                Sample
              </Badge>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 p-6">
          <div className="flex flex-col justify-between h-full">
            <div className="space-y-4">
              {/* Header */}
              <div>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-foreground">{name}</h3>
                    <p className="text-muted-foreground mt-1">{productType} • {materialUsed}</p>
                  </div>
                  <div className="text-right ml-4">
                    <div className="text-sm font-medium text-muted-foreground">
                      Minimum Order
                    </div>
                    <div className="text-xl font-bold text-foreground">
                      {moq}
                    </div>
                  </div>
                </div>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Package className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <div className="text-muted-foreground">Type</div>
                    <div className="font-medium">{productType}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Ruler className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <div className="text-muted-foreground">Dimensions</div>
                    <div className="font-medium">{dimensions}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Palette className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <div className="text-muted-foreground">Material</div>
                    <div className="font-medium">{materialUsed}</div>
                  </div>
                </div>
              </div>

              {/* Colors */}
              <div className="flex flex-wrap gap-2">
                {colorVariants && colorVariants.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    <span className="text-sm font-medium text-muted-foreground mr-2">Colors:</span>
                    {colorVariants.slice(0, 5).map((color, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {color}
                      </Badge>
                    ))}
                    {colorVariants.length > 5 && (
                      <Badge variant="secondary" className="text-xs">
                        +{colorVariants.length - 5} more
                      </Badge>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 pt-4">
              {sampleAvailable && (
                <Button
                  size="sm"
                  variant="outline"
                  asChild
                  className="flex-1"
                >
                  <Link href={`/sample-request?productId=${_id}&productTypeCategory=finished-product`}>
                    <ShoppingCart className="mr-2 h-4 w-4" />
                    Request Sample
                  </Link>
                </Button>
              )}
              {/* Reverted to original "View Details" button */}
              <Button
                asChild
                className={cn("flex-1 bg-amber-700 text-white hover:bg-amber-800", !sampleAvailable && "w-full")}
              >
                <Link href={`/catalog/finished-products/${_id}`}>
                  View Details
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}