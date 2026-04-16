import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// --- CONFIGURACIÓN DE GOOGLE Y REDES SOCIALES ---
export const metadata: Metadata = {
  title: {
    default: "Kaori Store | Tecnología, Pet Shop y Outlet",
    template: "%s | Kaori Store",
  },
  description:
    "La tienda online más preciosa de Cochabamba. Encuentra tecnología, accesorios para mascotas y productos de outlet con la garantía de Kaori.",
  keywords: [
    "Kaori Store",
    "Tienda online Cochabamba",
    "Pet Shop Bolivia",
    "Celulares Bolivia",
    "UrbanCell",
    "Outlet Bolivia",
    "Kaori-chan",
  ],
  authors: [{ name: "Kaori Store" }],
  creator: "Kaori Store",
  publisher: "Kaori Store",

  // 1. Esto pone a la niña en la pestaña del navegador (Favicon)
  icons: {
    icon: "/logo-kaori.png",
    apple: "/logo-kaori.png",
  },

  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },

  // 2. Esto hace que Google y WhatsApp muestren la imagen de la niña
  openGraph: {
    title: "Kaori Store",
    description:
      "¡Envíos a toda Bolivia desde Cochabamba! La tienda de la niña del cabello azul.",
    url: "https://kaori-store.vercel.app",
    siteName: "Kaori Store",
    images: [
      {
        url: "/logo-kaori.png",
        width: 1200,
        height: 630,
        alt: "Kaori Store Logo",
      },
    ],
    locale: "es_BO",
    type: "website",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#F8FAFC]">{children}</body>
    </html>
  );
}
