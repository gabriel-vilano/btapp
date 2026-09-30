import type { Metadata, Viewport } from "next";
import { Arimo } from "next/font/google";
import "./globals.css";

const arimo = Arimo({
  subsets: ["latin"],
  variable: "--font-arimo",
  weight: "variable",
});

export const metadata: Metadata = {
  title: "LetzPlay",
  description: "Rankings, torneios e comunidade de Beach Tennis",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  // Sem cover, os env(safe-area-inset-*) da TabBar, do NavigationRail e do
  // AppHeader valem 0 no iPhone e a barra fica sob o indicador de início (N26)
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={arimo.variable}>
      <body>{children}</body>
    </html>
  );
}
