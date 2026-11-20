import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { Geist, Instrument_Serif } from "next/font/google";
import { Providers } from "@/components/convex-provider";
import "./globals.css";

const sans = Geist({
  subsets: ["latin"],
  variable: "--font-geist",
});

const display = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-instrument",
});

export const metadata: Metadata = {
  title: "LendLoop",
  description: "Borrow what you need. Lend what you don’t.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en" className={`${sans.variable} ${display.variable}`}>
        <body className="font-sans antialiased min-h-screen">
          <Providers>{children}</Providers>
        </body>
      </html>
    </ClerkProvider>
  );
}
