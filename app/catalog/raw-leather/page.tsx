'use client';

import { useEffect, useState, useCallback } from 'react';
import { IRawLeather, IRawLeatherType, Pagination } from '@/types/rawLeather'; // Import IRawLeatherType
import { Button } from '@/components/ui/button';
import RawLeatherCard from '@/components/raw-leather-details/RawLeatherCard';
import { Badge } from '@/components/ui/badge';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
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
  Box, // Generic icon for dynamic leather types
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

// --- Static Options for other filters (Animal, Finish, Availability, Sort) ---
// These remain hardcoded as they are not expected to be dynamic via CRUD
// but represent inherent properties or fixed options.
const ANIMAL_OPTIONS = [
  { value: 'all', label: 'All Animals' },
  { value: 'Cow', label: 'Cowhide' },
  { value: 'Buffalo', label: 'Buffalo' },
  { value: 'Goat', label: 'Goat Leather' },
  { value: 'Sheep', label: 'Sheepskin' },
  { value: 'Exotic', label: 'Exotic' },
];

const FINISH_OPTIONS = [
  { value: 'all', label: 'All Finishes' },
  { value: 'Aniline', label: 'Aniline' },
  { value: 'Semi-Aniline', label: 'Semi-Aniline' },
  { value: 'Pigmented', label: 'Pigmented' },
  { value: 'Pull-up', label: 'Pull-Up' },
  { value: 'Crazy Horse', label: 'Crazy Horse' },
  { value: 'Waxed', label: 'Waxed' },
  { value: 'Nappa', label: 'Nappa' },
  { value: 'Embossed', label: 'Embossed' },
];

const SORT_OPTIONS = [
  { value: 'featured', label: 'Featured First' },
  { value: 'newest', label: 'Newest First' },
  { value: 'oldest', label: 'Oldest First' },
  { value: 'price-low', label: 'Price: Low to High' },
  { value: 'price-high', label: 'Price: High to Low' },
  { value: 'name-asc', label: 'Name: A to Z' },
  { value: 'name-desc', label: 'Name: Z to A' },
];

const AVAILABILITY_OPTIONS_RAW_LEATHER = [
  { value: 'all', label: 'All Availability' },
  { value: 'sampleAvailable', label: 'Sample Available' },
  { value: 'negotiable', label: 'Price Negotiable' },
];

// --- Skeleton Component ---
interface RawLeatherSkeletonProps {
  id: number;
}

