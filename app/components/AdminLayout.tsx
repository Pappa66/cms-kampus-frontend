    // cms-kampus-frontend/app/components/AdminLayout.tsx
    'use client';

    import Link from 'next/link';
    import { usePathname, useRouter } from 'next/navigation';
    import React, { useState, useEffect } from 'react';

    interface AdminLayoutProps {
      children: React.ReactNode;
    }

    const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
      const pathname = usePathname();
      const router = useRouter();
      const [isSidebarOpen, setIsSidebarOpen] = useState(false);
      const [userRole, setUserRole] = useState<string | null>(null);

      useEffect(() => {
        const token = localStorage.getItem('token');
        const role = localStorage.getItem('userRole');

        if (!token) {
          router.push('/login');
        } else {
          setUserRole(role);
        }
      }, [router]);

      const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('userRole');
        localStorage.removeItem('userName');
        router.push('/login');
      };

      return (
        <div className="flex min-h-screen bg-gray-100">
          {/* Sidebar */}
          <aside
            className={`fixed inset-y-0 left-0 z-30 w-64 bg-gray-800 text-white transition-transform duration-300 transform ${
              isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
            } md:relative md:translate-x-0 md:flex md:flex-col`}
          >
            <div className="flex items-center justify-between p-4 border-b border-gray-700">
              <h2 className="text-xl font-bold">CMS Kampus Admin</h2>
              <button
                onClick={() => setIsSidebarOpen(false)}
                className="text-gray-400 md:hidden hover:text-white focus:outline-none"
                aria-label="Tutup Sidebar"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>
            <nav className="flex-1 px-4 py-6 space-y-2">
              {/* Menu Navigasi Utama */}
              <Link
                href="/admin/dashboard"
                className={`flex items-center px-4 py-2 rounded-md ${
                  pathname === '/admin/dashboard' ? 'bg-gray-700 font-semibold' : 'hover:bg-gray-700'
                }`}
              >
                Dashboard
              </Link>
              <Link
                href="/admin/repository"
                className={`flex items-center px-4 py-2 rounded-md ${
                  pathname === '/admin/repository' ? 'bg-gray-700 font-semibold' : 'hover:bg-gray-700'
                }`}
              >
                Repository
              </Link>
              <Link
                href="/admin/konten"
                className={`flex items-center px-4 py-2 rounded-md ${
                  pathname === '/admin/konten' ? 'bg-gray-700 font-semibold' : 'hover:bg-gray-700'
                }`}
              >
                Konten (Post)
              </Link>
              {/* Hapus link Manajemen Menu jika tidak jadi */}
              {/*
              <Link
                href="/admin/menu"
                className={`flex items-center px-4 py-2 rounded-md ${
                  pathname === '/admin/menu' ? 'bg-gray-700 font-semibold' : 'hover:bg-gray-700'
                }`}
              >
                Manajemen Menu
              </Link>
              */}

              {/* Link khusus untuk Superadmin */}
              {userRole === 'SUPERADMIN' && (
                <Link
                  href="/admin/users"
                  className={`flex items-center px-4 py-2 rounded-md ${
                    pathname === '/admin/users' ? 'bg-gray-700 font-semibold' : 'hover:bg-gray-700'
                  }`}
                >
                  Manajemen Akun
                </Link>
              )}
              {/* Link baru untuk Manajemen Link PMB */}
              {(userRole === 'SUPERADMIN' || userRole === 'ADMIN') && (
                <Link
                  href="/admin/settings" // Asumsi route baru untuk pengaturan
                  className={`flex items-center px-4 py-2 rounded-md ${
                    pathname === '/admin/settings' ? 'bg-gray-700 font-semibold' : 'hover:bg-gray-700'
                  }`}
                >
                  Pengaturan
                </Link>
              )}

              {/* Link Logout */}
              <button
                onClick={handleLogout}
                className="flex items-center px-4 py-2 rounded-md text-red-400 hover:bg-gray-700 w-full text-left"
              >
                Logout
              </button>
            </nav>
          </aside>

          {/* Main Content Area */}
          <div className="flex-1 flex flex-col">
            {/* Header untuk Mobile (tampilkan tombol toggle sidebar & logout) */}
            <header className="bg-white shadow-sm p-4 flex justify-between items-center md:hidden">
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="text-gray-500 focus:outline-none"
                aria-label="Buka Sidebar"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
                </svg>
              </button>
              <h1 className="text-xl font-bold">Admin Panel</h1>
              <button
                onClick={handleLogout}
                className="text-sm font-medium text-red-600 hover:text-red-800"
              >
                Logout
              </button>
            </header>

            <main className="flex-1 p-8 bg-gray-50">{children}</main>
          </div>
        </div>
      );
    };

    export default AdminLayout;
    