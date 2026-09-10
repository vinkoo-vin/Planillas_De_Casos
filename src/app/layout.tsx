import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://vinko-seven.vercel.app"),
  title: "Vinko | Casos Clínicos Pediátricos",
  description: "Sistema integral para la carga y simulación de casos clínicos pediátricos",
  icons: {
    icon: [
      { url: "/icon.svg?v=2", type: "image/svg+xml" },
      { url: "/favicon.ico?v=2", sizes: "any" },
    ],
    shortcut: "/icon.svg?v=2",
    apple: "/icon.svg?v=2",
  },
  openGraph: {
    title: "Vinko | Casos Clínicos Pediátricos",
    description: "Sistema integral para la carga y simulación de casos clínicos pediátricos",
    url: "https://vinko-seven.vercel.app",
    siteName: "Vinko",
    locale: "es_AR",
    type: "website",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Vinko - Casos Clínicos Pediátricos",
      },
      {
        url: "/logo-preview.png",
        width: 600,
        height: 600,
        alt: "Vinko Logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Vinko | Casos Clínicos Pediátricos",
    description: "Sistema integral para la carga y simulación de casos clínicos pediátricos",
    images: ["/og-image.png"],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
