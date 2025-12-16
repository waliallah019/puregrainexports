"use client"

import { Button } from "@/components/ui/button"
import { PremiumDropdown } from "@/components/premium-dropdown"
import { MobileMenu } from "@/components/mobile-menu"
import { HomeDropdown } from "@/components/home-dropdown"
import { ThemeToggle } from "@/components/theme-toggle"
import { AnnouncementTicker } from "@/components/layout/announcement-ticker"
import { ArrowRight } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-leather">
      <div className="border-b border-amber-200/30 dark:border-amber-800/20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-3">
            {/* Logo */}
            <div className="flex items-center space-x-3 min-w-max">
              <Image
                src="/new_logo.png"
                alt="Pure Grain Logo Light"
                width={180}
                height={50}
                className="dark:hidden object-contain hover:opacity-90 transition-opacity"
              />
              <Image
                src="/temp_logo.png"
                alt="Pure Grain Logo Dark"
                width={180}
                height={50}
                className="hidden dark:block object-contain hover:opacity-90 transition-opacity"
              />
            </div>

            {/* Centered Nav */}
            <div className="hidden md:flex justify-center flex-1">
              <nav className="flex items-center space-x-8">
                <HomeDropdown />
                <PremiumDropdown />
                <Link href="/about" className="text-foreground/80 hover:text-foreground transition-premium font-medium">
                  About
                </Link>
                <Link href="/#process" className="text-foreground/80 hover:text-foreground transition-premium font-medium">
                  Process
                </Link>
                <Link href="/contact" className="text-foreground/80 hover:text-foreground transition-premium font-medium">
                  Contact
                </Link>
              </nav>
            </div>

            {/* Right Side Buttons */}
            <div className="flex items-center space-x-2 sm:space-x-4 min-w-max">
              <ThemeToggle />
             
              <Button
                className="bg-amber-800 hover:bg-amber-900 dark:bg-amber-700 dark:hover:bg-amber-800 hover:scale-105 transition-premium micro-bounce shadow-leather"
                asChild
              >
                <Link href="/catalog">
                  <span className="hidden sm:inline">Browse Catalog</span>
                  <span className="sm:hidden">Catalog</span>
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Link>
              </Button>
              <MobileMenu />
            </div>
          </div>
        </div>
      </div>
      <AnnouncementTicker />
    </header>
  )
}
