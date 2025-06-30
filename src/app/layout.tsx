import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ProgressBar from "@/components/ui/ProgressBar";

const poppins = Poppins({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-poppins",
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "STISIP Syamsul Ulum - Sistem Informasi Kampus",
  description: "Portal resmi STISIP Syamsul Ulum.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className="light" suppressHydrationWarning>
      {/* Dengan menambahkan className="light", kita memberi tahu globals.css 
        untuk menggunakan variabel warna terang secara default.
      */}
      <body className="flex min-h-screen flex-col font-sans">
        <ProgressBar />
        <Header />
        <main className="flex-grow">{children}</main>
        <Footer />
      </body>
    </html>
  );
}