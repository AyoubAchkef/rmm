import type { Metadata } from "next";
import { Source_Sans_3 } from "next/font/google";
import { PageTransition } from "@/components/page-transition";
import { LanguageProvider } from "@/contexts/language-context";
import { ThemeProvider } from "@/contexts/theme-context";
import { SuppressLogsScript } from "./suppress-logs-script";

import "./globals.css";
import "@/utils/suppress-dev-logs";

// Rothschild & Co Typography
// Source Sans Pro (via Source Sans 3 - the updated version)
const sourceSans = Source_Sans_3({
  subsets: ["latin"],
  weight: ["200", "300", "400", "600", "700", "900"],
  style: ["normal", "italic"],
  variable: "--font-source-sans",
  display: "swap",
});

// For Calluna, we'll use Georgia as fallback until the commercial font is added
// Note: To add Calluna, place the font files in public/fonts/calluna/
// and uncomment the @font-face declarations in globals.css

export const metadata: Metadata = {
  title: "AI Studio - Rothschild & Co",
  description: "Your AI-Powered Development Hub",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <SuppressLogsScript />
      </head>
      <body className={`${sourceSans.variable} antialiased`}>
        <ThemeProvider>
          <LanguageProvider>
            <PageTransition>{children}</PageTransition>
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
