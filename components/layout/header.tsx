"use client"

import { Button } from "@/components/ui/button"
import { PremiumDropdown } from "@/components/premium-dropdown"
import { MobileMenu } from "@/components/mobile-menu"
import { HomeDropdown } from "@/components/home-dropdown"
import { ThemeToggle } from "@/components/theme-toggle"
import { ArrowRight } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

export function Header() {
  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-3">
          {/* Logo */}
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

          {/* Centered Nav */}
          <div className="hidden md:flex justify-center flex-1">
            <nav className="flex items-center space-x-8">
              <HomeDropdown />
              <PremiumDropdown />
              <Link href="/about" className="text-foreground/80 hover:text-foreground transition-colors">
                About
              </Link>
              <Link href="/#process" className="text-foreground/80 hover:text-foreground transition-colors">
                Process
              </Link>
              <Link href="/contact" className="text-foreground/80 hover:text-foreground transition-colors">
                Contact
              </Link>
            </nav>
          </div>

          {/* Right Side Buttons */}
          <div className="flex items-center space-x-2 sm:space-x-4 min-w-max">
            <ThemeToggle />
            <Button variant="ghost" className="hidden sm:inline-flex hover:scale-105 transition-transform" asChild>
              <Link href="/quote-request">Request Quote</Link>
            </Button>
            <Button
              className="bg-amber-800 hover:bg-amber-900 dark:bg-amber-700 dark:hover:bg-amber-800 hover:scale-105 transition-all"
              asChild
            >
              <Link href="/sample-request">
                <span className="hidden sm:inline">Get Samples</span>
                <span className="sm:hidden">Samples</span>
                <ArrowRight className="ml-2 w-4 h-4" />
              </Link>
            </Button>
            <MobileMenu />
          </div>
        </div>
      </div>
    </header>
  )
}
