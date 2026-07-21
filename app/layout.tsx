import type { Metadata, Viewport } from "next";
import { Bebas_Neue, Inter } from "next/font/google";
import { SHOP } from "@/lib/menu";
import "./globals.css";

const display = Bebas_Neue({ weight: "400", subsets: ["latin"], variable: "--font-display", display: "swap" });
const body = Inter({ subsets: ["latin"], variable: "--font-body", display: "swap" });

const description = `Japanese-flavored chicken tenders at ${SHOP.street}, ${SHOP.city} ${SHOP.state}. Seven flavors, eight sauces, gluten-free fryer. ${SHOP.tagline}.`;

export const metadata: Metadata = {
  metadataBase: new URL("https://www.tokyotenders.com"),
  title: { default: `${SHOP.name} — ${SHOP.tagline}`, template: `%s · ${SHOP.name}` },
  description,
  keywords: ["chicken tenders", "Pacoima", "gluten free", "Japanese chicken", "Tokyo Tenders"],
  openGraph: {
    title: `${SHOP.name} — ${SHOP.tagline}`,
    description,
    type: "website",
    locale: "en_US",
    siteName: SHOP.name,
    images: [{ url: "/badge.png", width: 1024, height: 1024, alt: SHOP.name }],
  },
  twitter: { card: "summary_large_image", title: SHOP.name, description, images: ["/badge.png"] },
  icons: { icon: "/badge.png", apple: "/badge.png" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#fffdf9",
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Restaurant",
  name: SHOP.name,
  description,
  servesCuisine: ["Chicken", "Japanese", "American"],
  priceRange: "$$",
  telephone: SHOP.phone,
  email: SHOP.email,
  slogan: SHOP.tagline,
  address: {
    "@type": "PostalAddress",
    streetAddress: SHOP.street,
    addressLocality: SHOP.city,
    addressRegion: SHOP.state,
    postalCode: SHOP.zip,
    addressCountry: "US",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable}`}>
      <body>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
        {children}
      </body>
    </html>
  );
}
