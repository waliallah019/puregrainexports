// my-leather-platform/app/catalog/finished-products/[productId]/page.tsx
import { IProduct, Pagination } from "@/types/product";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { ArrowLeft, Package, AlertCircle, ShoppingCart } from "lucide-react"; // Added ShoppingCart
import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Metadata } from "next";

import ProductDetailContent from "@/components/product-details/ProductDetailContent";

interface ProductDetailPageProps {
  params: {
    productId: string;
  };
}

async function getProduct(productId: string): Promise<IProduct | null> {
  const baseUrl = process.env.NEXT_INTERNAL_BACKEND_BASE_URL;
  const apiPath = process.env.NEXT_PUBLIC_BACKEND_API_URL;

  if (!baseUrl || !apiPath) {
    console.error(
      "Missing NEXT_INTERNAL_BACKEND_BASE_URL or NEXT_PUBLIC_BACKEND_API_URL in environment."
    );
    return null;
  }

  try {
    const fetchUrl = `${baseUrl}${apiPath}/finished-products/${productId}`;
    const res = await fetch(fetchUrl, {
      cache: "no-store",
    });

    if (!res.ok) {
      if (res.status === 404) {
        return null;
      }
      const errorData = await res.json();
      console.error(
        `Failed to fetch product ${productId} (Status: ${res.status}):`,
        errorData.message || res.statusText
      );
      throw new Error(
        `Failed to fetch product: ${errorData.message || res.statusText}`
      );
    }

    const data = await res.json();
    return data.data;
  } catch (error) {
    console.error(`Error fetching product ${productId}:`, error);
    return null;
  }
}

async function getRelatedProducts(
  currentProductType: string,
  excludeProductId: string,
  limit: number = 6
): Promise<IProduct[]> {
  const baseUrl = process.env.NEXT_INTERNAL_BACKEND_BASE_URL;
  const apiPath = process.env.NEXT_PUBLIC_BACKEND_API_URL;

  if (!baseUrl || !apiPath) {
    console.error("Missing environment variables for related products.");
    return [];
  }

  try {
    const fetchUrl = `${baseUrl}${apiPath}/finished-products?productType=${currentProductType}&limit=${limit + 2}`;
    const res = await fetch(fetchUrl, {
      cache: "no-store",
    });

    if (!res.ok) {
      console.error(
        `Failed to fetch related products (Status: ${res.status})`
      );
      return [];
    }

    const data: { data: IProduct[]; pagination: Pagination } = await res.json();
    return data.data.filter((p) => p._id !== excludeProductId).slice(0, limit);
  } catch (error) {
    console.error("Error fetching related products:", error);
    return [];
  }
}

