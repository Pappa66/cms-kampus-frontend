import "./globals.css";
import Navbar from "./components/Navbar";

export const metadata = {
  title: "CMS Kampus",
  description: "Sistem Informasi Kampus",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body>
        <Navbar />
        <main className="container mx-auto px-4 py-8">{children}</main>
      </body>
    </html>
  );
}
