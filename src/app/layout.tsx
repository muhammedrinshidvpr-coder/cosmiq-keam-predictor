import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CosmIQ KEAM Predictor — Find Your Best College",
  description:
    "Enter your KEAM rank and category to predict the best colleges and branches you can get into. Powered by historical cutoff data.",
  openGraph: {
    title: "CosmIQ KEAM Predictor",
    description: "Predict your KEAM college admissions with real cutoff data.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        {children}
        <Toaster
          theme="dark"
          position="top-right"
          toastOptions={{
            style: {
              background: "rgba(10,10,30,0.9)",
              border: "1px solid rgba(99,102,241,0.3)",
              color: "#e2e8f0",
            },
          }}
        />
      </body>
    </html>
  );
}
