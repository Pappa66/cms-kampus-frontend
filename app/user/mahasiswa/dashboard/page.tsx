    // cms-kampus-frontend/app/user/mahasiswa/dashboard/page.tsx
    'use client';

    import React, { useEffect, useState } from 'react'; // <--- Perbaikan di sini, tidak ada {} di useState
    import UserLayout from '@/app/components/UserLayout';
    import { useRouter } from 'next/navigation';

    export default function MahasiswaDashboardPage() {
      const router = useRouter();
      const [userName, setUserName] = useState<string | null>(null);
      const [userEmail, setUserEmail] = useState<string | null>(null);
      const [userRole, setUserRole] = useState<string | null>(null);
      const [loading, setLoading] = useState(true);

      useEffect(() => {
        const token = localStorage.getItem('token');
        const role = localStorage.getItem('userRole');
        const name = localStorage.getItem('userName');
        const email = localStorage.getItem('userEmail');

        if (!token || role !== 'MAHASISWA') {
          router.push('/login');
          return;
        }

        setUserName(name);
        setUserEmail(email);
        setUserRole(role);
        setLoading(false);
      }, [router]);

      if (loading) {
        return (
          <UserLayout>
            <p className="text-center py-8">Memuat dashboard mahasiswa...</p>
          </UserLayout>
        );
      }

      return (
        <UserLayout>
          <div className="bg-white p-8 rounded-lg shadow-md">
            <h1 className="text-2xl font-bold mb-4">Dashboard Mahasiswa</h1>
            <p className="text-gray-700 mb-2">Selamat datang, <span className="font-semibold">{userName || userEmail}</span>!</p>
            <p className="text-gray-600">Peran Anda: <span className="font-semibold">{userRole}</span></p>
            <p className="mt-4 text-gray-800">
              Di sini Anda dapat mengelola kiriman jurnal dan skripsi Anda. Silakan navigasi ke "Manajemen Repositori" di *sidebar*.
            </p>
          </div>
        </UserLayout>
      );
    }
    