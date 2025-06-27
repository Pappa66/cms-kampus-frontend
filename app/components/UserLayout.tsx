// cms-kampus-frontend/app/components/UserLayout.tsx
'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import React, { useState, useEffect } from 'react';

interface UserLayoutProps {
  children: React.ReactNode;
}

const UserLayout: React.FC<UserLayoutProps> = ({ children }) => {
  const pathname = usePathname();
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('userRole');
    const name = localStorage.getItem('userName');

    if (!token || (role !== 'MAHASISWA' && role !== 'DOSEN')) {
      // Hanya Mahasiswa dan Dosen yang boleh mengakses layout ini
      router.push('/login'); // REDIRECT KE /login jika tidak ada token atau role tidak sesuai
      return;
    }
    setUserRole(role);
    setUserName(name);
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userName');
    router.push('/login'); // REDIRECT KE /login setelah logout
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-30 w-64 bg-blue-800 text-white transition-transform duration-300 transform ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } md:relative md:translate-x-0 md:flex md:flex-col`}
      >
        <div className="flex items-center justify-between p-4 border-b border-blue-700">
          <h2 className="text-xl font-bold">Dashboard {userRole}</h2>
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="text-blue-300 md:hidden hover:text-white focus:outline-none"
            aria-label="Tutup Sidebar"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
        <nav className="flex-1 px-4 py-6 space-y-2">
          {userName && <div className="text-gray-200 text-sm mb-4 px-2">Halo, {userName}!</div>}
          <Link
            href={`/user/${userRole?.toLowerCase()}/dashboard`} // Link ke dashboard spesifik role
            className={`flex items-center px-4 py-2 rounded-md ${
              pathname === `/user/${userRole?.toLowerCase()}/dashboard` ? 'bg-blue-700 font-semibold' : 'hover:bg-blue-700'
            }`}
          >
            Dashboard
          </Link>
          <Link
            href={`/user/${userRole?.toLowerCase()}/repository`} // Link ke manajemen repositori user
            className={`flex items-center px-4 py-2 rounded-md ${
              pathname === `/user/${userRole?.toLowerCase()}/repository` ? 'bg-blue-700 font-semibold' : 'hover:bg-blue-700'
            }`}
          >
            Manajemen Repositori
          </Link>
          {/* Link Logout */}
          <button
            onClick={handleLogout}
            className="flex items-center px-4 py-2 rounded-md text-red-300 hover:bg-blue-700 w-full text-left"
          >
            Logout
          </button>
        </nav>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Header untuk Mobile (tampilkan tombol toggle sidebar & logout) */}
        <header className="bg-white shadow-sm p-4 flex justify-between items-center md:hidden">
          {/* Tombol buka sidebar */}
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="text-gray-500 focus:outline-none"
            aria-label="Buka Sidebar"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
            </svg>
          </button>
          <h1 className="text-xl font-bold">Dashboard {userRole}</h1>
          {/* Tombol logout di header mobile */}
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

export default UserLayout;
