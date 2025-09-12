// my-leather-platform/components/raw-leather-details/RawLeatherDetailContent.tsx
"use client";

import React, { useState } from "react";
import { IRawLeather } from "@/types/rawLeather";
import Image from "next/image";
import {
  Package,
  Palette,
  Ruler,
  Eye,
  PiggyBank,
  Star,
  CheckCircle,
  DollarSign,
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
import RawLeatherCard from "@/components/raw-leather-details/RawLeatherCard";

interface RawLeatherDetailContentProps {
  rawLeather: IRawLeather;
  relatedRawLeather: IRawLeather[];
}

export default function RawLeatherDetailContent({
  rawLeather,
  relatedRawLeather,
}: RawLeatherDetailContentProps) {
  const [selectedImage, setSelectedImage] = useState<string>(
    rawLeather.images[0] || "/placeholder-image.jpg"
  );

  return (
    <div className="grid lg:grid-cols-2 gap-x-12 gap-y-8">
      {/* Image Gallery */}
      <div className="flex flex-col items-center">
        <div className="relative w-full aspect-video md:aspect-square overflow-hidden rounded-lg border border-border bg-muted mb-4">
          {selectedImage ? (
            <Image
              src={selectedImage}
              alt={rawLeather.name}
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
            {rawLeather.images.map((image, index) => (
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
                    alt={`${rawLeather.name} thumbnail ${index + 1}`}
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

      {/* Raw Leather Details */}
      <div className="space-y-6">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold text-foreground">
            {rawLeather.name}
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed">
            {rawLeather.description}
          </p>
        </div>

        <Separator />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-3">
            <PiggyBank className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-muted-foreground">Animal</p>
              <p className="font-semibold text-foreground">
                {rawLeather.animal}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Palette className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-muted-foreground">Leather Type</p>
              <p className="font-semibold text-foreground">
                {rawLeather.leatherType}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Ruler className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-muted-foreground">Thickness</p>
              <p className="font-semibold text-foreground">
                {rawLeather.thickness}"
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Eye className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-muted-foreground">Finish</p>
              <p className="font-semibold text-foreground">
                {rawLeather.finish}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Package className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-muted-foreground">Minimum Order</p>
              <p className="font-semibold text-foreground">
                {rawLeather.minOrderQuantity} sq ft
              </p>
            </div>
          </div>
          {rawLeather.size && (
            <div className="flex items-center gap-3">
              <Ruler className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-muted-foreground">Typical Size</p>
                <p className="font-semibold text-foreground">
                  {rawLeather.size}
                </p>
              </div>
            </div>
          )}
        </div>

        {rawLeather.colors && rawLeather.colors.length > 0 && (
          <>
            <Separator />
            <div className="space-y-2">
              <h3 className="text-md font-semibold text-foreground">
                Available Colors:
              </h3>
              <div className="flex flex-wrap gap-2">
                {rawLeather.colors.map((color, index) => (
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
            <span className="text-lg text-muted-foreground block">Price:</span>
            <span className="text-4xl font-bold text-foreground">
              {rawLeather.currency}
              {rawLeather.pricePerSqFt.toFixed(2)}
            </span>
            <span className="text-lg text-muted-foreground"> / sq ft</span>
            {rawLeather.negotiable && (
              <Badge
                variant="outline"
                className="ml-2 bg-blue-100 text-blue-800"
              >
                Negotiable
              </Badge>
            )}
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            {rawLeather.sampleAvailable && (
              <Button asChild variant="outline">
                <Link
                  href={`/sample-request?productId=${rawLeather._id}&productTypeCategory=raw-leather`}
                >
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  Request Sample
                </Link>
              </Button>
            )}
            {/* Changed "Inquire Now" to "Request Quote" */}
            <Button asChild className="bg-blue-600 hover:bg-blue-700">
              <Link href={`/quote-request?itemId=${rawLeather._id}&itemName=${encodeURIComponent(rawLeather.name)}&itemTypeCategory=raw-leather`}>
                <FileText className="mr-2 h-4 w-4" />
                Request Quote
              </Link>
            </Button>
          </div>
        </div>

        {/* Price Tiers (if available) */}
        {rawLeather.priceTier && rawLeather.priceTier.length > 0 && (
          <>
            <Separator />
            <div className="space-y-2">
              <h3 className="text-md font-semibold text-foreground">
                Volume Pricing:
              </h3>
              <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                {rawLeather.priceTier.map((tier, index) => (
                  <div key={index} className="flex justify-between">
                    <span className="text-muted-foreground">
                      {tier.minQty}+ sq ft:
                    </span>
                    <span className="font-semibold text-foreground">
                      {rawLeather.currency}
                      {tier.price.toFixed(2)} / sq ft
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Related Raw Leather */}
      {relatedRawLeather && relatedRawLeather.length > 0 && (
        <div className="lg:col-span-2 mt-12">
          <h2 className="text-2xl font-bold text-foreground mb-6">
            Explore Related Materials
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {relatedRawLeather.map((rl) => (
              <RawLeatherCard key={rl._id} rawLeather={rl} viewMode="grid" />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}