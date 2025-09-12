import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { ArrowRight, Package, Award, Upload, Shield, Globe, Star, CheckCircle } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

export default function GridLayoutHome() {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Grid Hero Section */}
      <section className="py-20 bg-gradient-to-br from-primary/5 via-background to-accent/5">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-6 mb-16">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground text-balance">
              Premium Leather
              <span className="text-primary"> Marketplace</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto text-pretty">
              Discover, source, and customize premium leather products through our comprehensive B2B platform.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="text-lg px-8 py-6 bg-primary hover:bg-primary/90" asChild>
                <Link href="/catalog">
                  Explore Products
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" className="text-lg px-8 py-6 bg-transparent" asChild>
                <Link href="/sample-request">Request Samples</Link>
              </Button>
            </div>
          </div>

          {/* Featured Products Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
              <div className="aspect-square relative">
                <Image src="/premium-raw-leather-hide-texture.jpg" alt="Raw Leather" fill className="object-cover" />
              </div>
              <CardContent className="p-4">
                <h3 className="font-semibold mb-2">Raw Leather</h3>
                <p className="text-sm text-muted-foreground">Premium hides & materials</p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
              <div className="aspect-square relative">
                <Image src="/luxury-leather-wallet-finished-product.jpg" alt="Finished Products" fill className="object-cover" />
              </div>
              <CardContent className="p-4">
                <h3 className="font-semibold mb-2">Finished Goods</h3>
                <p className="text-sm text-muted-foreground">Ready-to-sell products</p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
              <div className="aspect-square relative">
                <Image src="/custom-leather-manufacturing-process.jpg" alt="Custom Manufacturing" fill className="object-cover" />
              </div>
              <CardContent className="p-4">
                <h3 className="font-semibold mb-2">Custom Orders</h3>
                <p className="text-sm text-muted-foreground">Tailored manufacturing</p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
              <div className="aspect-square relative">
                <Image src="/leather-accessories-collection-display.jpg" alt="Accessories" fill className="object-cover" />
              </div>
              <CardContent className="p-4">
                <h3 className="font-semibold mb-2">Accessories</h3>
                <p className="text-sm text-muted-foreground">Belts, bags & more</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground">Complete B2B Solutions</h2>
            <p className="text-xl text-muted-foreground">Everything you need for leather sourcing and manufacturing</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <Package className="w-6 h-6 text-primary" />
                </div>
                <CardTitle>Raw Materials</CardTitle>
                <CardDescription>
                  Premium full-grain, top-grain, and specialty leather materials from trusted suppliers worldwide.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground mb-4">
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-primary" />
                    <span>Full-grain cowhide</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-primary" />
                    <span>Exotic leather options</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-primary" />
                    <span>Custom thickness & finish</span>
                  </li>
                </ul>
                <Button variant="outline" className="w-full bg-transparent" asChild>
                  <Link href="/catalog/raw-leather">Browse Materials</Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardHeader>
                <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mb-4">
                  <Award className="w-6 h-6 text-accent" />
                </div>
                <CardTitle>Finished Products</CardTitle>
                <CardDescription>
                  Ready-to-sell leather goods crafted by skilled artisans with attention to detail and quality.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground mb-4">
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-accent" />
                    <span>Wallets & accessories</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-accent" />
                    <span>Bags & purses</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-accent" />
                    <span>Belts & straps</span>
                  </li>
                </ul>
                <Button variant="outline" className="w-full bg-transparent" asChild>
                  <Link href="/catalog/finished-products">View Products</Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <Upload className="w-6 h-6 text-primary" />
                </div>
                <CardTitle>Custom Manufacturing</CardTitle>
                <CardDescription>
                  Upload your designs and specifications for custom leather products tailored to your brand.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground mb-4">
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-primary" />
                    <span>Design consultation</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-primary" />
                    <span>Flexible MOQ</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-primary" />
                    <span>Brand customization</span>
                  </li>
                </ul>
                <Button variant="outline" className="w-full bg-transparent" asChild>
                  <Link href="/custom-manufacturing">Start Custom Order</Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardHeader>
                <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mb-4">
                  <Globe className="w-6 h-6 text-accent" />
                </div>
                <CardTitle>Global Shipping</CardTitle>
                <CardDescription>
                  Reliable international shipping with tracking and insurance coverage to over 50 countries.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <Shield className="w-6 h-6 text-primary" />
                </div>
                <CardTitle>Quality Assurance</CardTitle>
                <CardDescription>
                  ISO 9001 certified processes ensuring consistent quality and compliance with international standards.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardHeader>
                <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mb-4">
                  <Star className="w-6 h-6 text-accent" />
                </div>
                <CardTitle>Expert Support</CardTitle>
                <CardDescription>
                  Dedicated account managers and leather experts to guide your sourcing and manufacturing decisions.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Stats Grid */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 text-center">
            <div className="space-y-2">
              <div className="text-4xl font-bold text-primary">50+</div>
              <div className="text-muted-foreground">Countries Served</div>
            </div>
            <div className="space-y-2">
              <div className="text-4xl font-bold text-accent">1000+</div>
              <div className="text-muted-foreground">Happy Clients</div>
            </div>
            <div className="space-y-2">
              <div className="text-4xl font-bold text-primary">25+</div>
              <div className="text-muted-foreground">Years Experience</div>
            </div>
            <div className="space-y-2">
              <div className="text-4xl font-bold text-accent">99%</div>
              <div className="text-muted-foreground">Client Satisfaction</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Grid */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h2 className="text-3xl sm:text-4xl font-bold text-balance">Ready to Source Premium Leather?</h2>
              <p className="text-xl opacity-90 text-pretty">
                Join thousands of businesses worldwide who trust Pure Grain for their leather sourcing needs.
              </p>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <Button
                size="lg"
                variant="secondary"
                className="bg-accent text-accent-foreground hover:bg-accent/90"
                asChild
              >
                <Link href="/sample-request">
                  Get Samples
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary bg-transparent"
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
