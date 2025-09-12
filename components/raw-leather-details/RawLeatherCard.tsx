// my-leather-platform/components/raw-leather-details/RawLeatherCard.tsx
import React from 'react';
import { IRawLeather } from '@/types/rawLeather';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Eye,
  Palette,
  Ruler,
  PiggyBank,
  Star,
  CheckCircle,
  DollarSign,
  Package,
  ShoppingCart // Still needed for Sample
} from 'lucide-react'; // Removed FileText
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface RawLeatherCardProps {
  rawLeather: IRawLeather;
  viewMode?: 'grid' | 'list';
}

export default function RawLeatherCard({ rawLeather, viewMode = 'grid' }: RawLeatherCardProps) {
  const {
    _id,
    name,
    description,
    animal,
    leatherType,
    finish,
    colors,
    pricePerSqFt,
    minOrderQuantity,
    thickness,
    images,
    isFeatured,
    sampleAvailable,
    negotiable,
    createdAt
  } = rawLeather;

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
            {negotiable && (
              <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200">
                <DollarSign className="mr-1 h-3 w-3" />
                Negotiable
              </Badge>
            )}
          </div>
        </div>

        <CardContent className="p-6 flex flex-col flex-1">
          <div className="space-y-4 flex-1 flex flex-col">
            {/* Header */}
            <div>
              <h3 className="text-lg font-semibold text-foreground line-clamp-1">{name}</h3>
              <p className="text-sm text-muted-foreground line-clamp-2">{description}</p>
            </div>

            {/* Details */}
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="flex items-center gap-2">
                <PiggyBank className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">{animal}</span>
              </div>
              <div className="flex items-center gap-2">
                <Ruler className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">{thickness}"</span>
              </div>
              <div className="flex items-center gap-2">
                <Palette className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">{leatherType}</span>
              </div>
              <div className="flex items-center gap-2">
                <Eye className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">{finish}</span>
              </div>
            </div>

            {/* Colors - Fixed height container */}
            <div className="min-h-[32px] flex items-start">
              {colors && colors.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {colors.slice(0, 3).map((color, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {color}
                    </Badge>
                  ))}
                  {colors.length > 3 && (
                    <Badge variant="secondary" className="text-xs">
                      +{colors.length - 3} more
                    </Badge>
                  )}
                </div>
              )}
            </div>

            {/* Price and Action - Push to bottom */}
            <div className="flex items-center justify-between pt-2 mt-auto">
              <div>
                <div className="text-lg font-bold text-foreground">
                  ${pricePerSqFt.toFixed(2)}/sq ft
                </div>
                <div className="text-xs text-muted-foreground">
                  Min: {minOrderQuantity} sq ft
                </div>
              </div>
              {/* Reverted to original "View Details" button */}
              <Button size="sm" asChild className="bg-amber-700 text-white hover:bg-amber-800">
                <Link href={`/catalog/raw-leather/${_id}`}>
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
                    <p className="text-muted-foreground mt-1">{description}</p>
                  </div>
                  <div className="text-right ml-4">
                    <div className="text-xl font-bold text-foreground">
                      ${pricePerSqFt.toFixed(2)}/sq ft
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Min: {minOrderQuantity} sq ft
                    </div>
                  </div>
                </div>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <PiggyBank className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <div className="text-muted-foreground">Animal</div>
                    <div className="font-medium">{animal}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Ruler className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <div className="text-muted-foreground">Thickness</div>
                    <div className="font-medium">{thickness}"</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Palette className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <div className="text-muted-foreground">Type</div>
                    <div className="font-medium">{leatherType}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Eye className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <div className="text-muted-foreground">Finish</div>
                    <div className="font-medium">{finish}</div>
                  </div>
                </div>
              </div>

              {/* Colors and Badges */}
              <div className="flex flex-wrap gap-2">
                {colors && colors.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {colors.slice(0, 5).map((color, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {color}
                      </Badge>
                    ))}
                    {colors.length > 5 && (
                      <Badge variant="secondary" className="text-xs">
                        +{colors.length - 5} more
                      </Badge>
                    )}
                  </div>
                )}
                {sampleAvailable && (
                  <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-200">
                    <CheckCircle className="mr-1 h-3 w-3" />
                    Sample Available
                  </Badge>
                )}
                {negotiable && (
                  <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200">
                    <DollarSign className="mr-1 h-3 w-3" />
                    Price Negotiable
                  </Badge>
                )}
              </div>
            </div>

            {/* Action Button */}
            <div className="flex gap-2 pt-4">
              {sampleAvailable && (
                <Button
                  size="sm"
                  variant="outline"
                  asChild
                  className="flex-1"
                >
                  <Link href={`/sample-request?productId=${_id}&productTypeCategory=raw-leather`}>
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
                <Link href={`/catalog/raw-leather/${_id}`}>
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