'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import Spinner from '@/components/ui/Spinner'; // <-- Impor Spinner

export default function LoginPage() {
  const router = useRouter();
  const { setToken } = useAuthStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false); // <-- State baru untuk loading

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true); // Mulai loading
    setMessage(''); // Bersihkan pesan lama

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok && data.token) {
        setToken(data.token);
        setMessage('Login berhasil! Mengarahkan ke dashboard...');
        router.push('/dashboard');
      } else {
        setMessage(data.message || 'Login gagal.');
      }
    } catch (error) {
      setMessage('Terjadi kesalahan pada jaringan.');
    } finally {
      setIsLoading(false); // Selesaikan loading, apapun hasilnya
    }
  };

  return (
    <div className="container flex min-h-[60vh] items-center justify-center py-12">
      <div className="w-full max-w-md rounded-lg border bg-white p-8 shadow-md">
        <h1 className="text-center text-2xl font-bold">Login ke Akun Anda</h1>
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
            <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="mt-1 w-full rounded-md border p-2"/>
          </div>
          <div>
            <label htmlFor="password"  className="block text-sm font-medium text-gray-700">Password</label>
            <input type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="mt-1 w-full rounded-md border p-2"/>
          </div>
          <button 
            type="submit" 
            disabled={isLoading} // <-- Nonaktifkan tombol saat loading
            className="flex w-full items-center justify-center rounded-md bg-brand-blue py-2 text-white transition-colors hover:bg-brand-blue/90 disabled:cursor-not-allowed disabled:bg-brand-blue/50"
          >
            {isLoading ? <Spinner /> : 'Login'} {/* <-- Tampilkan spinner atau teks */}
          </button>
        </form>
        {message && <p className="mt-4 text-center text-sm text-red-600">{message}</p>}
      </div>
    </div>
  );
}
