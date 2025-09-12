// my-leather-platform/components/product-details/ProductDetailContent.tsx
"use client";

import React, { useState } from "react";
import { IProduct } from "@/types/product";
import Image from "next/image";
import {
  Package,
  Palette,
  Ruler,
  Eye,
  Star,
  CheckCircle,
  ShoppingCart,
  FileText // Keep FileText for "Request Quote" on detail page
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import ProductCard from "@/components/product-details/ProductCard";

interface ProductDetailContentProps {
  product: IProduct;
  relatedProducts: IProduct[];
}

export default function ProductDetailContent({
  product,
  relatedProducts,
}: ProductDetailContentProps) {
  const [selectedImage, setSelectedImage] = useState<string>(
    product.images[0] || "/placeholder-image.jpg"
  );

  return (
    <div className="grid lg:grid-cols-2 gap-x-12 gap-y-8">
      {/* Image Gallery */}
      <div className="flex flex-col items-center">
        <div className="relative w-full aspect-video md:aspect-square overflow-hidden rounded-lg border border-border bg-muted mb-4">
          {selectedImage ? (
            <Image
              src={selectedImage}
              alt={product.name}
              fill
              className="object-contain"
              priority
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-muted">
              <Package className="h-24 w-24 text-muted-foreground" />
            </div>
          )}
        </div>
        <Carousel className="w-full max-w-sm">
          <CarouselContent className="-ml-2">
            {product.images.map((image, index) => (
              <CarouselItem key={index} className="basis-1/3 pl-2">
                <div
                  className="relative aspect-square rounded-md overflow-hidden cursor-pointer border-2 transition-all duration-200"
                  onClick={() => setSelectedImage(image)}
                  style={{
                    borderColor:
                      selectedImage === image
                        ? "hsl(var(--primary))"
                        : "transparent",
                  }}
                >
                  <Image
                    src={image}
                    alt={`${product.name} thumbnail ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>
      </div>

      {/* Product Details */}
      <div className="space-y-6">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold text-foreground">
            {product.name}
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed">
            {product.description}
          </p>
        </div>

        <Separator />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-3">
            <Package className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-muted-foreground">Product Type</p>
              <p className="font-semibold text-foreground">
                {product.productType}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Palette className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-muted-foreground">Material Used</p>
              <p className="font-semibold text-foreground">
                {product.materialUsed}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Ruler className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-muted-foreground">Dimensions</p>
              <p className="font-semibold text-foreground">
                {product.dimensions}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Eye className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-muted-foreground">MOQ</p>
              <p className="font-semibold text-foreground">{product.moq}</p>
            </div>
          </div>
        </div>

        {product.colorVariants && product.colorVariants.length > 0 && (
          <>
            <Separator />
            <div className="space-y-2">
              <h3 className="text-md font-semibold text-foreground">
                Color Variants:
              </h3>
              <div className="flex flex-wrap gap-2">
                {product.colorVariants.map((color, index) => (
                  <Badge key={index} variant="secondary">
                    {color}
                  </Badge>
                ))}
              </div>
            </div>
          </>
        )}

        <Separator />

        {/* Pricing and Actions */}
        <div className="flex items-center justify-between">
          <div>
            <span className="text-lg text-muted-foreground block">
              Starting from
            </span>
            <span className="text-4xl font-bold text-foreground">
              {product.currency}
              {product.pricePerUnit.toFixed(2)}
            </span>
            <span className="text-lg text-muted-foreground">
              {" "}
              / {product.priceUnit}
            </span>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            {product.sampleAvailable && (
              <Button asChild variant="outline">
                <Link
                  href={`/sample-request?productId=${product._id}&productTypeCategory=finished-product`}
                >
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  Request Sample
                </Link>
              </Button>
            )}
            {/* Changed "Inquire Now" to "Request Quote" */}
            <Button asChild className="bg-blue-600 hover:bg-blue-700">
              <Link href={`/quote-request?itemId=${product._id}&itemName=${encodeURIComponent(product.name)}&itemTypeCategory=finished-product`}>
                <FileText className="mr-2 h-4 w-4" />
                Request Quote
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Related/Recommended Products */}
      {relatedProducts && relatedProducts.length > 0 && (
        <div className="lg:col-span-2 mt-12">
          <h2 className="text-2xl font-bold text-foreground mb-6">
            You might also like
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {relatedProducts.map((p) => (
              <ProductCard key={p._id} product={p} viewMode="grid" />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}