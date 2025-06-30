'use client';

import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { jwtDecode } from 'jwt-decode';
import Link from 'next/link';
import { Users, BookCopy, Menu, Newspaper, Upload, Briefcase } from 'lucide-react';

interface DecodedToken {
    userId: string;
    role: 'ADMIN' | 'MAHASISWA' | 'DOSEN';
    name: string; // Pastikan 'name' ada di tipe ini
    exp: number;
}

export default function DashboardPage() {
    const { token } = useAuthStore();
    const router = useRouter();
    const [userRole, setUserRole] = useState<string | null>(null);
    const [userName, setUserName] = useState('');

    useEffect(() => {
        if (!token) {
            router.replace('/login');
        } else {
          try {
            const decoded: DecodedToken = jwtDecode(token);
            setUserRole(decoded.role);
            setUserName(decoded.name);
          } catch(e) {
            router.replace('/login');
          }
        }
    }, [token, router]);

    if (!userRole) {
        return <p className="text-center py-12">Memuat dashboard...</p>;
    }

    return (
        <div className="container py-12">
            <h1 className="text-4xl font-bold">Selamat Datang, {userName}!</h1>
            <p className="mt-4 text-lg text-gray-600">Anda login sebagai: {userRole}</p>

            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Tampilan untuk ADMIN */}
                {userRole === 'ADMIN' && (
                    <>
                        <Link href="/dashboard/users" className="..."><Users/>Kelola Pengguna...</Link>
                        <Link href="/dashboard/repository" className="..."><BookCopy/>Kelola Repository...</Link>
                        <Link href="/dashboard/posts" className="..."><Newspaper/>Kelola Konten...</Link>
                        <Link href="/dashboard/menu" className="..."><Menu/>Kelola Menu...</Link>
                    </>
                )}
                {/* Tampilan untuk MAHASISWA */}
                {userRole === 'MAHASISWA' && (
                    <Link href="/dashboard/my-repository" className="..."><Upload/>Repository Saya...</Link>
                )}
                {/* Tampilan untuk DOSEN */}
                {userRole === 'DOSEN' && (
                    <Link href="/dashboard/advising" className="flex flex-col items-center justify-center p-6 bg-white rounded-lg border shadow-sm hover:shadow-md transition-shadow">
                        <Briefcase className="h-12 w-12 text-indigo-600 mb-4" />
                        <h2 className="text-xl font-semibold">Bimbingan Saya</h2>
                        <p className="text-sm text-gray-500 mt-1 text-center">Review & setujui karya ilmiah.</p>
                    </Link>
                )}
            </div>
        </div>
    );
}
