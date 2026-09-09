import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Carga de Casos Clínicos Pediátricos | Vynco",
  description: "Sistema integral para la carga y simulación de casos clínicos pediátricos",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
