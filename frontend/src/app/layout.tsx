import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import DashboardLayout from '@/components/DashboardLayout';
import { Toaster } from 'react-hot-toast';

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning={true}>
      <body className={`${inter.className} bg-slate-900 text-white`} suppressHydrationWarning={true}>
        <Toaster position="top-center" />
        <DashboardLayout>
          {children}
        </DashboardLayout>
      </body>
    </html>
  );
}