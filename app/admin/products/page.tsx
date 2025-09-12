import { IProduct, Pagination as ProductPagination, IProductType } from "@/types/product"; // Renamed for clarity in this file
import ProductList from "@/components/ProductList";
import { Toaster } from "react-hot-toast";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

/**
 * Fetches product data from the Next.js API route.
 * This function runs on the server (in a Server Component).
 * It is designed to always return a valid data structure, even on error.
 * @param page - Current page number for pagination (optional, defaults to 1)
 * @param limit - Number of items per page for pagination (optional, defaults to 10)
 * @returns An object containing products and pagination info. Never returns null.
 */
async function getProducts(
  page: number = 1,
  limit: number = 10,
): Promise<{ products: IProduct[]; pagination: ProductPagination }> {
  const baseUrl = process.env.NEXT_INTERNAL_BACKEND_BASE_URL;
  const apiPath = process.env.NEXT_PUBLIC_BACKEND_API_URL;

  const effectiveBaseUrl = baseUrl || "http://localhost:3000";
  const effectiveApiPath = apiPath || "/api";

  if (!baseUrl || !apiPath) {
    console.warn(
      "Warning: Missing NEXT_INTERNAL_BACKEND_BASE_URL or NEXT_PUBLIC_BACKEND_API_URL. Using defaults."
    );
  }

  // Define a default/empty pagination object matching your type
  const defaultPagination: ProductPagination = {
    currentPage: page,
    totalPages: 0,
    limit: limit,
    totalProducts: 0, // Use totalProducts here
  };

  try {
    const fetchUrl = `${effectiveBaseUrl}${effectiveApiPath}/finished-products?page=${page}&limit=${limit}`;
    const res = await fetch(fetchUrl, {
      cache: "no-store",
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({ message: res.statusText }));
      console.error(
        `Failed to fetch products from API route (Status: ${res.status}):`,
        errorData.message
      );
      // Fallback to empty data on HTTP error
      return { products: [], pagination: defaultPagination };
    }

    const data = await res.json();
    if (!data.success) {
      console.error("Backend reported success: false. Message:", data.message);
      // Fallback to empty data on backend success: false
      return { products: [], pagination: defaultPagination };
    }

    // Ensure data.data is an array and data.pagination exists and has totalProducts
    // Assuming your backend sends `{ data: [], pagination: { totalProducts: N, ... } }`
    if (!Array.isArray(data.data) ||
        typeof data.pagination !== 'object' ||
        data.pagination === null ||
        !('totalProducts' in data.pagination)) // <<< Check for 'totalProducts'
    {
      console.error("API response structure is unexpected:", data);
      // Fallback to empty data on unexpected API response structure
      return { products: [], pagination: defaultPagination };
    }

    return { products: data.data, pagination: data.pagination };
  } catch (error) {
    console.error("Error fetching products from Next.js API route:", error);
    // Fallback to empty data on any uncaught error (e.g., network error, JSON parsing error)
    return { products: [], pagination: defaultPagination };
  }
}

/**
 * Fetches product types from the Next.js API route.
 * @returns An array of product types.
 */
async function getProductTypes(): Promise<IProductType[]> {
  const baseUrl = process.env.NEXT_INTERNAL_BACKEND_BASE_URL;
  const apiPath = process.env.NEXT_PUBLIC_BACKEND_API_URL;

  const effectiveBaseUrl = baseUrl || "http://localhost:3000";
  const effectiveApiPath = apiPath || "/api";

  try {
    const fetchUrl = `${effectiveBaseUrl}${effectiveApiPath}/product-types`;
    const res = await fetch(fetchUrl, {
      cache: "no-store",
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({ message: res.statusText }));
      console.error(
        `Failed to fetch product types from API route (Status: ${res.status}):`,
        errorData.message
      );
      return [];
    }

    const data = await res.json();
    if (!data.success || !Array.isArray(data.data)) {
      console.error("API response for product types is unexpected:", data);
      return [];
    }
    return data.data;
  } catch (error) {
    console.error("Error fetching product types from Next.js API route:", error);
    return [];
  }
}


/**
 * The main Admin Products Page component.
 * This is a Server Component, responsible for initial data fetching and rendering.
 */
export default async function AdminProductsPage() {
  const productsData = await getProducts();
  const productTypesData = await getProductTypes(); // Fetch product types

  return (
    <div className="space-y-6">
      {/* Toaster should ideally be in a client component higher up the tree (e.g., app/layout.tsx) */}
      {/* <Toaster /> */}

      <Card className="rounded-none">
        <CardHeader>
          <CardTitle>Product Inventory</CardTitle>
          <CardDescription>
            Manage your finished product inventory, including filtering, sorting, and CRUD operations.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ProductList
            initialProducts={productsData.products}
            totalProductsCount={productsData.pagination.totalProducts}
            initialProductTypes={productTypesData} // Pass product types here
          />
        </CardContent>
      </Card>
    </div>
  );
}