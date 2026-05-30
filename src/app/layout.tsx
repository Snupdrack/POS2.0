import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { Providers } from "@/lib/providers";

export const metadata: Metadata = {
  title: "Nito's Pizza - Pizza Artesanal en Oaxaca | POS y Menú Digital",
  description: "La mejor pizza artesanal de Oaxaca. Sistema de punto de venta, menú digital y pedidos en línea.",
  keywords: ["Nito's Pizza", "pizza Oaxaca", "POS restaurante", "menú digital", "pedidos pizza"],
  authors: [{ name: "Nito's Pizza" }],
  openGraph: {
    title: "Nito's Pizza - Pizza Artesanal en Oaxaca",
    description: "La pizza artesanal que conquistó Oaxaca.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Nunito:wght@400;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-nunito antialiased bg-background text-foreground">
        <Providers>
          {children}
          <Toaster position="top-right" richColors />
        </Providers>
      </body>
    </html>
  );
}
