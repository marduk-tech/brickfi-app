import type { Metadata } from "next";
import { ClientProviders } from "../components/client-providers";
import "../theme/globals.scss";

export const metadata: Metadata = {
  metadataBase: new URL("https://brickfi.in"),
  title: {
    default: "Brickfi | The Smartest Way to Buy your Next Property",
    template: "%s | Brickfi"
  },
  description: "The smartest way to buy real estate. Get a comprehensive Brick360 report around property, investment, builder and more for any property in Bangalore.",
  keywords: ["real estate", "property", "bangalore", "investment", "brick360", "brickfi"],
  authors: [{ name: "Brickfi" }],
  creator: "Brickfi",
  publisher: "Brickfi",
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: "/favicon.ico",
  },
  alternates: {
    canonical: "https://brickfi.in/",
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "https://brickfi.in",
    siteName: "Brickfi",
    title: "The Smartest Way to Buy your Next Property",
    description: "The smartest way to buy real estate. Get a comprehensive Brick360 report around property, investment, builder and more for any property in Bangalore.",
    images: [
      {
        url: "/images/brickfi-preview.png",
        width: 1200,
        height: 630,
        alt: "Brickfi - The Smartest Way to Buy your Next Property",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "The Smartest Way to Buy your Next Property",
    description: "The smartest way to buy real estate. Get a comprehensive Brick360 report around property, investment, builder and more for any property in Bangalore.",
    images: ["/images/brickfi-preview.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_VERIFICATION,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <ClientProviders>
          {children}
        </ClientProviders>
      </body>
    </html>
  );
}
