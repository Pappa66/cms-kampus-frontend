'use client';

import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { jwtDecode } from 'jwt-decode';
import Link from 'next/link';
import { Users, BookCopy, Menu, Newspaper } from 'lucide-react';

interface DecodedToken {
    userId: string;
    role: 'ADMIN' | 'MAHASISWA' | 'DOSEN';
    exp: number;
}

export default function DashboardPage() {
    const { token } = useAuthStore();
    const router = useRouter();
    const [userName, setUserName] = useState('');

    useEffect(() => {
        if (!token) {
            router.replace('/login');
        } else {
          try {
            const decoded: DecodedToken = jwtDecode(token);
            // Anda bisa menambahkan 'name' dari user ke payload JWT di backend jika mau
            setUserName(decoded.role); // Untuk sekarang kita tampilkan role
          } catch(e) {
            console.error("Token tidak valid:", e);
            router.replace('/login');
          }
        }
    }, [token, router]);

    if (!token) {
        return <p className="text-center py-12">Mengarahkan...</p>;
    }

    return (
        <div className="container py-12">
            <h1 className="text-4xl font-bold">Selamat Datang, {userName}!</h1>
            <p className="mt-4 text-lg text-gray-600">Anda berhasil login ke dashboard admin. Pilih menu di bawah untuk mulai mengelola.</p>

            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Link href="/dashboard/users" className="flex flex-col items-center justify-center p-6 bg-white rounded-lg border shadow-sm hover:shadow-md transition-shadow">
                    <Users className="h-12 w-12 text-blue-600 mb-4" />
                    <h2 className="text-xl font-semibold">Kelola Pengguna</h2>
                    <p className="text-sm text-gray-500 mt-1 text-center">Tambah, edit, dan hapus akun.</p>
                </Link>
                <Link href="/dashboard/repository" className="flex flex-col items-center justify-center p-6 bg-white rounded-lg border shadow-sm hover:shadow-md transition-shadow">
                    <BookCopy className="h-12 w-12 text-green-600 mb-4" />
                    <h2 className="text-xl font-semibold">Kelola Repository</h2>
                    <p className="text-sm text-gray-500 mt-1 text-center">Kelola karya ilmiah mahasiswa.</p>
                </Link>
                <Link href="/dashboard/posts" className="flex flex-col items-center justify-center p-6 bg-white rounded-lg border shadow-sm hover:shadow-md transition-shadow">
                    <Newspaper className="h-12 w-12 text-orange-600 mb-4" />
                    <h2 className="text-xl font-semibold">Kelola Konten</h2>
                    <p className="text-sm text-gray-500 mt-1 text-center">Buat berita dan halaman info.</p>
                </Link>
                <Link href="/dashboard/menu" className="flex flex-col items-center justify-center p-6 bg-white rounded-lg border shadow-sm hover:shadow-md transition-shadow">
                    <Menu className="h-12 w-12 text-purple-600 mb-4" />
                    <h2 className="text-xl font-semibold">Kelola Menu</h2>
                    <p className="text-sm text-gray-500 mt-1 text-center">Atur navigasi utama website.</p>
                </Link>
            </div>
        </div>
    );
}
