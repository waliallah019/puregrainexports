"use client"
import { ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import Link from "next/link"
import { usePathname } from "next/navigation"

export function HomeDropdown() {
  const pathname = usePathname()

  const homeVariations = [
    { name: "Original", href: "/" },
    { name: "Bold Visuals", href: "/home-2" },
    { name: "Grid Layout", href: "/home-3" },
    { name: "Storytelling", href: "/home-4" },
  ]

  const currentVariation = homeVariations.find((variation) => variation.href === pathname)?.name || "Home"

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="text-foreground/80 hover:text-foreground transition-colors flex items-center gap-1"
        >
          {currentVariation}
          <ChevronDown className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-48">
        {homeVariations.map((variation) => (
          <DropdownMenuItem key={variation.href} asChild>
            <Link
              href={variation.href}
              className={`w-full ${pathname === variation.href ? "bg-accent text-accent-foreground" : ""}`}
            >
              {variation.name}
            </Link>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
