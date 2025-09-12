import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { ArrowRight, Star, Globe, Shield, Truck } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

export default function BoldVisualsHome() {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Bold Split Hero Section */}
      <section className="min-h-screen flex items-center bg-gradient-to-r from-primary to-primary/80">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8 text-primary-foreground">
              <div className="space-y-6">
                <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold leading-tight text-balance">
                  Craftsmanship
                  <span className="block text-accent">Redefined</span>
                </h1>
                <p className="text-xl leading-relaxed opacity-90 text-pretty">
                  Where traditional leather craftsmanship meets modern B2B excellence. Experience leather like never
                  before.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  size="lg"
                  variant="secondary"
                  className="text-lg px-8 py-6 bg-accent text-accent-foreground hover:bg-accent/90"
                  asChild
                >
                  <Link href="/sample-request">
                    Experience Quality
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="text-lg px-8 py-6 border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary bg-transparent"
                  asChild
                >
                  <Link href="/catalog">View Collection</Link>
                </Button>
              </div>

              <div className="grid grid-cols-3 gap-6 pt-8">
                <div className="text-center">
                  <div className="text-3xl font-bold">50+</div>
                  <div className="text-sm opacity-80">Countries Served</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold">1000+</div>
                  <div className="text-sm opacity-80">Happy Clients</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold">25+</div>
                  <div className="text-sm opacity-80">Years Experience</div>
                </div>
              </div>
            </div>

            <div className="relative">
              <Image
                src="/luxury-leather-craftsmanship-workshop-artisan.jpg"
                alt="Leather Craftsmanship"
                width={500}
                height={600}
                className="rounded-2xl shadow-2xl w-full h-auto"
                priority
              />
              <div className="absolute -bottom-6 -left-6 bg-accent text-accent-foreground p-6 rounded-xl shadow-xl">
                <div className="flex items-center space-x-2">
                  <Star className="w-5 h-5 fill-current" />
                  <span className="font-semibold">Premium Quality</span>
                </div>
                <p className="text-sm mt-1">ISO 9001 Certified</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Bold Features Grid */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold text-foreground">Why Choose Pure Grain</h2>
            <p className="text-xl text-muted-foreground">Excellence in every aspect of our service</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-primary/5 to-accent/5">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-6">
                  <Globe className="w-8 h-8 text-primary-foreground" />
                </div>
                <h3 className="text-xl font-bold mb-4">Global Reach</h3>
                <p className="text-muted-foreground">
                  Serving clients across 50+ countries with reliable international shipping.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-accent/5 to-primary/5">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center mx-auto mb-6">
                  <Shield className="w-8 h-8 text-accent-foreground" />
                </div>
                <h3 className="text-xl font-bold mb-4">Quality Assured</h3>
                <p className="text-muted-foreground">
                  Every product meets our rigorous quality standards and certifications.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-primary/5 to-accent/5">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-6">
                  <Truck className="w-8 h-8 text-primary-foreground" />
                </div>
                <h3 className="text-xl font-bold mb-4">Fast Delivery</h3>
                <p className="text-muted-foreground">Efficient logistics network ensuring timely delivery worldwide.</p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-accent/5 to-primary/5">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center mx-auto mb-6">
                  <Star className="w-8 h-8 text-accent-foreground" />
                </div>
                <h3 className="text-xl font-bold mb-4">Expert Support</h3>
                <p className="text-muted-foreground">
                  Dedicated team of leather experts to guide your sourcing decisions.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Bold Testimonial */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <blockquote className="text-3xl sm:text-4xl font-bold text-foreground mb-8 text-balance">
              "Pure Grain transformed our business with their exceptional quality and service. They're not just a
              supplier, they're a partner."
            </blockquote>
            <div className="flex items-center justify-center space-x-4">
              <Image src="/avatar-1.png" alt="Customer" width={60} height={60} className="rounded-full" />
              <div className="text-left">
                <p className="font-semibold text-foreground">Sarah Johnson</p>
                <p className="text-muted-foreground">CEO, Luxury Leather Co.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Bold CTA */}
      <section className="py-20 bg-gradient-to-r from-accent to-primary text-primary-foreground">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="max-w-3xl mx-auto space-y-8">
            <h2 className="text-4xl sm:text-5xl font-bold text-balance">Ready to Experience Excellence?</h2>
            <p className="text-xl opacity-90 text-pretty">
              Join thousands of satisfied clients who trust Pure Grain for their leather sourcing needs.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                variant="secondary"
                className="text-lg px-8 py-6 bg-background text-foreground hover:bg-background/90"
                asChild
              >
                <Link href="/sample-request">
                  Get Started Today
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="text-lg px-8 py-6 border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary bg-transparent"
                asChild
              >
                <Link href="/contact">Talk to Expert</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