async function getSimilarProducts(
  currentProduct: IProduct,
  limit: number = 6
): Promise<IProduct[]> {
  const baseUrl = process.env.NEXT_INTERNAL_BACKEND_BASE_URL;
  const apiPath = process.env.NEXT_PUBLIC_BACKEND_API_URL;

  if (!baseUrl || !apiPath) {
    return [];
  }

  try {
    // Get products with similar materials or in similar price range
    const fetchUrl = `${baseUrl}${apiPath}/finished-products?limit=20`;
    const res = await fetch(fetchUrl, {
      cache: "no-store",
    });

    if (!res.ok) {
      return [];
    }

    const data = await res.json();
    const allProducts: IProduct[] = data.data;

    // Filter and score products based on similarity
    const similarProducts = allProducts
      .filter((p) => p._id !== currentProduct._id)
      .map((product) => {
        let score = 0;

        // Same product type gets highest score
        if (product.productType === currentProduct.productType) score += 10;

        // Similar material
        if (
          product.materialUsed
            .toLowerCase()
            .includes(currentProduct.materialUsed.toLowerCase()) ||
          currentProduct.materialUsed
            .toLowerCase()
            .includes(product.materialUsed.toLowerCase())
        ) {
          score += 8;
        }

        // Using pricePerUnit directly for comparison, assuming it's consistent
        // Make sure pricePerUnit is consistently populated in your IProduct type.
        // If not, you might need to adjust or calculate a base price.
        const priceDiff = currentProduct.pricePerUnit && product.pricePerUnit
            ? Math.abs(product.pricePerUnit - currentProduct.pricePerUnit) / currentProduct.pricePerUnit
            : Infinity; // If price is missing, don't score on it
        if (priceDiff <= 0.3) score += 5;

        // Common tags
        const commonTags = product.tags.filter((tag) =>
          currentProduct.tags.some(
            (cTag) => cTag.toLowerCase() === tag.toLowerCase()
          )
        );
        score += commonTags.length * 2;

        return { product, score };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map((item) => item.product);

    return similarProducts;
  } catch (error) {
    console.error("Error fetching similar products:", error);
    return [];
  }
}

// Enhanced breadcrumb component
const Breadcrumb = ({ product }: { product: IProduct }) => (
  <nav className="flex items-center space-x-2 text-sm text-muted-foreground mb-6">
    <Link href="/" className="hover:text-foreground transition-colors">
      Home
    </Link>
    <span>/</span>
    <Link href="/catalog" className="hover:text-foreground transition-colors">
      Catalog
    </Link>
    <span>/</span>
    <Link
      href="/catalog/finished-products"
      className="hover:text-foreground transition-colors"
    >
      Finished Products
    </Link>
    <span>/</span>
    <Link
      href={`/catalog/finished-products?type=${product.productType}`}
      className="hover:text-foreground transition-colors"
    >
      {product.productType}s
    </Link>
    <span>/</span>
    <span className="text-foreground font-medium truncate max-w-32">
      {product.name}
    </span>
  </nav>
);

// Error boundary component
const ErrorDisplay = ({ error }: { error: string }) => (
  <div className="min-h-screen bg-background">
    <Header />
    <section className="py-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center py-16">
          <AlertCircle className="w-16 h-16 text-destructive mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-foreground mb-4">
            Unable to Load Product
          </h1>
          <p className="text-muted-foreground mb-8 max-w-md mx-auto">
            {error}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild variant="outline">
              <Link href="/catalog/finished-products">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Catalog
              </Link>
            </Button>
            <Button asChild>
              <Link href="/custom-manufacturing">
                Explore Custom Manufacturing
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
    <Footer />
  </div>
);

// Generate metadata for SEO
export async function generateMetadata({
  params,
}: ProductDetailPageProps): Promise<Metadata> {
  const product = await getProduct(params.productId);

  if (!product) {
    return {
      title: "Product Not Found",
      description: "The requested product could not be found.",
    };
  }

  return {
    title: `${product.name} - Premium Leather ${product.productType}`,
    description:
      product.description.length > 160
        ? product.description.substring(0, 157) + "..."
        : product.description,
    openGraph: {
      title: product.name,
      description: product.description,
      images: product.images.length > 0 ? [product.images[0]] : [],
    },
  };
}

export default async function ProductDetailPage({
  params,
}: ProductDetailPageProps) {
  try {
    const product = await getProduct(params.productId);

    if (!product) {
      notFound();
    }

    // Fetch both related and similar products
    const [relatedProducts, similarProducts] = await Promise.all([
      getRelatedProducts(product.productType, product._id, 4),
      getSimilarProducts(product, 4),
    ]);

    // Combine and deduplicate
    const allRecommendations = [...relatedProducts, ...similarProducts];
    const uniqueRecommendations = allRecommendations
      .filter(
        (product, index, self) =>
          index === self.findIndex((p) => p._id === product._id)
      )
      .slice(0, 6);

    return (
      <div className="min-h-screen bg-background">
        <Header />

        <section className="py-8 md:py-12 bg-gradient-to-br from-amber-50 via-background to-amber-50/50 dark:from-amber-950/20 dark:via-background dark:to-amber-950/10">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            {/* Enhanced Navigation */}
            <div className="flex flex-col sm:flex-row sm:items-start sm:gap-x-8 sm:gap-y-4 mb-8">
              {/* This div now wraps both the Breadcrumb and the button/badges */}
              <div className="flex-grow">
                <Breadcrumb product={product} />
              </div>

              <div className="flex items-center gap-3 flex-wrap">
                {" "}
                {/* Add flex-wrap for better responsiveness */}
                <Button variant="outline" size="sm" asChild>
                  <Link href="/catalog/finished-products">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Catalog
                  </Link>
                </Button>
                {product.isFeatured && (
                  <Badge
                    variant="secondary"
                    className="bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-100"
                  >
                    Featured
                  </Badge>
                )}
                {product.sampleAvailable && (
                  <Badge
                    variant="outline"
                    className="border-green-200 text-green-800 dark:border-green-800 dark:text-green-400 flex items-center"
                  >
                    <ShoppingCart className="mr-1 h-3 w-3" /> Sample Available
                  </Badge>
                )}
              </div>
            </div>

            {/* Product Status Bar */}
            <div className="bg-card/80 backdrop-blur-sm rounded-lg border border-border p-4 mb-6">
              <div className="flex flex-wrap items-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Package className="w-4 h-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Availability:</span>
                  <Badge
                    variant={
                      product.availability === "In Stock" ? "default" : "secondary"
                    }
                    className={
                      product.availability === "In Stock"
                        ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"
                        : product.availability === "Limited Stock"
                        ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100"
                        : "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100"
                    }
                  >
                    {product.availability}
                  </Badge>
                </div>
                {product.availability === "In Stock" && (
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">Stock:</span>
                    <span className="font-medium text-foreground">
                      {product.stockCount} units
                    </span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">MOQ:</span>
                  <span className="font-medium text-foreground">
                    {product.moq} units
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">Category:</span>
                  <Link
                    href={`/catalog/finished-products?type=${product.productType}`}
                    className="font-medium text-amber-700 dark:text-amber-400 hover:underline"
                  >
                    {product.productType}
                  </Link>
                </div>
              </div>
            </div>

            {/* Pass enhanced data to the Client Component */}
            <ProductDetailContent
              product={product}
              relatedProducts={uniqueRecommendations}
            />
          </div>
        </section>

        <Footer />
      </div>
    );
  } catch (error) {
    console.error("Error in ProductDetailPage:", error);
    return (
      <ErrorDisplay
        error="An unexpected error occurred while loading the product. Please try again later."
      />
    );
  }
}