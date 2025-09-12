"use client"

import * as React from "react"
import { ChevronDown, Package, Upload, Boxes } from "lucide-react" // 👈 Boxes icon for Finished Products
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import Link from "next/link"

export function PremiumDropdown() {
  const [isOpen, setIsOpen] = React.useState(false)

  const menuItems = [
    {
      icon: Boxes, // 🆕 Icon for Finished Products
      title: "Finished Products",
      description: "Ready-to-ship leather goods",
      href: "/catalog/finished-products",
    },
    {
      icon: Package,
      title: "Raw Leather Materials",
      description: "Premium hides and raw materials",
      href: "/catalog/raw-leather",
    },
    {
      icon: Upload,
      title: "Custom Manufacturing",
      description: "Upload designs for custom products",
      href: "/custom-manufacturing",
    },
  ]

  return (
    <DropdownMenu onOpenChange={setIsOpen}>
      <DropdownMenuTrigger className="flex items-center space-x-1 text-foreground/80 hover:text-foreground transition-colors outline-none">
        <span>Catalog</span>
        <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-80 p-2 animate-in fade-in-0 zoom-in-95 slide-in-from-top-2 duration-200"
        align="start"
      >
        {menuItems.map((item, index) => (
          <DropdownMenuItem
            key={item.title}
            className="p-0 focus:bg-transparent"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <Link
              href={item.href}
              className="flex items-start space-x-3 p-3 rounded-lg hover:bg-amber-50 dark:hover:bg-amber-950/20 transition-all duration-200 w-full group hover:scale-[1.02]"
            >
              <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                <item.icon className="w-5 h-5 text-amber-700 dark:text-amber-300" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-foreground group-hover:text-amber-800 dark:group-hover:text-amber-200 transition-colors">
                  {item.title}
                </h4>
                <p className="text-sm text-muted-foreground group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                  {item.description}
                </p>
              </div>
            </Link>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
