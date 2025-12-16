import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, Award, Shield, CheckCircle, Target, Heart, Leaf } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { PageBanner } from "@/components/layout/page-banner"

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <PageBanner
        title="Crafting Excellence in Leather"
        subtitle="For over two decades, Pure Grain has been at the forefront of premium leather wholesale, connecting international buyers with the finest raw materials and finished products."
        badge="About Pure Grain"
        cta={{ text: "Get in Touch", href: "/contact" }}
        compact={true}
      />
      {/* Hero Section */}
      <section className="py-12 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <p className="text-lg text-muted-foreground leading-relaxed">
                Our commitment to quality, sustainability, and customer service has earned us partnerships with over 500 businesses across 40 countries. We believe that great leather tells a story, and we're honored to be part of yours.
              </p>
            </div>
            <div className="relative">
              <Image
                src="/placeholder.svg?height=600&width=800"
                alt="Pure Grain Workshop"
                width={800}
                height={600}
                className="rounded-2xl shadow-2xl w-full h-auto"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Company Story */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center space-y-4 mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold text-foreground">Our Story</h2>
              <p className="text-xl text-muted-foreground">
                From humble beginnings to global leather wholesale leadership
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                <h3 className="text-2xl font-semibold text-foreground">Founded on Quality</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Pure Grain was established in 2001 with a simple mission: to provide international wholesalers and
                  retailers with access to the world's finest leather materials and products. What started as a small
                  family business has grown into a trusted global supplier.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  Our commitment to quality, sustainability, and customer service has earned us partnerships with over
                  500 businesses across 40 countries. We believe that great leather tells a story, and we're honored to
                  be part of yours.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-6 bg-amber-50 dark:bg-amber-950/20 rounded-lg">
                  <div className="text-3xl font-bold text-amber-800 dark:text-amber-400">20+</div>
                  <div className="text-sm text-muted-foreground">Years Experience</div>
                </div>
                <div className="text-center p-6 bg-amber-50 dark:bg-amber-950/20 rounded-lg">
                  <div className="text-3xl font-bold text-amber-800 dark:text-amber-400">500+</div>
                  <div className="text-sm text-muted-foreground">Global Partners</div>
                </div>
                <div className="text-center p-6 bg-amber-50 dark:bg-amber-950/20 rounded-lg">
                  <div className="text-3xl font-bold text-amber-800 dark:text-amber-400">40+</div>
                  <div className="text-sm text-muted-foreground">Countries Served</div>
                </div>
                <div className="text-center p-6 bg-amber-50 dark:bg-amber-950/20 rounded-lg">
                  <div className="text-3xl font-bold text-amber-800 dark:text-amber-400">1M+</div>
                  <div className="text-sm text-muted-foreground">Products Delivered</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground">Our Values</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              The principles that guide everything we do
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardHeader>
                <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900 rounded-lg flex items-center justify-center mb-4">
                  <Target className="w-6 h-6 text-amber-700 dark:text-amber-300" />
                </div>
                <CardTitle>Quality First</CardTitle>
                <CardDescription>
                  We never compromise on quality. Every piece of leather that leaves our facility meets the highest
                  international standards.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardHeader>
                <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900 rounded-lg flex items-center justify-center mb-4">
                  <Heart className="w-6 h-6 text-amber-700 dark:text-amber-300" />
                </div>
                <CardTitle>Customer Focused</CardTitle>
                <CardDescription>
                  Your success is our success. We build lasting partnerships by understanding and exceeding your
                  expectations.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardHeader>
                <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900 rounded-lg flex items-center justify-center mb-4">
                  <Leaf className="w-6 h-6 text-amber-700 dark:text-amber-300" />
                </div>
                <CardTitle>Sustainability</CardTitle>
                <CardDescription>
                  We're committed to responsible sourcing and sustainable practices that protect our environment for
                  future generations.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Production Process */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground">Our Production Process</h2>
            <p className="text-xl text-muted-foreground">From sourcing to shipping, every step is carefully managed</p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-amber-100 dark:bg-amber-900 rounded-full flex items-center justify-center mx-auto">
                <span className="text-2xl font-bold text-amber-700 dark:text-amber-300">1</span>
              </div>
              <h3 className="text-xl font-semibold">Ethical Sourcing</h3>
              <p className="text-muted-foreground">
                We partner with certified suppliers who share our commitment to ethical and sustainable practices.
              </p>
            </div>

            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-amber-100 dark:bg-amber-900 rounded-full flex items-center justify-center mx-auto">
                <span className="text-2xl font-bold text-amber-700 dark:text-amber-300">2</span>
              </div>
              <h3 className="text-xl font-semibold">Expert Tanning</h3>
              <p className="text-muted-foreground">
                Our master craftsmen use traditional and modern techniques to create leather of exceptional quality.
              </p>
            </div>

            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-amber-100 dark:bg-amber-900 rounded-full flex items-center justify-center mx-auto">
                <span className="text-2xl font-bold text-amber-700 dark:text-amber-300">3</span>
              </div>
              <h3 className="text-xl font-semibold">Quality Control</h3>
              <p className="text-muted-foreground">
                Every piece undergoes rigorous testing to ensure it meets our exacting standards.
              </p>
            </div>

            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-amber-100 dark:bg-amber-900 rounded-full flex items-center justify-center mx-auto">
                <span className="text-2xl font-bold text-amber-700 dark:text-amber-300">4</span>
              </div>
              <h3 className="text-xl font-semibold">Global Delivery</h3>
              <p className="text-muted-foreground">
                Secure packaging and reliable shipping ensure your order arrives in perfect condition.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Certifications */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground">Certifications & Standards</h2>
            <p className="text-xl text-muted-foreground">Our commitment to excellence is recognized globally</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="border-0 shadow-lg text-center">
              <CardHeader>
                <div className="w-16 h-16 bg-amber-100 dark:bg-amber-900 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Award className="w-8 h-8 text-amber-700 dark:text-amber-300" />
                </div>
                <CardTitle>ISO 9001:2015</CardTitle>
                <CardDescription>
                  Quality Management System certification ensuring consistent quality standards
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-lg text-center">
              <CardHeader>
                <div className="w-16 h-16 bg-amber-100 dark:bg-amber-900 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-8 h-8 text-amber-700 dark:text-amber-300" />
                </div>
                <CardTitle>OEKO-TEX Standard</CardTitle>
                <CardDescription>
                  Textile safety certification guaranteeing products are free from harmful substances
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-lg text-center">
              <CardHeader>
                <div className="w-16 h-16 bg-amber-100 dark:bg-amber-900 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-amber-700 dark:text-amber-300" />
                </div>
                <CardTitle>LWG Certified</CardTitle>
                <CardDescription>
                  Leather Working Group certification for environmental stewardship and traceability
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-amber-800 to-amber-900 dark:from-amber-900 dark:to-amber-950">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="max-w-3xl mx-auto space-y-8">
            <h2 className="text-3xl sm:text-4xl font-bold text-white">Ready to Partner with Us?</h2>
            <p className="text-xl text-amber-100">
              Join the hundreds of businesses worldwide who trust Pure Grain for their leather needs.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                variant="secondary"
                className="text-lg px-8 py-6 bg-white text-amber-900 hover:bg-amber-50"
                asChild
              >
                <Link href="/contact">
                  Contact Us
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="text-lg px-8 py-6 border-white text-white hover:bg-white hover:text-amber-900"
                asChild
              >
                <Link href="/catalog">View Our Catalog</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  )
}