const RawLeatherCardSkeleton = ({ id }: RawLeatherSkeletonProps) => (
  <div className="bg-card animate-pulse overflow-hidden rounded-xl border border-border shadow-sm">
    <div className="aspect-video bg-muted" />
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

// --- Empty State Component ---
const EmptyState = ({
  searchTerm,
  selectedLeatherType,
}: {
  searchTerm: string;
  selectedLeatherType: string;
}) => (
  <div className="py-20 text-center">
    <div className="bg-muted/50 mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full">
      <Package className="h-12 w-12 text-muted-foreground" />
    </div>
    <h3 className="mb-3 text-2xl font-semibold text-foreground">No raw leather found</h3>
    <p className="text-muted-foreground mx-auto mb-8 max-w-md text-lg">
      {searchTerm || selectedLeatherType !== 'all'
        ? "Try adjusting your search or filter criteria to find what you're looking for."
        : "We're currently updating our raw leather catalog. Please check back soon."}
    </p>
    <Button size="lg" asChild className="bg-amber-700 text-white hover:bg-amber-800">
      <Link href="/contact">
        Contact Our Experts
        <ArrowRight className="ml-2 h-5 w-5" />
      </Link>
    </Button>
  </div>
);

// --- Category Card Component (Adapted for dynamic types) ---
const CategoryCard = ({
  category,
  isSelected,
  onClick,
  productCount,
}: {
  category: { value: string; label: string; icon: typeof Box | typeof Tag };
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

// --- Main Page Component ---
export default function RawLeatherPage() {
  const [productsFromBackend, setProductsFromBackend] = useState<IRawLeather[]>([]);
  const [displayedRawLeather, setDisplayedRawLeather] = useState<IRawLeather[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalProductsCount, setTotalProductsCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Dynamic Raw Leather Types State
  const [dynamicRawLeatherTypes, setDynamicRawLeatherTypes] = useState<
    { value: string; label: string; icon: typeof Box | typeof Tag }[]
  >([]);

  // Filter and search states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLeatherType, setSelectedLeatherType] = useState('all');
  const [selectedAnimal, setSelectedAnimal] = useState('all');
  const [selectedFinish, setSelectedFinish] = useState('all');
  const [selectedAvailability, setSelectedAvailability] = useState('all');
  const [sortBy, setSortBy] = useState('featured');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showMobileCategories, setShowMobileCategories] = useState(false);

  const productsPerPage = 12;

  // Fetch dynamic raw leather types
  const fetchDynamicRawLeatherTypes = useCallback(async () => {
    try {
      const res = await fetch(`/api/raw-leather-types`);
      if (!res.ok) throw new Error('Failed to load raw leather types');

      const data = await res.json();
      if (data.data && Array.isArray(data.data)) {
        const mappedTypes = data.data.map((type: IRawLeatherType) => ({
          value: type.name,
          label: type.name,
          icon: Box, // Generic icon for dynamically loaded types (using Box)
        }));
        setDynamicRawLeatherTypes([{ value: 'all', label: 'All Leather', icon: Tag }, ...mappedTypes]);
      }
    } catch (err: any) {
      console.error('Error fetching dynamic raw leather types:', err.message);
      setDynamicRawLeatherTypes([{ value: 'all', label: 'All Leather', icon: Tag }]);
    }
  }, []);

  // Fetch raw leather from the backend with all current filters and sorting
  const fetchRawLeather = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const queryParams = new URLSearchParams();
      queryParams.append('page', '1'); // Always start at page 1 when filters/sort change
      queryParams.append('limit', String(productsPerPage * 5)); // Fetch more for smooth client-side loadMore

      if (selectedLeatherType !== 'all') {
        queryParams.append('leatherType', selectedLeatherType);
      }
      if (selectedAnimal !== 'all') {
        queryParams.append('animal', selectedAnimal);
      }
      if (selectedFinish !== 'all') {
        queryParams.append('finish', selectedFinish);
      }
      if (searchTerm) {
        queryParams.append('search', searchTerm);
      }

      // Handle Availability Filters (sampleAvailable, negotiable)
      if (selectedAvailability === 'sampleAvailable') {
        queryParams.append('sampleAvailable', 'true');
      } else if (selectedAvailability === 'negotiable') {
        queryParams.append('negotiable', 'true');
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
          backendSortBy = 'pricePerSqFt';
          backendOrder = 'asc';
          break;
        case 'price-high':
          backendSortBy = 'pricePerSqFt';
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
          // Featured products often have a custom backend logic,
          // or can be handled client-side if the 'isFeatured' flag is available.
          // For now, if 'featured' is selected, we won't send a specific sortBy to backend
          // and will handle it in client-side sort as a primary sort.
          break;
        default:
          break;
      }

      if (backendSortBy) {
        queryParams.append('sortBy', backendSortBy);
        queryParams.append('order', backendOrder);
      }

      const res = await fetch(`/api/raw-leather?${queryParams.toString()}`);
      if (!res.ok) throw new Error('Failed to load raw leather');

      const data = await res.json();
      let fetchedProducts: IRawLeather[] = data.data || [];

      // Client-side sort for 'featured' if not handled by backend as primary sort
      if (sortBy === 'featured') {
        fetchedProducts.sort((a, b) => {
          if (a.isFeatured && !b.isFeatured) return -1;
          if (!a.isFeatured && b.isFeatured) return 1;
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });
      }

      setProductsFromBackend(fetchedProducts);
      setTotalProductsCount(data.pagination?.totalProducts || 0);
      setCurrentPage(1); // Reset page when fetching new data
    } catch (err: any) {
      setError(err.message || 'Error loading raw leather');
      setProductsFromBackend([]);
      setTotalProductsCount(0);
    } finally {
      setLoading(false);
      setInitialLoading(false);
    }
  }, [
    selectedLeatherType,
    selectedAnimal,
    selectedFinish,
    searchTerm,
    selectedAvailability,
    sortBy,
    productsPerPage,
  ]);

  // Initial data fetch for product types and raw leather
  useEffect(() => {
    fetchDynamicRawLeatherTypes();
    fetchRawLeather();
  }, [fetchDynamicRawLeatherTypes, fetchRawLeather]);

  // Update displayed products for current page from productsFromBackend
  useEffect(() => {
    const startIndex = 0;
    const endIndex = currentPage * productsPerPage;
    setDisplayedRawLeather(productsFromBackend.slice(startIndex, endIndex));
  }, [productsFromBackend, currentPage, productsPerPage]);

  // Get product count for each category (Leather Type) from the *currently fetched backend data*
  const getProductCountByCategory = useCallback(
    (categoryValue: string) => {
      if (categoryValue === 'all') return productsFromBackend.length;
      return productsFromBackend.filter((rl) => rl.leatherType === categoryValue).length;
    },
    [productsFromBackend],
  );

  // --- Load More Function ---
  const loadMore = () => {
    if (displayedRawLeather.length < productsFromBackend.length) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  // --- Clear Filters ---
  const clearFilters = () => {
    setSearchTerm('');
    setSelectedLeatherType('all');
    setSelectedAnimal('all');
    setSelectedFinish('all');
    setSelectedAvailability('all');
    setSortBy('featured');
    // fetchRawLeather() will be triggered by the useEffect for filter changes
    // setCurrentPage(1) will also be called within fetchRawLeather
  };

  const hasActiveFilters =
    searchTerm ||
    selectedLeatherType !== 'all' ||
    selectedAnimal !== 'all' ||
    selectedFinish !== 'all' ||
    selectedAvailability !== 'all' ||
    sortBy !== 'featured';

  // hasMoreProducts now accurately reflects if more items can be loaded from the backend's total count
  const hasMoreProducts = displayedRawLeather.length < totalProductsCount;


  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-amber-50 via-background to-amber-50/30 py-16 dark:from-amber-950/10 dark:via-background dark:to-amber-950/5 md:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-16 space-y-6 text-center">
            <Badge
              variant="secondary"
              className="bg-amber-100 px-4 py-2 text-sm text-amber-800 dark:bg-amber-900 dark:text-amber-100"
            >
              Material Sourcing
            </Badge>
            <h1 className="text-4xl font-bold leading-tight text-foreground sm:text-5xl lg:text-6xl">
              Premium Raw
              <span className="bg-gradient-to-r from-amber-600 to-amber-800 bg-clip-text text-transparent dark:from-amber-400 dark:to-amber-600">
                {' '}
                Leather
              </span>
            </h1>
            <p className="mx-auto max-w-3xl leading-relaxed text-muted-foreground text-xl">
              Source the finest raw leather materials from trusted suppliers for all your
              manufacturing needs.
            </p>
          </div>

          {/* Search and Filters Section - Moved to Hero */}
          <div className="mx-auto max-w-6xl">
            {/* Desktop Search and Filters */}
            <div className="hidden lg:block">
              <div className="rounded-2xl border border-border bg-card/80 backdrop-blur-sm p-6 shadow-lg">
                <div className="space-y-6">
                  {/* Search Bar */}
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 transform text-muted-foreground" />
                    <Input
                      placeholder="Search raw leather by type, animal, finish, color..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-12 h-12 text-lg border-2 border-border/50 focus:border-amber-500"
                    />
                  </div>

                  {/* Categories (Leather Types) */}
                  <div>
                    <h3 className="mb-4 text-sm font-medium text-muted-foreground uppercase tracking-wide">
                      Leather Types
                    </h3>
                    <div className="grid grid-cols-4 gap-3">
                      {dynamicRawLeatherTypes.map((category) => (
                        <button
                          key={category.value}
                          onClick={() => {
                            setSelectedLeatherType(category.value);
                            setCurrentPage(1); // Reset page on filter change
                          }}
                          className={cn(
                            'flex flex-col items-center gap-2 rounded-xl border-2 p-4 text-center transition-all duration-200',
                            selectedLeatherType === category.value
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
                      <Select value={selectedAnimal} onValueChange={(value) => {
                        setSelectedAnimal(value);
                        setCurrentPage(1); // Reset page on filter change
                      }}>
                        <SelectTrigger className="h-12 border-2 border-border/50 focus:border-amber-500">
                          <SelectValue placeholder="Animal Type" />
                        </SelectTrigger>
                        <SelectContent>
                          {ANIMAL_OPTIONS.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex-1">
                      <Select value={selectedFinish} onValueChange={(value) => {
                        setSelectedFinish(value);
                        setCurrentPage(1); // Reset page on filter change
                      }}>
                        <SelectTrigger className="h-12 border-2 border-border/50 focus:border-amber-500">
                          <SelectValue placeholder="Finish Type" />
                        </SelectTrigger>
                        <SelectContent>
                          {FINISH_OPTIONS.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex-1">
                      <Select
                        value={selectedAvailability}
                        onValueChange={(value) => {
                          setSelectedAvailability(value);
                          setCurrentPage(1); // Reset page on filter change
                        }}
                      >
                        <SelectTrigger className="h-12 border-2 border-border/50 focus:border-amber-500">
                          <SelectValue placeholder="Availability" />
                        </SelectTrigger>
                        <SelectContent>
                          {AVAILABILITY_OPTIONS_RAW_LEATHER.map((option) => (
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
              </div>
            </div>

            {/* Mobile Search and Filters */}
            <div className="lg:hidden">
              <div className="rounded-2xl border border-border bg-card/80 backdrop-blur-sm p-4 shadow-lg">
                <div className="space-y-4">
                  {/* Search Bar */}
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 transform text-muted-foreground" />
                    <Input
                      placeholder="Search raw leather..."
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
                      {/* Leather Type Categories */}
                      <div>
                        <h3 className="mb-3 text-sm font-medium text-muted-foreground uppercase tracking-wide">
                          Leather Types
                        </h3>
                        <div className="grid grid-cols-2 gap-2">
                          {dynamicRawLeatherTypes.map((category) => (
                            <button
                              key={category.value}
                              onClick={() => setSelectedLeatherType(category.value)}
                              className={cn(
                                'flex items-center gap-2 rounded-xl border-2 p-3 text-left transition-all duration-200',
                                selectedLeatherType === category.value
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
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <Select value={selectedAnimal} onValueChange={(value) => {
                          setSelectedAnimal(value);
                          setCurrentPage(1); // Reset page on filter change
                        }}>
                          <SelectTrigger className="h-12 border-2 border-border/50">
                            <SelectValue placeholder="Animal Type" />
                          </SelectTrigger>
                          <SelectContent>
                            {ANIMAL_OPTIONS.map((option) => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>

                        <Select value={selectedFinish} onValueChange={(value) => {
                          setSelectedFinish(value);
                          setCurrentPage(1); // Reset page on filter change
                        }}>
                          <SelectTrigger className="h-12 border-2 border-border/50">
                            <SelectValue placeholder="Finish Type" />
                          </SelectTrigger>
                          <SelectContent>
                            {FINISH_OPTIONS.map((option) => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>

                        <Select
                          value={selectedAvailability}
                          onValueChange={(value) => {
                            setSelectedAvailability(value);
                            setCurrentPage(1); // Reset page on filter change
                          }}
                        >
                          <SelectTrigger className="h-12 border-2 border-border/50">
                            <SelectValue placeholder="Availability" />
                          </SelectTrigger>
                          <SelectContent>
                            {AVAILABILITY_OPTIONS_RAW_LEATHER.map((option) => (
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
                    Showing {Math.min(displayedRawLeather.length, productsFromBackend.length)} of{' '}
                    {productsFromBackend.length} products
                  </>
                ) : (
                  'No raw leather found'
                )}
              </div>
            </div>
          )}

          {/* Raw Leather Grid */}
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
                  Loading premium raw leather...
                </span>
              </div>
              <div
                className={cn(
                  'grid gap-6',
                  'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
                )}
              >
                {Array.from({ length: productsPerPage }).map((_, index) => (
                  <RawLeatherCardSkeleton key={index} id={index} />
                ))}
              </div>
            </div>
          ) : productsFromBackend.length === 0 ? (
            <EmptyState
              searchTerm={searchTerm}
              selectedLeatherType={selectedLeatherType}
            />
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
                {displayedRawLeather.map((rawLeatherItem, index) => (
                  <div
                    key={rawLeatherItem._id}
                    className="animate-in fade-in duration-300"
                    style={{ animationDelay: `${(index % productsPerPage) * 50}ms` }}
                  >
                    <RawLeatherCard rawLeather={rawLeatherItem} viewMode={viewMode} />
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
                        Load More Leather
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Call to Custom Sourcing */}
        <div className="mb-16 rounded-2xl border border-amber-200 bg-gradient-to-r from-amber-50 to-amber-100 p-12 text-center dark:border-amber-800 dark:from-amber-950/20 dark:to-amber-900/20">
          <h3 className="mb-4 text-3xl font-bold text-foreground">Can't Find Your Exact Match?</h3>
          <p className="mx-auto mb-8 max-w-2xl text-lg text-muted-foreground">
            Our global network allows us to source nearly any type of raw leather. If you have specific
            requirements, contact our experts for a personalized sourcing solution.
          </p>
          <Button
            size="lg"
            asChild
            className="bg-amber-700 px-8 py-3 text-white hover:bg-amber-800"
          >
            <Link href="/contact">
              Request Custom Sourcing
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </div>

      <Footer />
    </div>
  );
}