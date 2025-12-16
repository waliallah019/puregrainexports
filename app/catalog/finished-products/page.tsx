'use client';

import { useEffect, useState, useCallback } from 'react';
import { IProduct, IProductType, Pagination } from '@/types/product';
import { Button } from '@/components/ui/button';
import ProductCard from '@/components/product-details/ProductCard';
// import ProductFilters from '@/components/catalog/ProductFilters'; // Keep if used for other filters
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { PageBanner } from '@/components/layout/page-banner';
import {
  ArrowRight,
  Grid,
  List,
  Filter,
  Search,
  Loader2,
  Package,
  X,
  Tag,
  Box, // Generic icon for dynamic product types
  ChevronRight,
  Upload,
  CheckCircle,
} from 'lucide-react';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

const SORT_OPTIONS = [
  { value: 'featured', label: 'Featured First' },
  { value: 'newest', label: 'Newest First' },
  { value: 'oldest', label: 'Oldest First' },
  { value: 'price-low', label: 'Price: Low to High' },
  { value: 'price-high', label: 'Price: High to Low' },
  { value: 'name-asc', label: 'Name: A to Z' },
  { value: 'name-desc', label: 'Name: Z to A' },
];

const AVAILABILITY_OPTIONS = [
  { value: 'all', label: 'All Availability' },
  { value: 'In Stock', label: 'In Stock' },
  { value: 'Made to Order', label: 'Made to Order' },
  { value: 'Limited Stock' },
];

interface ProductSkeleton {
  id: number;
}

const ProductCardSkeleton = ({ id }: ProductSkeleton) => (
  <div className="bg-card animate-pulse overflow-hidden rounded-xl border border-border shadow-sm">
    <div className="aspect-square bg-muted" />
    <div className="space-y-3 p-6">
      <div className="h-4 w-3/4 rounded bg-muted" />
      <div className="h-3 w-1/2 rounded bg-muted" />
      <div className="h-3 w-full rounded bg-muted" />
      <div className="h-3 w-2/3 rounded bg-muted" />
      <div className="flex items-center justify-between pt-2">
        <div className="h-5 w-1/3 rounded bg-muted" />
        <div className="h-9 w-20 rounded bg-muted" />
      </div>
    </div>
  </div>
);

const EmptyState = ({ searchTerm, selectedType }: { searchTerm: string; selectedType: string }) => (
  <div className="py-20 text-center">
    <div className="bg-muted/50 mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full">
      <Package className="h-12 w-12 text-muted-foreground" />
    </div>
    <h3 className="mb-3 text-2xl font-semibold text-foreground">No products found</h3>
    <p className="text-muted-foreground mx-auto mb-8 max-w-md text-lg">
      {searchTerm || selectedType !== 'all'
        ? "Try adjusting your search or filter criteria to find what you're looking for."
        : "We're currently updating our product catalog. Please check back soon."}
    </p>
    <Button size="lg" asChild className="bg-amber-700 text-white hover:bg-amber-800">
      <Link href="/custom-manufacturing">
        Explore Custom Manufacturing
        <ArrowRight className="ml-2 h-5 w-5" />
      </Link>
    </Button>
  </div>
);

// CategoryCard now accepts dynamicCategory which includes the icon
const CategoryCard = ({
  category,
  isSelected,
  onClick,
  productCount,
}: {
  category: { value: string; label: string; icon: typeof Box }; // Updated type
  isSelected: boolean;
  onClick: () => void;
  productCount: number;
}) => (
  <button
    onClick={onClick}
    className={cn(
      'flex w-full items-center gap-3 rounded-xl border p-4 text-left transition-all duration-200',
      isSelected
        ? 'bg-amber-50 shadow-md border-amber-200 text-amber-800 dark:bg-amber-950/30 dark:border-amber-800 dark:text-amber-200'
        : 'border-border bg-card hover:border-muted-foreground/30 hover:bg-muted/50',
    )}
  >
    <category.icon className="h-6 w-6 text-current" />
    <div className="min-w-0 flex-1">
      <div className="text-sm font-medium">{category.label}</div>
      <div className="text-xs text-muted-foreground">{productCount} products</div>
    </div>
  </button>
);

