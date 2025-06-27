// cms-kampus-frontend/app/login/page.tsx

'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface ApiResponse {
  message: string;
  token?: string;
  user?: {
    id: string;
    email: string;
    role: 'SUPERADMIN' | 'ADMIN' | 'DOSEN' | 'MAHASISWA';
    name?: string | null;
    username?: string | null;
  };
}

const fetchAPI = async (
  endpoint: string,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE',
  body?: any
): Promise<ApiResponse> => {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  const config: RequestInit = {
    method: method,
    headers: headers,
  };

  if (body) {
    config.body = JSON.stringify(body);
  }

  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${endpoint}`, config);

  const data = await response.json(); // Selalu coba parse JSON

  if (!response.ok) {
    throw new Error(data.message || `API Error: ${response.statusText}`);
  }

  return data;
};


export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Panggil API login
      const response = await fetchAPI('/api/auth/login', 'POST', { email, password });

      if (response.token && response.user) {
        // Simpan token dan role pengguna di localStorage
        localStorage.setItem('token', response.token);
        localStorage.setItem('userRole', response.user.role);
        localStorage.setItem('userName', response.user.name || response.user.username || 'User'); // Simpan nama untuk display
        localStorage.setItem('userEmail', response.user.email); // Simpan email juga

        // Redirect berdasarkan peran (role)
        switch (response.user.role) {
          case 'SUPERADMIN':
          case 'ADMIN':
            router.push('/admin/dashboard');
            break;
          case 'MAHASISWA':
            router.push('/user/mahasiswa/dashboard'); // Akan dibuat di langkah selanjutnya
            break;
          case 'DOSEN':
            router.push('/user/dosen/dashboard'); // Akan dibuat di langkah selanjutnya
            break;
          default:
            // Default redirect jika peran tidak dikenal
            router.push('/');
            break;
        }
      } else {
        setError(response.message || 'Login gagal: Respon tidak valid.');
      }
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.message || 'Terjadi kesalahan saat login.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold text-center mb-6">Login</h2>
        {error && <p className="text-red-500 text-sm mb-4 text-center">{error}</p>}
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div className="mb-6">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
          >
            {loading ? 'Memuat...' : 'Login'}
          </button>
        </form>
        <p className="text-center text-sm text-gray-600 mt-4">
          <Link href="/" className="text-indigo-600 hover:underline">Kembali ke Beranda</Link>
        </p>
      </div>
    </div>
  );
}
