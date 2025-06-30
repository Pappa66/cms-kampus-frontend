'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';
import { FileText, Check, X } from 'lucide-react';

export default function AdvisingPage() {
  const { token } = useAuthStore();
  const router = useRouter();
  const [items, setItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAdvisedItems = useCallback(async () => {
    if (!token) return;
    setIsLoading(true);
    try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/advisor/items`, { headers: { Authorization: `Bearer ${token}` } });
        if (!res.ok) throw new Error('Gagal memuat data bimbingan.');
        const data = await res.json();
        setItems(data);
    } catch(err) { console.error(err); } 
    finally { setIsLoading(false); }
  }, [token]);

  useEffect(() => {
    if (!token) router.replace('/login');
    else fetchAdvisedItems();
  }, [token, router, fetchAdvisedItems]);

  const handleApprove = async (itemId: string) => {
    if (!window.confirm('Anda yakin ingin menyetujui dan mempublikasikan karya ilmiah ini?')) return;
    try {
        await fetch(`${process.env.NEXT_PUBLIC_API_URL}/advisor/items/${itemId}/approve`, {
            method: 'PUT',
            headers: { Authorization: `Bearer ${token}` }
        });
        alert('Karya ilmiah berhasil dipublikasikan.');
        fetchAdvisedItems(); // Muat ulang daftar
    } catch (err) {
        alert('Gagal menyetujui.');
    }
  };

  if (isLoading) return <div className="container py-12 text-center">Memuat data mahasiswa bimbingan...</div>;

  return (
    <div className="container py-8">
      <h1 className="text-2xl font-bold mb-6">Review Karya Ilmiah Bimbingan</h1>
      <div className="space-y-4">
        {items.length > 0 ? items.map((item) => (
          <div key={item.id} className="p-4 bg-white rounded-lg shadow-sm border flex justify-between items-center">
            <div>
              <h3 className="font-bold text-lg">{item.title}</h3>
              <p className="text-sm text-gray-600">{item.author} • {item.year}</p>
                <a href={`${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '')}${item.fileUrl}`} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline mt-1 inline-block">
                Lihat File
                </a>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => handleApprove(item.id)} className="flex items-center gap-1.5 bg-green-100 text-green-700 px-3 py-1.5 rounded-md hover:bg-green-200 text-sm font-semibold">
                <Check size={16}/> Setujui
              </button>
              {/* Anda bisa menambahkan tombol "Tolak" di sini nanti */}
            </div>
          </div>
        )) : (
          <div className="text-center p-16 bg-white rounded-lg border-dashed border-2">
            <FileText className="mx-auto h-12 w-12 text-gray-400"/>
            <h3 className="mt-4 text-lg font-semibold">Tidak Ada Karya Ilmiah untuk Direview</h3>
            <p className="mt-1 text-gray-500">Saat ini tidak ada mahasiswa bimbingan Anda yang mengunggah karya ilmiah baru.</p>
          </div>
        )}
      </div>
    </div>
  );
}
