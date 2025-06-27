// cms-kampus-frontend/app/admin/settings/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import AdminLayout from '@/app/components/AdminLayout'; // Menggunakan layout admin
import FormInput from '@/app/components/FormInput'; // Komponen input form kustom
import Notification from '@/app/components/Notification'; // Komponen notifikasi
import { fetchAPI } from '@/app/lib/api'; // Fungsi helper untuk fetch API
import { useRouter } from 'next/navigation'; // Untuk navigasi

// Definisi interface untuk objek Setting yang diterima dari API
interface Setting {
  id: string;
  key: string;
  value: string;
  createdAt: string;
  updatedAt: string;
}

// Definisi interface untuk state notifikasi
interface NotificationState {
  message: string;
  type: 'success' | 'error' | 'info';
}

// Komponen halaman pengaturan admin
export default function AdminSettingsPage() {
  const router = useRouter(); // Inisialisasi router
  const [pmbLink, setPmbLink] = useState(''); // State untuk menyimpan nilai link PMB
  const [notification, setNotification] = useState<NotificationState | null>(null); // State untuk notifikasi
  const [loading, setLoading] = useState(true); // State loading untuk fetch data
  const [currentUserRole, setCurrentUserRole] = useState<string | null>(null); // State untuk peran user yang sedang login

  // useEffect untuk otentikasi dan fetch data saat komponen dimuat
  useEffect(() => {
    const token = localStorage.getItem('token'); // Ambil token dari localStorage
    const role = localStorage.getItem('userRole'); // Ambil peran user dari localStorage
    setCurrentUserRole(role); // Set peran user

    // Redirect ke halaman login jika tidak ada token atau peran tidak sesuai (bukan SUPERADMIN/ADMIN)
    if (!token || (role !== 'SUPERADMIN' && role !== 'ADMIN')) {
      router.push('/login');
      return;
    }
    fetchPmbLink(); // Panggil fungsi untuk mengambil link PMB
  }, [router]); // Tambahkan router ke dependency array

  // Fungsi untuk mengambil link PMB dari backend
  const fetchPmbLink = async () => {
    setLoading(true); // Set loading true saat memulai fetch
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No token found.'); // Pastikan ada token

      // Panggil API untuk mendapatkan setting dengan key 'pmb_url'
      const response = await fetchAPI('/api/admin/settings/pmb_url', 'GET', token);
      if (response.data && response.data.value) {
        setPmbLink(response.data.value); // Set nilai link PMB jika ditemukan
      } else {
        setPmbLink(''); // Set kosong jika tidak ada data atau value kosong
      }
    } catch (error: any) {
      console.error('Failed to fetch PMB link:', error);
      setNotification({ message: error.message || 'Gagal mengambil link PMB.', type: 'error' });
      // Redirect ke login jika terjadi error otentikasi
      if (error.message.includes('Unauthorized') || error.message.includes('Forbidden')) {
        router.push('/login');
      }
    } finally {
      setLoading(false); // Set loading false setelah fetch selesai
    }
  };

  // Fungsi untuk menangani submit form (menyimpan/memperbarui link PMB)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // Mencegah reload halaman default
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No token found.');

      // Panggil API untuk memperbarui atau membuat setting 'pmb_url'
      const response = await fetchAPI('/api/admin/settings/pmb_url', 'PUT', token, { value: pmbLink });
      setNotification({ message: response.message || 'Link PMB berhasil diperbarui!', type: 'success' }); // Tampilkan notifikasi sukses
    } catch (error: any) {
      console.error('Failed to update PMB link:', error);
      setNotification({ message: error.message || 'Gagal memperbarui link PMB.', type: 'error' }); // Tampilkan notifikasi error
    }
  };

  // Fungsi untuk menutup notifikasi
  const closeNotification = () => setNotification(null);

  // Tampilkan pesan loading saat memverifikasi akses awal
  if (currentUserRole === null) {
    return (
      <AdminLayout>
        <p className="text-center py-8">Memverifikasi akses...</p>
      </AdminLayout>
    );
  }

  // Tampilkan pesan akses ditolak jika peran tidak sesuai
  if (currentUserRole !== 'SUPERADMIN' && currentUserRole !== 'ADMIN') {
    return (
      <AdminLayout>
        <p className="text-red-500 text-center py-8">Anda tidak memiliki akses ke halaman ini. Hanya Admin atau Superadmin yang diizinkan.</p>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <h1 className="text-2xl font-bold mb-6">Pengaturan Umum</h1>

      {/* Tampilkan notifikasi jika ada */}
      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={closeNotification}
        />
      )}

      {/* Bagian form untuk mengatur link PMB */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-xl font-semibold mb-4">Link Penerimaan Mahasiswa Baru (PMB)</h2>
        {loading ? (
          <p>Memuat link PMB...</p>
        ) : (
          <form onSubmit={handleSubmit}>
            <FormInput
              label="URL Link PMB"
              name="pmbLink"
              type="url" // Tipe input URL
              value={pmbLink}
              onChange={(e) => setPmbLink(e.target.value)} // Update state saat input berubah
              placeholder="Contoh: https://pmb.universitas-anda.ac.id"
              required // Input wajib diisi
            />
            <div className="flex justify-end mt-6">
              <button
                type="submit"
                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Simpan Pengaturan
              </button>
            </div>
          </form>
        )}
      </div>
    </AdminLayout>
  );
}
