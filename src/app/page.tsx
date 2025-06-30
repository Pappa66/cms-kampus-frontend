import HeroSection from "@/components/home/HeroSection";

export default function HomePage() {
  return (
    // Kita menggunakan Fragment (<>) karena layout utama sudah ada di layout.tsx
    <>
      <HeroSection />
      {/* Di sini Anda bisa menambahkan seksi lain untuk halaman Home nanti */}
      {/* Contoh: <SeksiBeritaTerbaru /> */}
    </>
  );
}
