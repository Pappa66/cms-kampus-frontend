'use client';
import Link from 'next/link';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-800 text-white p-4">
        <h2 className="text-lg font-bold mb-6">CMS Kampus</h2>
        <nav className="space-y-4">
          <Link href="/admin/dashboard" className="block hover:text-indigo-300">Dashboard</Link>
          <Link href="/admin/repository" className="block hover:text-indigo-300">Repository</Link>
          <Link href="/admin/berita" className="block hover:text-indigo-300">Berita</Link>
        </nav>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-8 bg-gray-50">{children}</main>
    </div>
  );
}
