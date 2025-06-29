// cms-kampus-frontend/app/admin/repository/page.tsx

'use client';

import React, { useState, useEffect } from 'react';
import AdminLayout from '@/app/components/AdminLayout';
import Notification from '@/app/components/Notification';
import { fetchAPI } from '@/app/lib/api';
import { useRouter } from 'next/navigation';

interface Repository {
  id: string;
  title: string;
  abstract: string;
  author: string;
  prodi?: string;
  isPublic: boolean;
  fileUrl?: string; // Hanya ada jika diizinkan
  fileName?: string;
  fileSize?: number;
  fileType?: string;
  createdAt: string;
  user?: {
    id: string;
    name: string | null;
    username: string;
    email: string;
    role: string;
  };
}

interface NotificationState {
  message: string;
  type: 'success' | 'error' | 'info';
}

export default function AdminRepositoryPage() {
  const [repositories, setRepositories] = useState<Repository[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [notification, setNotification] = useState<NotificationState | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [currentRepository, setCurrentRepository] = useState<Repository | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetchRepositories();
  }, []);

  const fetchRepositories = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login-admin');
        return;
      }
      const response = await fetchAPI('/api/repositories', 'GET', token);
      if (response.data) {
        setRepositories(response.data);
      }
    } catch (error: any) {
      console.error('Failed to fetch repositories:', error);
      setNotification({ message: error.message || 'Gagal fetch repositories.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus repositori ini?')) {
      return;
    }
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login-admin');
        return;
      }
      const response = await fetchAPI(`/api/repositories/${id}`, 'DELETE', token);
      setNotification({ message: response.message || 'Repositori berhasil dihapus.', type: 'success' });
      fetchRepositories(); // Refresh daftar
    } catch (error: any) {
      console.error('Failed to delete repository:', error);
      setNotification({ message: error.message || 'Gagal menghapus repositori.', type: 'error' });
    }
  };

  const handleEdit = (repository: Repository) => {
    setCurrentRepository(repository);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentRepository(null);
  };

  const handleSaveModal = (savedRepository: Repository) => {
    handleCloseModal();
    fetchRepositories(); // Refresh daftar setelah simpan
    setNotification({ message: 'Repositori berhasil disimpan!', type: 'success' });
  };

  const closeNotification = () => setNotification(null);

  if (loading) {
    return (
      <AdminLayout>
        <p className="text-center text-gray-600">Memuat data repositori...</p>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <h1 className="text-2xl font-bold mb-6">Manajemen Repositori</h1>

      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={closeNotification}
        />
      )}

      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Daftar Repositori</h2>
          <button
            onClick={() => handleEdit(null)} // Trigger modal untuk tambah baru
            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Tambah Repositori Baru
          </button>
        </div>

        {repositories.length === 0 ? (
          <p className="text-gray-600 text-center py-4">Tidak ada repositori ditemukan.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Judul
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Author
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Prodi
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Publik
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tanggal Upload
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {repositories.map((repo) => (
                  <tr key={repo.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {repo.title}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {repo.author}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {repo.prodi || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {repo.isPublic ? (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          Ya
                        </span>
                      ) : (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                          Tidak
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {new Date(repo.createdAt).toLocaleDateString('id-ID')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleEdit(repo)}
                        className="text-indigo-600 hover:text-indigo-900 mr-4"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(repo.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Hapus
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {isModalOpen && (
        <RepositoryFormModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onSave={handleSaveModal}
          repository={currentRepository}
        />
      )}
    </AdminLayout>
  );
}
