import type { Metadata } from "next";
import { Inter, Roboto_Slab, Lato } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const robotoSlab = Roboto_Slab({ subsets: ["latin"], variable: "--font-roboto-slab" });
const lato = Lato({ subsets: ["latin"], weight: ["400", "700"], variable: "--font-lato" });


export const metadata: Metadata = {
  title: "ApostilaFácil",
  description: "Crie apostilas interativas que funcionam 100% offline.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${robotoSlab.variable} ${lato.variable} font-sans antialiased`}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
