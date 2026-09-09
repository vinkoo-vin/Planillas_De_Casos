import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Vinko | Casos Clínicos Pediátricos",
  description: "Sistema integral para la carga y simulación de casos clínicos pediátricos",
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/favicon.ico", sizes: "any" },
    ],
    shortcut: "/icon.svg",
    apple: "/icon.svg",
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
