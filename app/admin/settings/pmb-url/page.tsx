// cms-kampus-frontend/app/admin/settings/pmb-url/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import AdminLayout from '@/app/components/AdminLayout';
import FormInput from '@/app/components/FormInput';
import Notification from '@/app/components/Notification';
import { fetchAPI } from '@/app/lib/api';
import { useRouter } from 'next/navigation';

interface NotificationState {
  message: string;
  type: 'success' | 'error' | 'info';
}

export default function PmbUrlSettingsPage() {
  const router = useRouter();
  const [pmbUrl, setPmbUrl] = useState<string>('');
  const [notification, setNotification] = useState<NotificationState | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    fetchPmbUrl();
  }, []);

  const fetchPmbUrl = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login-admin');
        return;
      }
      // Mengambil pengaturan 'PMB_URL' dari backend
      const response = await fetchAPI('/api/admin/settings/PMB_URL', 'GET', token);
      if (response.data && response.data.value) {
        setPmbUrl(response.data.value);
      } else {
        // Jika tidak ditemukan, set default atau biarkan kosong
        setPmbUrl(''); 
      }
    } catch (error: any) {
      console.error('Failed to fetch PMB URL:', error);
      setNotification({ message: error.message || 'Gagal mengambil URL PMB.', type: 'error' });
      setPmbUrl(''); // Pastikan kosong jika ada error
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => { // <--- PERBAIKAN DI SINI
    setPmbUrl(e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login-admin');
        return;
      }

      // Memperbarui pengaturan 'PMB_URL' di backend
      const response = await fetchAPI(
        '/api/admin/settings/PMB_URL',
        'PUT',
        token,
        { value: pmbUrl } // Mengirim nilai yang akan disimpan
      );
      setNotification({ message: response.message || 'URL PMB berhasil diperbarui!', type: 'success' });
    } catch (error: any) {
      console.error('Failed to update PMB URL:', error);
      setNotification({ message: error.message || 'Gagal memperbarui URL PMB.', type: 'error' });
    }
  };

  const closeNotification = () => setNotification(null);

  if (loading) {
    return (
      <AdminLayout>
        <p>Memuat pengaturan URL PMB...</p>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <h1 className="text-2xl font-bold mb-6">Pengaturan URL PMB</h1>

      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={closeNotification}
        />
      )}

      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-xl font-semibold mb-4">URL Pendaftaran Mahasiswa Baru</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <FormInput
              label="URL PMB"
              name="pmbUrl"
              type="url" // Tipe URL agar browser membantu validasi format
              value={pmbUrl}
              onChange={handleChange}
              placeholder="Contoh: https://pmb.universitas.ac.id"
              required
            />
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Simpan Perubahan
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}
