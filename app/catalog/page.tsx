import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Package, Award, Upload, Search, Filter, ArrowRight } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"

export default function CatalogPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-amber-50 via-background to-amber-50/50 dark:from-amber-950/20 dark:via-background dark:to-amber-950/10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-16">
            <Badge variant="secondary" className="bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-100">
              Product Catalog
            </Badge>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground leading-tight">
              Browse Our
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-700 to-amber-900 dark:from-amber-400 dark:to-amber-600">
                {" "}
                Collection
              </span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Discover our extensive range of premium raw leather materials and finished products, carefully curated for
              international wholesale buyers.
            </p>
          </div>

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
                  <Button className="bg-amber-800 hover:bg-amber-900">
                    <Filter className="w-4 h-4 mr-2" />
                    Filter
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

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((item) => (
              <Card
                key={item}
                className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
              >
                <CardContent className="p-0">
                  <div className="relative">
                    <Image
                      src={`/placeholder.svg?height=200&width=300`}
                      alt={`Product ${item}`}
                      width={300}
                      height={200}
                      className="w-full h-48 object-cover rounded-t-lg"
                    />
                    <Badge className="absolute top-2 right-2 bg-amber-600 text-white">Popular</Badge>
                  </div>
                  <div className="p-4 space-y-2">
                    <h3 className="font-semibold text-foreground">Premium Cowhide Leather</h3>
                    <p className="text-sm text-muted-foreground">Full-grain, vegetable tanned</p>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-amber-600 font-medium">MOQ: 50 sq ft</span>
                      <Button size="sm" variant="outline" asChild>
                        <Link href={`/catalog/product/${item}`}>View Details</Link>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-12">
            <Button size="lg" className="bg-amber-800 hover:bg-amber-900" asChild>
              <Link href="/catalog/all">
                View All Products
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </Button>
          </div>
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
