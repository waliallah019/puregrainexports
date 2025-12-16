"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CarouselSection } from "@/components/carousel-section"
import { 
  ArrowRight, CheckCircle, Package, Award, Upload, FileText, Truck, 
  Globe, TrendingUp, Users, Shield, Zap, Star, ChevronRight, Play,
  BarChart3, Building2, Factory, ShoppingBag
} from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { Footer } from "@/components/layout/footer"
import { Header } from "@/components/layout/header"
import { AnnouncementTicker } from "@/components/layout/announcement-ticker"
import { cn } from "@/lib/utils"

export default function PureGrainLanding() {
  const [activeStat, setActiveStat] = useState(0)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStat((prev) => (prev + 1) % 4)
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
    }
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  const stats = [
    { value: "20+", label: "Years Experience", icon: Award, color: "text-amber-600" },
    { value: "500+", label: "Global Partners", icon: Users, color: "text-blue-600" },
    { value: "40+", label: "Countries Served", icon: Globe, color: "text-green-600" },
    { value: "1M+", label: "Products Delivered", icon: Package, color: "text-purple-600" },
  ]

  const features = [
    {
      icon: Shield,
      title: "Quality Certified",
      description: "ISO 9001:2015 & OEKO-TEX Standard certified materials",
      color: "from-blue-500 to-blue-600"
    },
    {
      icon: Zap,
      title: "Fast Shipping",
      description: "Express 3-5 day shipping available worldwide",
      color: "from-amber-500 to-amber-600"
    },
    {
      icon: TrendingUp,
      title: "Bulk Discounts",
      description: "Up to 15% off on orders over 1,000 sq ft",
      color: "from-green-500 to-green-600"
    },
    {
      icon: Globe,
      title: "Global Reach",
      description: "Shipping to 40+ countries with full documentation",
      color: "from-purple-500 to-purple-600"
    },
  ]

  const categories = [
    {
      icon: Package,
      title: "Raw Leather Materials",
      description: "Premium full-grain, top-grain, and exotic leathers",
      features: ["50+ Types Available", "Custom Thickness", "MOQ: 50 sq ft", "Sample Available"],
      href: "/catalog/raw-leather",
      gradient: "from-amber-600 to-amber-800",
      image: "/raw-leather.png"
    },
    {
      icon: Award,
      title: "Finished Products",
      description: "Expertly crafted wallets, belts, bags, and accessories",
      features: ["Ready to Sell", "Brand Customization", "MOQ: 100 pieces", "Quality Guaranteed"],
      href: "/catalog/finished-products",
      gradient: "from-amber-600 to-amber-800",
      image: "/placeholder.svg?height=400&width=600"
    },
    {
      icon: Upload,
      title: "Custom Manufacturing",
      description: "Bespoke leather products tailored to your specifications",
      features: ["Design Upload", "Flexible MOQ", "4-8 Week Turnaround", "Quality Assurance"],
      href: "/custom-manufacturing",
      gradient: "from-amber-600 to-amber-800",
      image: "/placeholder.svg?height=400&width=600"
    },
  ]

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section - Modern & Interactive */}
      <section className="relative overflow-hidden bg-gradient-to-br from-amber-50 via-background to-amber-50/30 dark:from-amber-950/10 dark:via-background dark:to-amber-950/5">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div 
            className="absolute w-96 h-96 bg-amber-200/20 dark:bg-amber-800/10 rounded-full blur-3xl transition-all duration-1000"
            style={{
              left: `${mousePosition.x / 20}px`,
              top: `${mousePosition.y / 20}px`,
            }}
          />
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="py-16 md:py-24 lg:py-32">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Left: Content */}
              <div className="space-y-8">
                <div className="space-y-6">
                  <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-100 px-4 py-2 text-sm inline-flex items-center gap-2 hover:scale-105 transition-transform cursor-default">
                    <Star className="w-4 h-4 fill-amber-600" />
                    International B2B Wholesale Platform
                  </Badge>
                  
                  <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-foreground leading-tight">
                    Where Grain Meets
                    <span className="block text-transparent bg-clip-text bg-gradient-to-r from-amber-700 via-amber-600 to-amber-800 dark:from-amber-400 dark:via-amber-300 dark:to-amber-500">
                      {" "}Greatness
                    </span>
                  </h1>
                  
                  <p className="text-xl text-muted-foreground leading-relaxed max-w-2xl">
                    Premium leather wholesale platform connecting international buyers with trusted manufacturers. 
                    Source quality raw materials and finished products for your business.
                  </p>
                </div>

                {/* Interactive Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {stats.map((stat, index) => {
                    const StatIcon = stat.icon
                    const isActive = index === activeStat
                    return (
                      <Card
                        key={index}
                        className={cn(
                          "border-0 shadow-leather transition-all duration-300 cursor-pointer hover-lift",
                          isActive && "ring-2 ring-amber-500/50 bg-amber-50/50 dark:bg-amber-950/20 scale-105"
                        )}
                        onClick={() => setActiveStat(index)}
                      >
                        <CardContent className="p-4 text-center">
                          <StatIcon className={cn("w-6 h-6 mx-auto mb-2", stat.color)} />
                          <div className="text-2xl font-bold text-foreground mb-1">{stat.value}</div>
                          <div className="text-xs text-muted-foreground">{stat.label}</div>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>

                {/* CTA Buttons */}
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button
                    size="lg"
                    className="text-lg px-8 py-6 bg-amber-800 hover:bg-amber-900 dark:bg-amber-700 dark:hover:bg-amber-800 hover:scale-105 transition-all shadow-leather-lg micro-bounce group"
                    asChild
                  >
                    <Link href="/custom-manufacturing">
                      Custom Manufacturing
                      <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    className="text-lg px-8 py-6 border-2 border-amber-800 text-amber-800 hover:bg-amber-50 dark:border-amber-400 dark:text-amber-400 dark:hover:bg-amber-950/20 hover:scale-105 transition-all micro-bounce"
                    asChild
                  >
                    <Link href="/catalog">
                      Browse Catalog
                      <ChevronRight className="ml-2 w-5 h-5" />
                    </Link>
                  </Button>
                </div>

                {/* Trust Indicators */}
                <div className="flex flex-wrap items-center gap-6 pt-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span>ISO 9001 Certified</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span>40+ Countries</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span>Quality Guaranteed</span>
                  </div>
                </div>
              </div>

              {/* Right: Image with overlay */}
              <div className="relative">
                <div className="relative z-10 rounded-2xl overflow-hidden shadow-leather-lg group">
                  <Image
                    src="/raw-leather.png"
                    alt="Premium Leather Products"
                    width={800}
                    height={600}
                    className="w-full h-auto object-cover group-hover:scale-110 transition-transform duration-700"
                    priority
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  <div className="absolute bottom-6 left-6 right-6 text-white">
                    <Badge className="bg-white/20 backdrop-blur-sm text-white border-white/30 mb-2">
                      Premium Quality
                    </Badge>
                    <p className="text-lg font-semibold">Sourced from Trusted Suppliers Worldwide</p>
                  </div>
                </div>
                {/* Floating badge */}
                <div className="absolute -top-4 -right-4 bg-gradient-to-br from-amber-600 to-amber-800 text-white p-4 rounded-xl shadow-leather-lg animate-bounce-subtle">
                  <div className="text-2xl font-bold">500+</div>
                  <div className="text-xs">Partners</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-16 bg-muted/30 border-y">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => {
              const FeatureIcon = feature.icon
              return (
                <Card
                  key={index}
                  className="border-0 shadow-leather hover-lift transition-premium group cursor-pointer bg-gradient-to-br from-background to-muted/50"
                >
                  <CardContent className="p-6">
                    <div className={cn(
                      "w-12 h-12 rounded-xl bg-gradient-to-br flex items-center justify-center mb-4 group-hover:scale-110 transition-transform",
                      feature.color
                    )}>
                      <FeatureIcon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="font-semibold text-foreground mb-2">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </section>

      {/* Product Categories - Enhanced */}
      <section id="catalog" className="py-20 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-16">
            <Badge variant="secondary" className="bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-100">
              Our Products
            </Badge>
            <h2 className="text-4xl sm:text-5xl font-bold text-foreground">
              Premium Leather Solutions
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              From raw materials to finished products, we provide comprehensive leather solutions for your business
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {categories.map((category, index) => {
              const CategoryIcon = category.icon
              return (
                <Card
                  key={index}
                  className="border-0 shadow-leather-lg hover-lift overflow-hidden group cursor-pointer transition-premium"
                >
                  <div className="relative h-48 bg-gradient-to-br overflow-hidden">
                    <div className={cn(
                      "absolute inset-0 bg-gradient-to-br opacity-90",
                      category.gradient
                    )} />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <CategoryIcon className="w-20 h-20 text-white/20 group-hover:scale-125 transition-transform duration-500" />
                    </div>
                    <div className="absolute top-4 right-4">
                      <Badge className="bg-white/20 backdrop-blur-sm text-white border-white/30">
                        B2B
                      </Badge>
                    </div>
                  </div>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-xl mb-2">{category.title}</CardTitle>
                        <CardDescription>{category.description}</CardDescription>
                      </div>
                      <CategoryIcon className="w-6 h-6 text-amber-600 flex-shrink-0 ml-4" />
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-2">
                      {category.features.map((feature, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-sm">
                          <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                          <span className="text-muted-foreground">{feature}</span>
                        </div>
                      ))}
                    </div>
                    <Button
                      variant="outline"
                      className="w-full group-hover:bg-amber-50 dark:group-hover:bg-amber-950/20 transition-colors"
                      asChild
                    >
                      <Link href={category.href}>
                        Explore {category.title}
                        <ChevronRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </section>

      {/* How It Works - Enhanced */}
      <section id="process" className="py-20 bg-gradient-to-br from-amber-50/50 via-background to-amber-50/30 dark:from-amber-950/10 dark:via-background dark:to-amber-950/5">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-16">
            <Badge variant="secondary" className="bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-100">
              Process
            </Badge>
            <h2 className="text-4xl sm:text-5xl font-bold text-foreground">How It Works</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Simple, streamlined process designed for B2B efficiency
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: FileText, title: "Browse & Quote", desc: "Explore catalog and request detailed quotes", step: "01" },
              { icon: Package, title: "Request Sample", desc: "Order samples to verify quality before bulk purchase", step: "02" },
              { icon: CheckCircle, title: "Place Order", desc: "Confirm order and receive production timeline", step: "03" },
              { icon: Truck, title: "Global Shipping", desc: "Secure international shipping with full tracking", step: "04" },
            ].map((item, index) => {
              const ItemIcon = item.icon
              return (
                <Card
                  key={index}
                  className="border-0 shadow-leather hover-lift transition-premium relative overflow-hidden group"
                >
                  <div className="absolute top-0 right-0 w-20 h-20 bg-amber-100/50 dark:bg-amber-900/20 rounded-bl-full" />
                  <CardContent className="p-6 relative z-10">
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <ItemIcon className="w-7 h-7 text-white" />
                      </div>
                      <span className="text-4xl font-bold text-amber-200 dark:text-amber-800">{item.step}</span>
                    </div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">{item.title}</h3>
                    <p className="text-sm text-muted-foreground">{item.desc}</p>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </section>

      {/* Stats & Trust Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="border-0 shadow-leather-lg bg-gradient-to-br from-amber-50 to-amber-100/50 dark:from-amber-950/20 dark:to-amber-900/10">
              <CardContent className="p-8 text-center">
                <BarChart3 className="w-12 h-12 text-amber-600 mx-auto mb-4" />
                <div className="text-4xl font-bold text-foreground mb-2">98%</div>
                <div className="text-sm font-semibold text-foreground mb-1">Customer Satisfaction</div>
                <div className="text-xs text-muted-foreground">Based on 500+ reviews</div>
              </CardContent>
            </Card>
            
            <Card className="border-0 shadow-leather-lg bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-950/20 dark:to-blue-900/10">
              <CardContent className="p-8 text-center">
                <Building2 className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                <div className="text-4xl font-bold text-foreground mb-2">500+</div>
                <div className="text-sm font-semibold text-foreground mb-1">Business Partners</div>
                <div className="text-xs text-muted-foreground">Trusted worldwide</div>
              </CardContent>
            </Card>
            
            <Card className="border-0 shadow-leather-lg bg-gradient-to-br from-green-50 to-green-100/50 dark:from-green-950/20 dark:to-green-900/10">
              <CardContent className="p-8 text-center">
                <Factory className="w-12 h-12 text-green-600 mx-auto mb-4" />
                <div className="text-4xl font-bold text-foreground mb-2">20+</div>
                <div className="text-sm font-semibold text-foreground mb-1">Years Experience</div>
                <div className="text-xs text-muted-foreground">Industry expertise</div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Carousel Section */}
      <CarouselSection />

      {/* Final CTA - Enhanced */}
      <section className="relative py-24 bg-gradient-to-r from-[#835127] via-[#6b4220] to-[#40280f] dark:from-[#40280f] dark:via-[#2d1c0a] dark:to-black overflow-hidden">
        <div className="absolute inset-0 opacity-10 texture-leather" />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="max-w-4xl mx-auto space-y-8">
            <Badge className="bg-white/20 backdrop-blur-sm text-white border-white/30 mb-4">
              Get Started Today
            </Badge>
            <h2 className="text-4xl sm:text-5xl font-bold text-white">
              Ready to Source Premium Leather?
            </h2>
            <p className="text-xl text-amber-100 max-w-2xl mx-auto">
              Join hundreds of international wholesalers who trust Pure Grain. Request a quote today 
              and experience where grain meets greatness.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
             
              <Button
                size="lg"
                variant="outline"
                className="text-lg px-8 py-6 bg-transparent border-2 border-white text-white hover:bg-white hover:text-amber-900 hover:scale-105 transition-all micro-bounce"
                asChild
              >
                <Link href="/catalog">
                  Browse Catalog
                  <ChevronRight className="ml-2 w-5 h-5" />
                </Link>
              </Button>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-6 pt-8 text-sm text-amber-100">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                <span>International Shipping</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                <span>Custom Designs Welcome</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                <span>Quality Guaranteed</span>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      <Footer />
    </div>
  )
}
