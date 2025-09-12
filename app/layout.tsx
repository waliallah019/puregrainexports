import type React from "react"
import type { Metadata } from "next"
import { Inter, Playfair_Display } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import {ReactLenis} from "@/lib/utils/lenis"

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" })
const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-playfair" })

export const metadata: Metadata = {
  title: "Pure Grain - Premium B2B Leather Wholesale | Where Grain meets Greatness",
  description:
    "Premium B2B leather wholesale platform. Source quality raw leather materials and finished leather products, for international wholesale and retail distribution.",
  keywords:
    "leather wholesale, B2B leather, raw leather materials, finished leather products, international leather supplier",
  generator: 'v0.dev',
  icons: {
    icon: '/favicon-modified.png',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    // FIX: Move suppressHydrationWarning to the <html> tag
    <html lang="en" suppressHydrationWarning>
      {/* ReactLenis can remain outside or inside ThemeProvider, won't affect this issue */}
      <ReactLenis root>
        <body
          // FIX: Remove suppressHydrationWarning from <body>, it's not needed here for this issue
          // If you have other specific <body> hydration issues, you might add it back.
          className={`${inter.variable} ${playfair.variable} font-sans`}
        >
          {/* ThemeProvider correctly wraps children and targets <html> */}
          <ThemeProvider
            attribute="class"
            defaultTheme="light" // Initial server-rendered theme
            enableSystem={false} // Disables system preference detection, relies on 'light' or stored theme
            disableTransitionOnChange={true} // For smoother theme changes
          >
            {children}
          </ThemeProvider>
        </body>
      </ReactLenis>
    </html>
  )
}