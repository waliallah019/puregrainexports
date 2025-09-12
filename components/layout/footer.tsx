import Image from "next/image"
import Link from "next/link"
import { Mail, Phone, MapPin } from "lucide-react"

export function Footer() {
  return (
    <footer className="bg-background border-t py-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-4 gap-8">
          <div className="space-y-4 animate-fade-in">
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-3 min-w-max">
                <Image
                  src="/new_logo.png"
                  alt="Pure Grain Logo Light"
                  width={180}
                  height={50}
                  className="dark:hidden object-contain"
                />
                <Image
                  src="/temp_logo.png"
                  alt="Pure Grain Logo Dark"
                  width={180}
                  height={50}
                  className="hidden dark:block object-contain"
                />
              
              </div>
              
            </div>
            <p className="text-muted-foreground">
              Premium B2B leather wholesale platform serving international buyers with quality raw materials and
              finished products.
            </p>
            <div className="space-y-2 text-sm text-muted-foreground">
              <div className="flex items-center space-x-2 hover:text-foreground transition-colors">
                <Mail className="w-4 h-4" />
                <span>wholesale@puregrain.com</span>
              </div>
              <div className="flex items-center space-x-2 hover:text-foreground transition-colors">
                <Phone className="w-4 h-4" />
                <span>+1 (555) 123-4567</span>
              </div>
              <div className="flex items-center space-x-2 hover:text-foreground transition-colors">
                <MapPin className="w-4 h-4" />
                <span>International Shipping Available</span>
              </div>
            </div>
          </div>

          <div className="animate-fade-in-delay-1">
            <h3 className="font-semibold mb-4 text-foreground">Products</h3>
            <ul className="space-y-2 text-muted-foreground">
              <li>
                <Link href="/catalog/raw-leather" className="hover:text-foreground transition-colors">
                  Raw Leather Materials
                </Link>
              </li>
              <li>
                <Link href="/catalog/finished-products" className="hover:text-foreground transition-colors">
                  Finished Products
                </Link>
              </li>
              <li>
                <Link href="/custom-manufacturing" className="hover:text-foreground transition-colors">
                  Custom Manufacturing
                </Link>
              </li>
              <li>
                <Link href="/sample-request" className="hover:text-foreground transition-colors">
                  Sample Requests
                </Link>
              </li>
            </ul>
          </div>

          <div className="animate-fade-in-delay-2">
            <h3 className="font-semibold mb-4 text-foreground">Services</h3>
            <ul className="space-y-2 text-muted-foreground">
              <li>
                <Link href="/quote-request" className="hover:text-foreground transition-colors">
                  Quote Requests
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-foreground transition-colors">
                  International Shipping
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-foreground transition-colors">
                  Quality Assurance
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-foreground transition-colors">
                  Design Upload
                </Link>
              </li>
            </ul>
          </div>

          <div className="animate-fade-in-delay-3">
            <h3 className="font-semibold mb-4 text-foreground">Company</h3>
            <ul className="space-y-2 text-muted-foreground">
              <li>
                <Link href="/about" className="hover:text-foreground transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-foreground transition-colors">
                  Quality Standards
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-foreground transition-colors">
                  Certifications
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-foreground transition-colors">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border mt-12 pt-8 text-center text-muted-foreground animate-fade-in">
          <p>&copy; {new Date().getFullYear()} Pure Grain. All rights reserved. | Where Grain meets Greatness</p>
        </div>
      </div>
    </footer>
  )
}
