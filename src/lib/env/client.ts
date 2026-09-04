/**
 * Client-safe Environment Configuration.
 * Strictly exposes variables prefixed with NEXT_PUBLIC_.
 * Safe to import in browser bundles and "use client" components.
 */

export interface ClientEnvConfig {
  appUrl: string;
  siteUrl: string;
  businessName: string;
  businessWhatsappNumber: string;
  businessWhatsappDisplay: string;
  supabaseUrl?: string;
  supabaseAnonKey?: string;
  googleMapsBrowserKey?: string;
  isProduction: boolean;
}

export const clientEnv: ClientEnvConfig = {
  appUrl: process.env.NEXT_PUBLIC_APP_URL || "https://trihexdigital.shop",
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || "https://trihexdigital.shop",
  businessName: process.env.NEXT_PUBLIC_BUSINESS_NAME || "TRIHEX DIGITAL",
  businessWhatsappNumber: process.env.NEXT_PUBLIC_BUSINESS_WHATSAPP_NUMBER || "9779800000000",
  businessWhatsappDisplay: process.env.NEXT_PUBLIC_BUSINESS_WHATSAPP_DISPLAY || "+977 980-0000000",
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  googleMapsBrowserKey:
    process.env.NEXT_PUBLIC_GOOGLE_MAPS_BROWSER_KEY ||
    process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
  isProduction: process.env.NODE_ENV === "production",
};
