import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { FontAwesomeProvider } from "./providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Hero Dinámico - Sitio Web Moderno",
  description: "Un sitio web moderno con un hero dinámico, header y footer personalizables.",
  keywords: ["Next.js", "React", "Tailwind CSS", "Hero", "Landing Page"],
  authors: [{ name: "Tu Nombre" }],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-white text-gray-900 flex flex-col min-h-screen`}>
        <FontAwesomeProvider>
          <div className="flex flex-col flex-1">
            {children}
          </div>
        </FontAwesomeProvider>
      </body>
    </html>
  );
}