export default function FinishedProductsPage() {
  const [productsFromBackend, setProductsFromBackend] = useState<IProduct[]>([]); // This holds the *currently filtered and sorted* data from backend
  const [displayedProducts, setDisplayedProducts] = useState<IProduct[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalProductsCount, setTotalProductsCount] = useState(0); // Total products matching current filters/search
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Dynamic Product Types State
  const [dynamicProductTypes, setDynamicProductTypes] = useState<
    { value: string; label: string; icon: typeof Box }[]
  >([]); // Using Box as a generic icon for now

  // Filter and search states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedAvailability, setSelectedAvailability] = useState('all');
  const [sortBy, setSortBy] = useState('featured');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [showMobileCategories, setShowMobileCategories] = useState(false);

  const productsPerPage = 12;

  // Fetch dynamic product types
  const fetchDynamicProductTypes = useCallback(async () => {
    try {
      const res = await fetch(`/api/product-types`);
      if (!res.ok) throw new Error('Failed to load product types');

      const data = await res.json();
      if (data.data && Array.isArray(data.data)) {
        // Map fetched types to the expected format for your UI
        const mappedTypes = data.data.map((type: IProductType) => ({
          value: type.name,
          label: type.name,
          icon: Box, // Use a generic icon or map specific ones if you have them
        }));
        setDynamicProductTypes([{ value: 'all', label: 'All Products', icon: Tag }, ...mappedTypes]);
      }
    } catch (err: any) {
      console.error('Error fetching dynamic product types:', err.message);
      // Fallback to a default 'All Products' if fetching fails
      setDynamicProductTypes([{ value: 'all', label: 'All Products', icon: Tag }]);
    }
  }, []);

  // Fetch products from the backend with all current filters and sorting
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const queryParams = new URLSearchParams();
      // Ensure currentPage is always 1 when filters or sort change, as we're fetching a new set
      queryParams.append('page', '1');
      queryParams.append('limit', String(productsPerPage * 5)); // Fetch more than `productsPerPage` for smooth loadMore

      if (selectedType !== 'all') {
        queryParams.append('productType', selectedType);
      }
      if (searchTerm) {
        queryParams.append('search', searchTerm);
      }
      if (selectedAvailability !== 'all') {
        queryParams.append('availability', selectedAvailability);
      }

      // Handle sorting parameters for backend
      let backendSortBy = '';
      let backendOrder = '';
      switch (sortBy) {
        case 'newest':
          backendSortBy = 'createdAt';
          backendOrder = 'desc';
          break;
        case 'oldest':
          backendSortBy = 'createdAt';
          backendOrder = 'asc';
          break;
        case 'price-low':
          backendSortBy = 'pricePerUnit';
          backendOrder = 'asc';
          break;
        case 'price-high':
          backendSortBy = 'pricePerUnit';
          backendOrder = 'desc';
          break;
        case 'name-asc':
          backendSortBy = 'name';
          backendOrder = 'asc';
          break;
        case 'name-desc':
          backendSortBy = 'name';
          backendOrder = 'desc';
          break;
        case 'featured':
          // The backend query should handle 'isFeatured' for primary sorting if desired,
          // or we can sort for it client-side after initial fetch.
          // For now, if 'featured' is selected, we won't send a specific sortBy for the backend
          // and will apply it client-side as a post-processing step if needed.
          break;
        default:
          break;
      }

      if (backendSortBy) {
        queryParams.append('sortBy', backendSortBy);
        queryParams.append('order', backendOrder);
      }

      const res = await fetch(`/api/finished-products?${queryParams.toString()}`);
      if (!res.ok) throw new Error('Failed to load products');

      const data = await res.json();

      let fetchedProducts: IProduct[] = data.data || [];

      // Client-side sort for 'featured' if not handled by backend as primary sort
      if (sortBy === 'featured') {
        fetchedProducts.sort((a, b) => {
          if (a.isFeatured && !b.isFeatured) return -1;
          if (!a.isFeatured && b.isFeatured) return 1;
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(); // Fallback sort
        });
      }


      setProductsFromBackend(fetchedProducts); // Store the entire filtered/sorted list
      setTotalProductsCount(data.pagination?.totalProducts || 0); // Total count from backend
      setCurrentPage(1); // Reset page when fetching new filtered/sorted data
    } catch (err: any) {
      setError(err.message || 'Error loading products');
      setProductsFromBackend([]);
      setTotalProductsCount(0);
    } finally {
      setLoading(false);
      setInitialLoading(false);
    }
  }, [selectedType, searchTerm, selectedAvailability, sortBy, productsPerPage]); // Dependencies for refetching

  // Initial data fetch for product types and products
  useEffect(() => {
    fetchDynamicProductTypes();
    fetchProducts();
  }, [fetchDynamicProductTypes, fetchProducts]); // Initial fetch and refetch for filters/sort

  // Update displayed products for current page from productsFromBackend
  useEffect(() => {
    const startIndex = 0;
    const endIndex = currentPage * productsPerPage;
    setDisplayedProducts(productsFromBackend.slice(startIndex, endIndex));
  }, [productsFromBackend, currentPage, productsPerPage]);


  // Get product count for each category
  const getProductCountByCategory = useCallback((categoryValue: string) => {
    if (categoryValue === 'all') return productsFromBackend.length; // Count from the current backend fetch
    return productsFromBackend.filter((product) => product.productType === categoryValue).length;
  }, [productsFromBackend]); // Dependency on productsFromBackend for accurate count


  const loadMore = () => {
    // Increment currentPage, which will trigger the useEffect for displayedProducts
    setCurrentPage((prev) => prev + 1);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedType('all');
    setSelectedAvailability('all');
    setSortBy('featured');
    // fetchProducts() will be triggered by the useEffect for filter changes
  };

  const hasActiveFilters = searchTerm || selectedType !== 'all' || selectedAvailability !== 'all' || sortBy !== 'featured';
  const hasMoreProducts = displayedProducts.length < totalProductsCount; // Compare displayed with total from backend


  return (
    <div className="min-h-screen bg-background">
      <Header />
      <PageBanner
        title="Finest Leather Goods"
        subtitle="Discover our curated collection of premium leather products, each piece crafted with decades of expertise and unwavering attention to detail."
        badge="Premium Collection"
        compact={true}
      />

      {/* Hero Section - Enhanced */}
      <section className="bg-gradient-to-br from-amber-50/30 via-background to-amber-50/20 dark:from-amber-950/5 dark:via-background dark:to-amber-950/5 py-12 border-b">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <Card className="border-0 shadow-leather bg-gradient-to-br from-amber-50 to-background dark:from-amber-950/10 dark:to-background">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-amber-700 dark:text-amber-400 mb-1">
                  {totalProductsCount}
                </div>
                <div className="text-xs text-muted-foreground">Total Products</div>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-leather bg-gradient-to-br from-blue-50 to-background dark:from-blue-950/10 dark:to-background">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-blue-700 dark:text-blue-400 mb-1">
                  {displayedProducts.length}
                </div>
                <div className="text-xs text-muted-foreground">Showing</div>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-leather bg-gradient-to-br from-green-50 to-background dark:from-green-950/10 dark:to-background">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-green-700 dark:text-green-400 mb-1">
                  {productsFromBackend.filter(p => p.availability === 'In Stock').length}
                </div>
                <div className="text-xs text-muted-foreground">In Stock</div>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-leather bg-gradient-to-br from-purple-50 to-background dark:from-purple-950/10 dark:to-background">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-purple-700 dark:text-purple-400 mb-1">
                  {productsFromBackend.filter(p => p.isFeatured).length}
                </div>
                <div className="text-xs text-muted-foreground">Featured</div>
              </CardContent>
            </Card>
          </div>

          {/* Search and Filters Section - Enhanced */}
          <div className="mx-auto max-w-6xl">
            {/* Desktop Search and Filters */}
            <div className="hidden lg:block">
              <Card className="border-0 shadow-leather-lg bg-card/90 backdrop-blur-sm">
                <CardContent className="p-6">
                <div className="space-y-6">
                  {/* Search Bar */}
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 transform text-muted-foreground" />
                    <Input
                      placeholder="Search products..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-12 h-12 text-lg border-2 border-border/50 focus:border-amber-500"
                    />
                  </div>

                  {/* Categories */}
                  <div>
                    <h3 className="mb-4 text-sm font-medium text-muted-foreground uppercase tracking-wide">
                      Categories
                    </h3>
                    <div className="grid grid-cols-7 gap-3">
                      {dynamicProductTypes.map((category) => ( // Use dynamicProductTypes
                        <button
                          key={category.value}
                          onClick={() => {
                            setSelectedType(category.value);
                            setCurrentPage(1); // Reset page on category change
                          }}
                          className={cn(
                            'flex flex-col items-center gap-2 rounded-xl border-2 p-4 text-center transition-all duration-200',
                            selectedType === category.value
                              ? 'bg-amber-50 border-amber-300 text-amber-800 shadow-md dark:bg-amber-950/30 dark:border-amber-700 dark:text-amber-200'
                              : 'border-border bg-card hover:border-muted-foreground/30 hover:bg-muted/50',
                          )}
                        >
                          <category.icon className="h-6 w-6" />
                          <div className="text-xs font-medium">{category.label}</div>
                          <div className="text-xs text-muted-foreground">
                            {getProductCountByCategory(category.value)}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Filters Row */}
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <Select value={selectedAvailability} onValueChange={(value) => {
                        setSelectedAvailability(value);
                        setCurrentPage(1); // Reset page on filter change
                      }}>
                        <SelectTrigger className="h-12 border-2 border-border/50 focus:border-amber-500">
                          <SelectValue placeholder="Availability" />
                        </SelectTrigger>
                        <SelectContent>
                          {AVAILABILITY_OPTIONS.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex-1">
                      <Select value={sortBy} onValueChange={(value) => {
                        setSortBy(value);
                        setCurrentPage(1); // Reset page on sort change
                      }}>
                        <SelectTrigger className="h-12 border-2 border-border/50 focus:border-amber-500">
                          <SelectValue placeholder="Sort by" />
                        </SelectTrigger>
                        <SelectContent>
                          {SORT_OPTIONS.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex items-center gap-2 rounded-lg bg-muted p-1">
                      <Button
                        variant={viewMode === 'grid' ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => setViewMode('grid')}
                        className="h-10 w-10 p-0"
                      >
                        <Grid className="h-4 w-4" />
                      </Button>
                      <Button
                        variant={viewMode === 'list' ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => setViewMode('list')}
                        className="h-10 w-10 p-0"
                      >
                        <List className="h-4 w-4" />
                      </Button>
                    </div>

                    {hasActiveFilters && (
                      <Button
                        variant="outline"
                        onClick={clearFilters}
                        className="h-12 border-2 border-border/50 hover:border-destructive/50 hover:text-destructive"
                      >
                        <X className="mr-2 h-4 w-4" />
                        Clear Filters
                      </Button>
                    )}
                  </div>
                </div>
                </CardContent>
              </Card>
            </div>

            {/* Mobile Search and Filters */}
            <div className="lg:hidden">
              <div className="rounded-2xl border border-border bg-card/80 backdrop-blur-sm p-4 shadow-lg">
                <div className="space-y-4">
                  {/* Search Bar */}
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 transform text-muted-foreground" />
                    <Input
                      placeholder="Search products..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-12 h-12 text-lg border-2 border-border/50 focus:border-amber-500"
                    />
                  </div>

                  {/* Filter Toggle */}
                  <Button
                    variant="outline"
                    onClick={() => setShowMobileCategories(!showMobileCategories)}
                    className="w-full justify-between h-12 border-2 border-border/50"
                  >
                    <span className="flex items-center gap-2">
                      <Filter className="h-4 w-4" />
                      Categories & Filters
                    </span>
                    {hasActiveFilters && (
                      <Badge variant="secondary" className="ml-2">
                        Active
                      </Badge>
                    )}
                  </Button>

                  {showMobileCategories && (
                    <div className="space-y-4 border-t pt-4">
                      <div className="grid grid-cols-2 gap-2">
                        {dynamicProductTypes.map((category) => ( // Use dynamicProductTypes
                          <button
                            key={category.value}
                            onClick={() => {
                              setSelectedType(category.value);
                              setCurrentPage(1); // Reset page on category change
                            }}
                            className={cn(
                              'flex items-center gap-2 rounded-xl border-2 p-3 text-left transition-all duration-200',
                              selectedType === category.value
                                ? 'bg-amber-50 border-amber-300 text-amber-800 shadow-md dark:bg-amber-950/30 dark:border-amber-700 dark:text-amber-200'
                                : 'border-border bg-card hover:border-muted-foreground/30 hover:bg-muted/50',
                            )}
                          >
                            <category.icon className="h-5 w-5" />
                            <div className="min-w-0 flex-1">
                              <div className="text-sm font-medium">{category.label}</div>
                              <div className="text-xs text-muted-foreground">
                                {getProductCountByCategory(category.value)}
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <Select value={selectedAvailability} onValueChange={(value) => {
                          setSelectedAvailability(value);
                          setCurrentPage(1); // Reset page on filter change
                        }}>
                          <SelectTrigger className="h-12 border-2 border-border/50">
                            <SelectValue placeholder="Availability" />
                          </SelectTrigger>
                          <SelectContent>
                            {AVAILABILITY_OPTIONS.map((option) => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>

                        <Select value={sortBy} onValueChange={(value) => {
                          setSortBy(value);
                          setCurrentPage(1); // Reset page on sort change
                        }}>
                          <SelectTrigger className="h-12 border-2 border-border/50">
                            <SelectValue placeholder="Sort by" />
                          </SelectTrigger>
                          <SelectContent>
                            {SORT_OPTIONS.map((option) => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2 rounded-lg bg-muted p-1 flex-1">
                          <Button
                            variant={viewMode === 'grid' ? 'default' : 'ghost'}
                            size="sm"
                            onClick={() => setViewMode('grid')}
                            className="h-10 flex-1"
                          >
                            <Grid className="h-4 w-4 mr-2" />
                            Grid
                          </Button>
                          <Button
                            variant={viewMode === 'list' ? 'default' : 'ghost'}
                            size="sm"
                            onClick={() => setViewMode('list')}
                            className="h-10 flex-1"
                          >
                            <List className="h-4 w-4 mr-2" />
                            List
                          </Button>
                        </div>

                        {hasActiveFilters && (
                          <Button
                            variant="outline"
                            onClick={clearFilters}
                            className="h-12 border-2 border-border/50 hover:border-destructive/50 hover:text-destructive"
                          >
                            <X className="mr-2 h-4 w-4" />
                            Clear
                          </Button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="pb-12">
          {/* Results Count */}
          {!initialLoading && (
            <div className="mb-8 text-center">
              <div className="text-lg text-muted-foreground">
                {productsFromBackend.length > 0 ? (
                  <>
                    Showing {Math.min(displayedProducts.length, productsFromBackend.length)} of{' '}
                    {productsFromBackend.length} products
                  </>
                ) : (
                  'No products found'
                )}
              </div>
            </div>
          )}

          {/* Products Grid */}
          {error && (
            <div className="mb-8 rounded-xl border border-destructive/20 bg-destructive/10 px-6 py-4 text-center text-destructive">
              {error}
            </div>
          )}

          {initialLoading ? (
            <div className="space-y-8">
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                <span className="ml-3 text-lg text-muted-foreground">
                  Loading premium products...
                </span>
              </div>
              <div
                className={cn(
                  'grid gap-6',
                  viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'grid-cols-1',
                )}
              >
                {Array.from({ length: productsPerPage }).map((_, index) => ( // Render 12 skeletons
                  <ProductCardSkeleton key={index} id={index} />
                ))}
              </div>
            </div>
          ) : productsFromBackend.length === 0 ? (
            <EmptyState searchTerm={searchTerm} selectedType={selectedType} />
          ) : (
            <div className="space-y-8">
              <div
                className={cn(
                  'grid gap-6',
                  viewMode === 'grid'
                    ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
                    : 'grid-cols-1 lg:grid-cols-2',
                )}
              >
                {displayedProducts.map((product, index) => (
                  <div
                    key={product._id}
                    className="animate-in fade-in duration-300"
                    style={{ animationDelay: `${(index % productsPerPage) * 50}ms` }}
                  >
                    <ProductCard product={product} />
                  </div>
                ))}
              </div>

              {/* Load More Button */}
              {hasMoreProducts && (
                <div className="pt-8 text-center">
                  <Button
                    onClick={loadMore}
                    disabled={loading}
                    size="lg"
                    className="min-w-40 bg-amber-700 text-white hover:bg-amber-800"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Loading...
                      </>
                    ) : (
                      <>
                        Load More Products
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Call to Custom Manufacturing - Enhanced */}
        <Card className="mb-16 border-0 shadow-leather-lg bg-gradient-to-br from-amber-50 via-amber-100/50 to-amber-50 dark:from-amber-950/20 dark:via-amber-900/10 dark:to-amber-950/20 overflow-hidden relative">
          <div className="absolute inset-0 opacity-5 texture-leather" />
          <CardContent className="p-12 text-center relative z-10">
            <div className="max-w-3xl mx-auto space-y-6">
              <div className="flex justify-center">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-600 to-amber-700 flex items-center justify-center">
                  <Upload className="w-8 h-8 text-white" />
                </div>
              </div>
              <h3 className="text-3xl sm:text-4xl font-bold text-foreground">Need Something Unique?</h3>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Can't find exactly what you're looking for? Our master craftsmen can create bespoke
                leather goods tailored to your exact specifications with the same premium quality and
                meticulous attention to detail.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                <Button
                  size="lg"
                  asChild
                  className="bg-amber-800 hover:bg-amber-900 dark:bg-amber-700 dark:hover:bg-amber-800 px-8 py-6 text-lg shadow-leather-lg hover:scale-105 transition-all micro-bounce"
                >
                  <Link href="/custom-manufacturing">
                    Explore Custom Manufacturing
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  asChild
                  className="border-2 border-amber-800 text-amber-800 hover:bg-amber-50 dark:border-amber-400 dark:text-amber-400 dark:hover:bg-amber-950/20 px-8 py-6 text-lg hover:scale-105 transition-all"
                >
                  <Link href="/quote-request">
                    Request Custom Quote
                    <ChevronRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-6 pt-6 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Flexible MOQ</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>4-8 Week Turnaround</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Quality Guaranteed</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Footer />
    </div>
  );
}