import { IRawLeather, Pagination } from "@/types/rawLeather";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Package, Palette, Ruler, Tag, ArrowRight, ShoppingCart } from "lucide-react"; // Added ShoppingCart
import RawLeatherDetailContent from "@/components/raw-leather-details/RawLeatherDetailContent"; // Client Component for interactive content
import { notFound } from "next/navigation"; // For 404 handling

interface RawLeatherDetailPageProps {
  params: {
    rawLeatherId: string; // The dynamic segment from the URL
  };
}

async function getRawLeather(rawLeatherId: string): Promise<IRawLeather | null> {
  const baseUrl = process.env.NEXT_INTERNAL_BACKEND_BASE_URL;
  const apiPath = process.env.NEXT_PUBLIC_BACKEND_API_URL;

  if (!baseUrl || !apiPath) {
    console.error("Missing NEXT_INTERNAL_BACKEND_BASE_URL or NEXT_PUBLIC_BACKEND_API_URL in environment.");
    return null;
  }

  try {
    const fetchUrl = `${baseUrl}${apiPath}/raw-leather/${rawLeatherId}`;
    const res = await fetch(fetchUrl, {
      cache: "no-store",
    });

    if (!res.ok) {
      if (res.status === 404) {
        return null; // Raw leather not found
      }
      const errorData = await res.json();
      console.error(
        `Failed to fetch raw leather ${rawLeatherId} (Status: ${res.status}):`,
        errorData.message || res.statusText
      );
      throw new Error(`Failed to fetch raw leather: ${errorData.message || res.statusText}`);
    }

    const data = await res.json();
    return data.data; // The API returns { success: true, data: rawLeather }
  } catch (error) {
    console.error(`Error fetching raw leather ${rawLeatherId}:`, error);
    return null;
  }
}

// Function to get related raw leather
async function getRelatedRawLeather(
  currentLeatherType: string,
  excludeRawLeatherId: string,
  limit: number = 4
): Promise<IRawLeather[]> {
  const baseUrl = process.env.NEXT_INTERNAL_BACKEND_BASE_URL;
  const apiPath = process.env.NEXT_PUBLIC_BACKEND_API_URL;

  if (!baseUrl || !apiPath) {
    console.error("Missing NEXT_INTERNAL_BACKEND_BASE_URL or NEXT_PUBLIC_BACKEND_API_URL in environment for related raw leather.");
    return [];
  }

  try {
    // Fetch raw leather of the same type, excluding the current one
    const fetchUrl = `${baseUrl}${apiPath}/raw-leather?leatherType=${currentLeatherType}&limit=${limit}`;
    const res = await fetch(fetchUrl, {
      cache: "no-store", // Ensure fresh data
    });

    if (!res.ok) {
      console.error(`Failed to fetch related raw leather (Status: ${res.status})`);
      return [];
    }

    const data: { data: IRawLeather[]; pagination: Pagination } = await res.json();
    // Filter out the current raw leather from the related list if it happened to be fetched
    return data.data.filter(rl => rl._id !== excludeRawLeatherId).slice(0, limit);
  } catch (error) {
    console.error("Error fetching related raw leather:", error);
    return [];
  }
}


export default async function RawLeatherDetailPage({ params }: RawLeatherDetailPageProps) {
  const rawLeather = await getRawLeather(params.rawLeatherId);

  if (!rawLeather) {
    notFound(); // Next.js built-in 404 handling
  }

  // Fetch related raw leather based on leatherType
  const relatedRawLeather = await getRelatedRawLeather(rawLeather.leatherType, rawLeather._id);


  return (
    <div className="min-h-screen bg-background">
      <Header />

      <section className="py-12 md:py-20 bg-gradient-to-br from-amber-50 via-background to-amber-50/50 dark:from-amber-950/20 dark:via-background dark:to-amber-950/10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumbs or Back to Catalog link */}
          <Link href="/catalog/raw-leather" className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1 mb-6">
            <ArrowRight className="w-4 h-4 rotate-180" /> Back to Raw Leather Catalog
          </Link>
          {rawLeather.sampleAvailable && ( // New Badge for Sample Available
            <Badge variant="outline" className="border-green-200 text-green-800 dark:border-green-800 dark:text-green-400 flex items-center mb-6">
              <ShoppingCart className="mr-1 h-3 w-3" /> Sample Available
            </Badge>
          )}

          {/* Pass rawLeather data and related products to the Client Component */}
          <RawLeatherDetailContent rawLeather={rawLeather} relatedRawLeather={relatedRawLeather} />
        </div>
      </section>

      <Footer />
    </div>
  );
}