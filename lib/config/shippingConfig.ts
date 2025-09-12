// my-leather-platform/lib/shippingConfig.ts

// --- Shipping Costs and Country/Continent Map ---
export const SHIPPING_COSTS_USD_CENTS: { [continent: string]: number } = {
  'North America': 2000, // $20.00
  'Europe': 2500,        // $25.00
  'Asia': 3000,          // $30.00
  'South America': 3500, // $35.00
  'Africa': 4000,        // $40.00
  'Oceania': 3000,       // $30.00 (e.g., Australia)
  'default': 2800        // $28.00 for unmapped or other regions
};

export const COUNTRY_TO_CONTINENT_MAP: { [country: string]: string } = {
  'United States': 'North America',
  'Canada': 'North America',
  'United Kingdom': 'Europe',
  'Germany': 'Europe',
  'France': 'Europe',
  'Australia': 'Oceania',
  'Japan': 'Asia',
  'China': 'Asia',
  'India': 'Asia',
  'Brazil': 'South America',
  'Argentina': 'South America',
  'South Africa': 'Africa',
  'Nigeria': 'Africa',
  'Mexico': 'North America',
  'Italy': 'Europe',
  'Spain': 'Europe',
  'South Korea': 'Asia',
  'Egypt': 'Africa',
  // Add more as needed
  'Other': 'default' // Explicitly map 'Other' country option
};

// Export the countries array directly for use in frontend Select components
export const countries: string[] = [
  'United States', 'United Kingdom', 'Canada', 'Australia', 'Germany', 'France',
  'Japan', 'China', 'India', 'Brazil', 'Argentina', 'South Africa', 'Nigeria',
  'Mexico', 'Italy', 'Spain', 'South Korea', 'Egypt', 'Other'
].sort(); // Optional: Sort alphabetically

export function getShippingFeeInCents(country: string): number {
  const continent = COUNTRY_TO_CONTINENT_MAP[country] || 'default';
  return SHIPPING_COSTS_USD_CENTS[continent] || SHIPPING_COSTS_USD_CENTS['default'];
}

export function getShippingFeeInDollars(country: string): number {
  return getShippingFeeInCents(country) / 100;
}

// --- Form Options (Moved from app/sample-request/page.tsx for reusability) ---
// Define these types if you want to keep them centralized, otherwise ensure they are defined wherever used.
import {
  SampleRequestItemType, Urgency, BusinessType, IntendedUse, ExpectedVolume
} from '@/types/request'; // Assuming '@/types/request' defines these

export const sampleTypes: SampleRequestItemType[] = ['raw-leather', 'finished-products', 'both'];
export const quantities = ["1-3 samples", "4-6 samples", "7-10 samples", "More than 10"];
export const materialPreferences = ["Cowhide", "Buffalo", "Goat", "Sheep", "Mixed Selection", "Other"];
export const finishTypes = ["Aniline", "Semi-Aniline", "Pigmented", "Suede", "Mixed Selection", "Other"];
export const urgencies: Urgency[] = ["standard", "express", "rush"];
export const businessTypes: BusinessType[] = ['wholesaler', 'retailer', 'manufacturer', 'distributor', 'designer', 'other'];
export const intendedUses: IntendedUse[] = ['production', 'resale', 'testing', 'development', 'other'];
export const futureVolumes: ExpectedVolume[] = ['small', 'medium', 'large', 'ongoing', 'unsure'];