"use client"

import { useEffect, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, Package, DollarSign, Globe, Award, Truck } from "lucide-react"
import { cn } from "@/lib/utils"

interface Announcement {
  id: string
  text: string
  icon?: React.ReactNode
  type?: "info" | "promo" | "moq" | "discount" | "export"
  highlight?: boolean
}

const announcements: Announcement[] = [
  {
    id: "1",
    text: "Bulk Orders: 10% discount on orders over 1,000 sq ft",
    icon: <DollarSign className="w-4 h-4" />,
    type: "discount",
    highlight: true,
  },
  {
    id: "2",
    text: "MOQ: Minimum order quantity starts at 50 sq ft for raw leather",
    icon: <Package className="w-4 h-4" />,
    type: "moq",
  },
  {
    id: "3",
    text: "Global Shipping: We export to 40+ countries worldwide",
    icon: <Globe className="w-4 h-4" />,
    type: "export",
  },
  {
    id: "4",
    text: "Quality Certified: ISO 9001:2015 & OEKO-TEX Standard certified",
    icon: <Award className="w-4 h-4" />,
    type: "info",
  },
  {
    id: "5",
    text: "Express Shipping: 3-5 business days available for urgent orders",
    icon: <Truck className="w-4 h-4" />,
    type: "promo",
  },
  {
    id: "6",
    text: "New Arrival: Premium Italian Full-Grain Leather now in stock",
    icon: <TrendingUp className="w-4 h-4" />,
    type: "promo",
    highlight: true,
  },
]

export function AnnouncementTicker() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)

  useEffect(() => {
    if (isPaused) return

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % announcements.length)
    }, 5000) // Change announcement every 5 seconds

    return () => clearInterval(interval)
  }, [isPaused])

  const getBadgeVariant = (type?: string) => {
    switch (type) {
      case "discount":
        return "default"
      case "promo":
        return "secondary"
      case "moq":
        return "outline"
      default:
        return "outline"
    }
  }

  const getBadgeColor = (type?: string) => {
    switch (type) {
      case "discount":
        return "bg-white/90 text-green-700 dark:bg-green-900 dark:text-green-100 border-white/50 dark:border-green-700 shadow-sm"
      case "promo":
        return "bg-white/90 text-amber-800 dark:bg-amber-900 dark:text-amber-100 border-white/50 dark:border-amber-700 shadow-sm"
      case "moq":
        return "bg-white/90 text-blue-700 dark:bg-blue-900 dark:text-blue-100 border-white/50 dark:border-blue-700 shadow-sm"
      default:
        return "bg-white/90 text-foreground dark:bg-amber-900 dark:text-amber-100 border-white/50 dark:border-amber-700 shadow-sm"
    }
  }

  return (
    <div
      className="relative overflow-hidden border-b border-amber-300 dark:border-amber-800/30 bg-gradient-to-r from-amber-600 via-amber-700 to-amber-600 dark:from-amber-900/40 dark:via-amber-950/30 dark:to-amber-900/40 backdrop-blur-sm shadow-lg"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-center py-3">
          <div className="flex items-center gap-3 min-w-0 flex-1 justify-center">
            {announcements[currentIndex].icon && (
              <div className="flex-shrink-0 text-white dark:text-amber-400">
                {announcements[currentIndex].icon}
              </div>
            )}
            <div className="flex items-center gap-2 min-w-0">
              {announcements[currentIndex].type && (
                <Badge
                  variant={getBadgeVariant(announcements[currentIndex].type)}
                  className={cn(
                    "text-xs flex-shrink-0",
                    getBadgeColor(announcements[currentIndex].type)
                  )}
                >
                  {announcements[currentIndex].type === "discount" && "Discount"}
                  {announcements[currentIndex].type === "promo" && "New"}
                  {announcements[currentIndex].type === "moq" && "MOQ"}
                  {announcements[currentIndex].type === "export" && "Export"}
                  {announcements[currentIndex].type === "info" && "Info"}
                </Badge>
              )}
              <p
                className={cn(
                  "text-sm font-medium text-white dark:text-amber-100 truncate",
                  announcements[currentIndex].highlight && "font-semibold"
                )}
              >
                {announcements[currentIndex].text}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Progress indicator */}
      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-900/30 dark:bg-amber-800/20">
        <div
          className="h-full bg-white/80 dark:bg-amber-500 transition-all duration-5000 ease-linear"
          style={{
            width: `${((currentIndex + 1) / announcements.length) * 100}%`,
            animation: isPaused ? "none" : "progress 5s linear",
          }}
        />
      </div>

      {/* Navigation dots */}
      <div className="absolute right-4 top-1/2 -translate-y-1/2 flex gap-1">
        {announcements.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={cn(
              "w-1.5 h-1.5 rounded-full transition-all",
              index === currentIndex
                ? "bg-white dark:bg-amber-400 w-4"
                : "bg-white/50 dark:bg-amber-700/50 hover:bg-white/80 dark:hover:bg-amber-600"
            )}
            aria-label={`Go to announcement ${index + 1}`}
          />
        ))}
      </div>

      <style jsx>{`
        @keyframes progress {
          from {
            width: ${(currentIndex / announcements.length) * 100}%;
          }
          to {
            width: ${((currentIndex + 1) / announcements.length) * 100}%;
          }
        }
      `}</style>
    </div>
  )
}

