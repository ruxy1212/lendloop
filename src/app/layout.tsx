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
    <ClerkProvider
      appearance={{
        variables: {
          colorPrimary: "#131bff",
          colorBackground: "#111127",
          colorForeground: "#f5f5ff",
          borderRadius: "0.75rem",
        },
        elements: {
          formFieldInput: {
            backgroundColor: "#17182f",
            color: "#f5f5ff",
          },
          footerActionLink: {
            color: "#05c2ff",
          },
          footerActionText: {
            color: "#a8a8c7",
          },
          formFieldAction: {
            color: "#05c2ff",
          },
          socialButtonsBlockButton: {
            backgroundColor: "#17182f",
            borderColor: "#2d3058",
          },
          socialButtonsBlockButtonText: {
            color: "#f5f5ff",
          },
          userButtonPopoverCard: {
            backgroundColor: "#111127",
          },
          userButtonPopoverActionButton: {
            color: "#f5f5ff",
            "&:hover": {
              color: "#05c2ff",
              backgroundColor: "rgba(5, 194, 255, 0.10)",
            },
          },
          userButtonPopoverActionButtonText: {
            color: "#f5f5ff",
            "&:hover": {
              color: "#05c2ff",
            },
          },
          userButtonPopoverActionButtonIcon: {
            color: "#a8a8c7",
            "&:hover": {
              color: "#05c2ff",
            },
          },
        },
      }}
    >
      <html lang="en" className={`${sans.variable} ${display.variable}`}>
        <body className="font-sans antialiased min-h-screen">
          <Providers>{children}</Providers>
        </body>
      </html>
    </ClerkProvider>
  );
}
