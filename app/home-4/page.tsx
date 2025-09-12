import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { ArrowRight, Play, Users, Award, Globe, CheckCircle } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

export default function StorytellingHome() {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Story Hero Section */}
      <section className="min-h-screen flex items-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/90 to-primary/70 z-10"></div>
        <Image src="/leather-artisan-crafting-premium-leather-in-worksh.jpg" alt="Leather Craftsmanship" fill className="object-cover" priority />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-20">
          <div className="max-w-4xl space-y-8 text-primary-foreground">
            <div className="space-y-6">
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold leading-tight text-balance">
                A Legacy of
                <span className="block text-accent">Leather Excellence</span>
              </h1>
              <p className="text-xl leading-relaxed opacity-90 max-w-2xl text-pretty">
                For over 25 years, we've been connecting the world's finest leather craftsmen with businesses who demand
                nothing but the best. This is our story.
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
                  Start Your Journey
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="text-lg px-8 py-6 border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary bg-transparent"
                asChild
              >
                <Link href="#story">
                  <Play className="mr-2 w-5 h-5" />
                  Our Story
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* The Story Section */}
      <section id="story" className="py-20 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <div className="space-y-6">
                <h2 className="text-4xl sm:text-5xl font-bold text-foreground text-balance">Where It All Began</h2>
                <p className="text-lg text-muted-foreground leading-relaxed text-pretty">
                  In 1999, our founder traveled across continents, seeking the world's finest leather artisans. What
                  started as a passion project became a mission: to bridge the gap between traditional craftsmanship and
                  modern business needs.
                </p>
                <p className="text-lg text-muted-foreground leading-relaxed text-pretty">
                  Today, Pure Grain stands as a testament to that vision—connecting over 1,000 businesses worldwide with
                  premium leather materials and products that tell their own stories.
                </p>
              </div>

              <div className="grid sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <div className="text-3xl font-bold text-primary">1999</div>
                  <div className="text-muted-foreground">Founded with a vision</div>
                </div>
                <div className="space-y-2">
                  <div className="text-3xl font-bold text-accent">50+</div>
                  <div className="text-muted-foreground">Countries reached</div>
                </div>
              </div>
            </div>

            <div className="relative">
              <Image
                src="/vintage-leather-workshop-historical-craftsmanship.jpg"
                alt="Our Heritage"
                width={600}
                height={500}
                className="rounded-2xl shadow-2xl w-full h-auto"
              />
              <div className="absolute -bottom-6 -right-6 bg-primary text-primary-foreground p-6 rounded-xl shadow-xl">
                <div className="text-2xl font-bold">25+</div>
                <div className="text-sm">Years of Excellence</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold text-foreground">Our Values Drive Everything</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto text-pretty">
              Every decision we make, every partnership we forge, is guided by these core principles.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 text-center">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Award className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-2xl font-bold mb-4">Quality First</h3>
                <p className="text-muted-foreground leading-relaxed">
                  We never compromise on quality. Every piece of leather that passes through our network meets the
                  highest standards of craftsmanship and durability.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 text-center">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Users className="w-8 h-8 text-accent" />
                </div>
                <h3 className="text-2xl font-bold mb-4">Partnership</h3>
                <p className="text-muted-foreground leading-relaxed">
                  We believe in building lasting relationships. Our clients aren't just customers—they're partners in a
                  shared journey toward excellence.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 text-center">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Globe className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-2xl font-bold mb-4">Global Impact</h3>
                <p className="text-muted-foreground leading-relaxed">
                  From local artisans to international brands, we're proud to support businesses that create beautiful,
                  lasting products for the world.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Journey Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center space-y-4 mb-16">
              <h2 className="text-4xl sm:text-5xl font-bold text-foreground">Your Journey Starts Here</h2>
              <p className="text-xl text-muted-foreground text-pretty">
                Every great product has a story. Let us help you write yours.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="space-y-8">
                <div className="space-y-6">
                  <h3 className="text-2xl font-bold text-foreground">From Vision to Reality</h3>
                  <p className="text-lg text-muted-foreground leading-relaxed text-pretty">
                    Whether you're a startup with a bold vision or an established brand looking to elevate your
                    products, we're here to make it happen. Our process is designed around your success.
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="flex items-start space-x-4">
                    <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <CheckCircle className="w-5 h-5 text-primary-foreground" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground">Discover Your Needs</h4>
                      <p className="text-muted-foreground">
                        We listen, understand, and recommend the perfect materials for your vision.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <CheckCircle className="w-5 h-5 text-accent-foreground" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground">Experience Quality</h4>
                      <p className="text-muted-foreground">
                        Sample our materials and see the difference quality makes.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <CheckCircle className="w-5 h-5 text-primary-foreground" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground">Build Together</h4>
                      <p className="text-muted-foreground">
                        From order to delivery, we're with you every step of the way.
                      </p>
                    </div>
                  </div>
                </div>

                <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground" asChild>
                  <Link href="/sample-request">
                    Begin Your Story
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Link>
                </Button>
              </div>

              <div className="relative">
                <Image
                  src="/leather-products-journey-from-raw-material-to-fini.jpg"
                  alt="Your Journey"
                  width={500}
                  height={500}
                  className="rounded-2xl shadow-2xl w-full h-auto"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final Story CTA */}
      <section className="py-20 bg-gradient-to-r from-primary to-accent text-primary-foreground">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="max-w-4xl mx-auto space-y-8">
            <h2 className="text-4xl sm:text-5xl font-bold text-balance">Every Great Story Needs a Beginning</h2>
            <p className="text-xl opacity-90 text-pretty">
              Join the thousands of businesses who've chosen Pure Grain to be part of their success story. Your journey
              to premium leather excellence starts with a single step.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                variant="secondary"
                className="text-lg px-8 py-6 bg-background text-foreground hover:bg-background/90"
                asChild
              >
                <Link href="/sample-request">
                  Start Your Story
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="text-lg px-8 py-6 border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary bg-transparent"
                asChild
              >
                <Link href="/about">Learn More About Us</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
