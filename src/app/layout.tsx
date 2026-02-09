import type { Metadata } from "next";
import { PublicLayout } from "@/components/layout/public-layout";
import { ToastProvider } from "@/providers/toast-provider";
import "./globals.css";

export const metadata: Metadata = {
  title: "Lesya | Kadın Giyim",
  description: "Modern kadının zamansız gardırobu.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" className="h-full">
      <body className="antialiased flex min-h-full flex-col bg-neutral-50 text-neutral-900">
        <ToastProvider>
          <PublicLayout>
            {children}
          </PublicLayout>
        </ToastProvider>
      </body>
    </html>
  );
}
