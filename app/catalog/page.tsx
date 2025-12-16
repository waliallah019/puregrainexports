"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Package, Award, Upload, Search, Filter, ArrowRight, Loader2 } from "lucide-react"
import Link from "next/link"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { PageBanner } from "@/components/layout/page-banner"
import ProductCard from "@/components/product-details/ProductCard"
import RawLeatherCard from "@/components/raw-leather-details/RawLeatherCard"
import { IProduct } from "@/types/product"
import { IRawLeather } from "@/types/rawLeather"

export default function CatalogPage() {
  const [featuredProducts, setFeaturedProducts] = useState<IProduct[]>([])
  const [featuredRawLeather, setFeaturedRawLeather] = useState<IRawLeather[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchFeaturedItems = async () => {
      setLoading(true)
      setError(null)
      
      try {
        // Fetch featured finished products
        const productsRes = await fetch('/api/finished-products?isFeatured=true&limit=8&page=1')
        if (!productsRes.ok) throw new Error('Failed to load featured products')
        const productsData = await productsRes.json()
        const products = productsData.data || []
        
        // Fetch featured raw leather
        const rawLeatherRes = await fetch('/api/raw-leather?isFeatured=true&limit=8&page=1')
        if (!rawLeatherRes.ok) throw new Error('Failed to load featured raw leather')
        const rawLeatherData = await rawLeatherRes.json()
        const rawLeather = rawLeatherData.data || []
        
        setFeaturedProducts(products)
        setFeaturedRawLeather(rawLeather)
      } catch (err: any) {
        setError(err.message || 'Failed to load featured items')
        console.error('Error fetching featured items:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchFeaturedItems()
  }, [])

  // Combine and limit featured items (prioritize finished products, then raw leather)
  const allFeaturedItems = [
    ...featuredProducts.map(p => ({ type: 'product' as const, data: p })),
    ...featuredRawLeather.map(r => ({ type: 'rawLeather' as const, data: r }))
  ].slice(0, 8) // Limit to 8 items total

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <PageBanner
        title="Browse Our Collection"
        subtitle="Discover our extensive range of premium raw leather materials and finished products, carefully curated for international wholesale buyers."
        badge="Product Catalog"
        cta={{ text: "Request Quote", href: "/quote-request" }}
        compact={true}
      />

      {/* Hero Section */}
      <section className="py-12 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {/* Search and Filter */}
          <div className="max-w-4xl mx-auto">
            <Card className="border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="grid md:grid-cols-4 gap-4">
                  <div className="md:col-span-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                      <Input placeholder="Search products..." className="pl-10" />
                    </div>
                  </div>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      <SelectItem value="raw">Raw Leather</SelectItem>
                      <SelectItem value="finished">Finished Products</SelectItem>
                      <SelectItem value="custom">Custom Manufacturing</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Material" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Materials</SelectItem>
                      <SelectItem value="cowhide">Cowhide</SelectItem>
                      <SelectItem value="buffalo">Buffalo</SelectItem>
                      <SelectItem value="goat">Goat</SelectItem>
                      <SelectItem value="sheep">Sheep</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button className="bg-amber-800 hover:bg-amber-900" asChild>
                    <Link href="/catalog/finished-products">
                    <Filter className="w-4 h-4 mr-2" />
                    Filter
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Product Categories */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
              <CardHeader>
                <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900 rounded-lg flex items-center justify-center mb-4">
                  <Package className="w-6 h-6 text-amber-700 dark:text-amber-300" />
                </div>
                <CardTitle>Raw Leather Materials</CardTitle>
                <CardDescription>Premium hides and raw materials for manufacturing and crafting</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
                    <span>• Full-grain leather</span>
                    <span>• Top-grain leather</span>
                    <span>• Suede leather</span>
                    <span>• Nubuck leather</span>
                    <span>• Patent leather</span>
                    <span>• Exotic leathers</span>
                  </div>
                  <Button variant="outline" className="w-full" asChild>
                    <Link href="/catalog/raw-leather">
                      Browse Raw Materials
                      <ArrowRight className="ml-2 w-4 h-4" />
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
              <CardHeader>
                <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900 rounded-lg flex items-center justify-center mb-4">
                  <Award className="w-6 h-6 text-amber-700 dark:text-amber-300" />
                </div>
                <CardTitle>Finished Products</CardTitle>
                <CardDescription>Ready-to-sell leather goods for retail distribution</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
                    <span>• Wallets & Purses</span>
                    <span>• Belts & Straps</span>
                    <span>• Bags & Briefcases</span>
                    <span>• Gloves & Accessories</span>
                    <span>• Footwear</span>
                    <span>• Upholstery</span>
                  </div>
                  <Button variant="outline" className="w-full" asChild>
                    <Link href="/catalog/finished-products">
                      Browse Products
                      <ArrowRight className="ml-2 w-4 h-4" />
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
              <CardHeader>
                <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900 rounded-lg flex items-center justify-center mb-4">
                  <Upload className="w-6 h-6 text-amber-700 dark:text-amber-300" />
                </div>
                <CardTitle>Custom Manufacturing</CardTitle>
                <CardDescription>Bespoke leather products made to your specifications</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
                    <span>• Design upload</span>
                    <span>• Brand customization</span>
                    <span>• Color matching</span>
                    <span>• Size variations</span>
                    <span>• Logo embossing</span>
                    <span>• Packaging options</span>
                  </div>
                  <Button variant="outline" className="w-full" asChild>
                    <Link href="/custom-manufacturing">
                      Start Custom Order
                      <ArrowRight className="ml-2 w-4 h-4" />
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground">Featured Products</h2>
            <p className="text-xl text-muted-foreground">Popular items from our extensive catalog</p>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-amber-600" />
              <span className="ml-3 text-lg text-muted-foreground">Loading featured products...</span>
            </div>
          ) : error ? (
            <div className="text-center py-20">
              <p className="text-destructive mb-4">{error}</p>
              <Button onClick={() => window.location.reload()}>Retry</Button>
                  </div>
          ) : allFeaturedItems.length === 0 ? (
            <div className="text-center py-20">
              <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <p className="text-lg text-muted-foreground mb-4">No featured products available at the moment</p>
              <Button asChild>
                <Link href="/catalog/finished-products">
                  Browse All Products
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Link>
                      </Button>
                    </div>
          ) : (
            <>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                {allFeaturedItems.map((item, index) => (
                  <div key={`${item.type}-${item.data._id}`}>
                    {item.type === 'product' ? (
                      <ProductCard product={item.data as IProduct} viewMode="grid" />
                    ) : (
                      <RawLeatherCard rawLeather={item.data as IRawLeather} viewMode="grid" />
                    )}
                  </div>
            ))}
          </div>

              <div className="text-center mt-12 space-y-4">
                <Button size="lg" className="bg-amber-800 hover:bg-amber-900 hover:scale-105 transition-all" asChild>
                  <Link href="/catalog/finished-products">
                    View All Finished Products
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Link>
                </Button>
                <div>
                  <Button size="lg" variant="outline" className="border-amber-800 text-amber-800 hover:bg-amber-50 dark:border-amber-400 dark:text-amber-400 dark:hover:bg-amber-950/20" asChild>
                    <Link href="/catalog/raw-leather">
                      Browse Raw Materials
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </Button>
          </div>
              </div>
            </>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-amber-800 to-amber-900 dark:from-amber-900 dark:to-amber-950">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="max-w-3xl mx-auto space-y-8">
            <h2 className="text-3xl sm:text-4xl font-bold text-white">Need Help Finding the Right Product?</h2>
            <p className="text-xl text-amber-100">
              Our leather experts are here to help you find exactly what you need for your business.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                variant="secondary"
                className="text-lg px-8 py-6 bg-white text-amber-900 hover:bg-amber-50"
                asChild
              >
                <Link href="/contact">
                  Contact Our Experts
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="text-lg px-8 py-6 border-white text-white hover:bg-white hover:text-amber-900"
                asChild
              >
                <Link href="/quote-request">Request Quote</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
