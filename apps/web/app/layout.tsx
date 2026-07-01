import type { Metadata } from "next";
import { Instrument_Serif, Inter, JetBrains_Mono } from "next/font/google";
import { NuqsAdapter } from "nuqs/adapters/next/app";

import "@karakeep/tailwind-config/globals.css";
import "streamdown/styles.css";

import type { Viewport } from "next";
import React from "react";
import Providers from "@/lib/providers";
import { getUserLocalSettings } from "@/lib/userLocalSettings/userLocalSettings";
import { getServerAuthSession } from "@/server/auth";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { Toaster } from "sonner";

import { clientConfig } from "@karakeep/shared/config";

// Krystal typography.
// Instrument Serif = editorial hero display (a free Editorial New / Cardinal
// stand-in, chosen for the mymind-inspired feel). JetBrains Mono is used for
// note-card typewriter texture.
const inter = Inter({
  subsets: ["latin"],
  fallback: ["sans-serif"],
  variable: "--font-sans",
});

const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  weight: ["400"],
  style: ["normal", "italic"],
  fallback: ["Georgia", "serif"],
  variable: "--font-serif",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  fallback: ["ui-monospace", "monospace"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "Krystal",
  applicationName: "Krystal",
  description:
    "Your crystals of knowledge. Save anything from anywhere \u2014 Krystal takes care of the rest.",
  appleWebApp: {
    capable: true,
    title: "Krystal",
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getServerAuthSession();
  const userSettings = await getUserLocalSettings();
  const isRTL = userSettings.lang === "ar";
  return (
    <html
      lang={userSettings.lang}
      dir={isRTL ? "rtl" : "ltr"}
      suppressHydrationWarning
    >
      <body
        className={`${inter.variable} ${instrumentSerif.variable} ${jetbrainsMono.variable} font-sans`}
      >
        <NuqsAdapter>
          <Providers
            session={session}
            clientConfig={clientConfig}
            userLocalSettings={await getUserLocalSettings()}
          >
            {children}
            <ReactQueryDevtools initialIsOpen={false} />
          </Providers>
          <Toaster />
        </NuqsAdapter>
      </body>
    </html>
  );
}
