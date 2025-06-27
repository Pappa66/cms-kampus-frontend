    // cms-kampus-frontend/app/user/mahasiswa/repository/page.tsx
    'use client';

    import React, { useState, useEffect } from 'react';
    import UserLayout from '@/app/components/UserLayout';
    import FormInput from '@/app/components/FormInput';
    import Notification from '@/app/components/Notification';
    import { fetchAPI } from '@/app/lib/api';
    import { useRouter } from 'next/navigation';

    interface Repository {
      id: string;
      title: string;
      abstract: string;
      fileUrl: string;
      fileName?: string;
      fileSize?: number;
      fileType?: string;
      author: string;
      prodi?: string;
      isPublic: boolean;
      createdAt: string;
      userId: string;
      user: {
        name?: string | null;
        username?: string | null;
        email: string;
        role: string;
      };
    }

    interface NotificationState {
      message: string;
      type: 'success' | 'error' | 'info';
    }

    type RepositoryForm = Partial<Omit<Repository, 'id' | 'createdAt' | 'updatedAt' | 'userId' | 'user'>>;

    export default function MahasiswaRepositoryManagementPage() {
      const router = useRouter();
      const [repositories, setRepositories] = useState<Repository[]>([]);
      const [form, setForm] = useState<RepositoryForm>({
        title: '',
        abstract: '',
        prodi: '',
        isPublic: false, // Default tidak publik untuk Mahasiswa/Dosen, bisa diubah
      });
      const [notification, setNotification] = useState<NotificationState | null>(null);
      const [editingRepoId, setEditingRepoId] = useState<string | null>(null);
      const [loading, setLoading] = useState(true);
      const [file, setFile] = useState<File | null>(null);
      const [currentUserRole, setCurrentUserRole] = useState<string | null>(null);

      useEffect(() => {
        const token = localStorage.getItem('token');
        const role = localStorage.getItem('userRole');
        setCurrentUserRole(role);

        if (!token || role !== 'MAHASISWA') {
          router.push('/login');
          return;
        }
        fetchRepositories();
      }, [router]);

      const fetchRepositories = async () => {
        setLoading(true);
        try {
          const token = localStorage.getItem('token');
          if (!token) throw new Error('No token found.');

          // Ambil repositori hanya milik user yang sedang login
          const response = await fetchAPI(`/api/repositories?userId=${localStorage.getItem('userId')}`, 'GET', token);
          if (response.data) {
            setRepositories(response.data);
          }
        } catch (error: any) {
          console.error('Failed to fetch repositories:', error);
          setNotification({ message: error.message || 'Gagal mengambil data repositori Anda.', type: 'error' });
          if (error.message.includes('Unauthorized') || error.message.includes('Forbidden')) {
            router.push('/login');
          }
        } finally {
          setLoading(false);
        }
      };

      const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type, checked } = e.target as HTMLInputElement;
        setForm({
          ...form,
          [name]: type === 'checkbox' ? checked : value,
        });
      };

      const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
          setFile(e.target.files[0]);
        } else {
          setFile(null);
        }
      };

      const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
          const token = localStorage.getItem('token');
          if (!token) throw new Error('No token found.');

          const formData = new FormData();
          formData.append('title', form.title || '');
          formData.append('abstract', form.abstract || '');
          formData.append('prodi', form.prodi || '');
          formData.append('isPublic', String(form.isPublic));
          if (file) formData.append('file', file);

          let response;
          if (editingRepoId) {
            response = await fetchAPI(`/api/repositories/${editingRepoId}`, 'PUT', token, formData, true);
            setNotification({ message: response.message || 'Repositori berhasil diperbarui!', type: 'success' });
          } else {
            response = await fetchAPI('/api/repositories', 'POST', token, formData, true);
            setNotification({ message: response.message || 'Repositori berhasil diunggah!', type: 'success' });
          }
          resetForm();
          fetchRepositories();
        } catch (error: any) {
          console.error('Failed to save repository:', error);
          setNotification({ message: error.message || 'Gagal menyimpan repositori.', type: 'error' });
        }
      };

      const handleEdit = async (repo: Repository) => {
        setForm({
          title: repo.title,
          abstract: repo.abstract,
          prodi: repo.prodi || '',
          isPublic: repo.isPublic,
          fileUrl: repo.fileUrl,
        });
        setEditingRepoId(repo.id);
        setFile(null);
        setNotification(null);
      };

      const handleDelete = async (id: string) => {
        if (confirm('Apakah Anda yakin ingin menghapus repositori ini?')) {
          try {
            const token = localStorage.getItem('token');
            if (!token) throw new Error('No token found.');

            const response = await fetchAPI(`/api/repositories/${id}`, 'DELETE', token);
            setNotification({ message: response.message || 'Repositori berhasil dihapus!', type: 'success' });
            fetchRepositories();
          } catch (error: any) {
            console.error('Failed to delete repository:', error);
            setNotification({ message: error.message || 'Gagal menghapus repositori.', type: 'error' });
          }
        }
      };

      const handleDownload = async (id: string) => {
        try {
          const token = localStorage.getItem('token');
          if (!token) throw new Error('No token found.');

          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/repositories/download/${id}`, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || `Failed to download file: ${response.statusText}`);
          }

          const contentDisposition = response.headers.get('Content-Disposition');
          let fileName = 'downloaded-file';
          if (contentDisposition) {
            const matches = /filename="([^"]*)"/.exec(contentDisposition);
            if (matches && matches[1]) {
              fileName = decodeURIComponent(matches[1]);
            }
          }
          
          const blob = await response.blob();
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = fileName;
          document.body.appendChild(a);
          a.click();
          a.remove();
          window.URL.revokeObjectURL(url);
          setNotification({ message: 'File berhasil diunduh!', type: 'success' });

        } catch (error: any) {
          console.error('Failed to download repository:', error);
          setNotification({ message: error.message || 'Gagal mengunduh file.', type: 'error' });
        }
      };

      const resetForm = () => {
        setForm({
          title: '',
          abstract: '',
          prodi: '',
          isPublic: false,
          fileUrl: '',
        });
        setEditingRepoId(null);
        setFile(null);
        setNotification(null);
      };

      const closeNotification = () => setNotification(null);

      const prodiOptions = ['Ilmu Administrasi Negara', 'Ilmu Pemerintahan']; // Contoh prodi


      if (currentUserRole === null) {
        return (
          <UserLayout>
            <p className="text-center py-8">Memverifikasi akses...</p>
          </UserLayout>
        );
      }

      if (currentUserRole !== 'MAHASISWA') {
        return (
          <UserLayout>
            <p className="text-red-500 text-center py-8">Anda tidak memiliki akses ke halaman ini. Hanya Mahasiswa yang diizinkan.</p>
          </UserLayout>
        );
      }

      return (
        <UserLayout>
          <h1 className="text-2xl font-bold mb-6">Manajemen Repositori Mahasiswa</h1>

          {notification && (
            <Notification
              message={notification.message}
              type={notification.type}
              onClose={closeNotification}
            />
          )}

          {/* Form Unggah/Edit Repositori */}
          <div className="bg-white p-6 rounded-lg shadow-md mb-8">
            <h2 className="text-xl font-semibold mb-4">{editingRepoId ? 'Edit Repositori' : 'Unggah Repositori Baru'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <FormInput
                  label="Judul"
                  name="title"
                  type="text"
                  value={form.title || ''}
                  onChange={handleChange}
                  required
                />
                <div>
                  <label htmlFor="prodi" className="block text-sm font-medium text-gray-700">Program Studi</label>
                  <select
                    id="prodi"
                    name="prodi"
                    value={form.prodi || ''}
                    onChange={handleChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    required
                  >
                    <option value="">-- Pilih Program Studi --</option>
                    {prodiOptions.map(prodi => (
                      <option key={prodi} value={prodi}>{prodi}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="mb-4">
                <label htmlFor="abstract" className="block text-sm font-medium text-gray-700">Abstrak</label>
                <textarea
                  id="abstract"
                  name="abstract"
                  rows={5}
                  value={form.abstract || ''}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  required
                ></textarea>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label htmlFor="file" className="block text-sm font-medium text-gray-700">File Repositori (PDF, DOCX, dll.)</label>
                  <input
                    type="file"
                    id="file"
                    name="file"
                    onChange={handleFileChange}
                    className="mt-1 block w-full text-sm text-gray-900 border border-gray-300 rounded-md cursor-pointer bg-gray-50 focus:outline-none"
                    required={!editingRepoId}
                  />
                  {editingRepoId && form.fileUrl && !file && (
                    <p className="text-sm text-gray-500 mt-1">File saat ini: <a href={`${process.env.NEXT_PUBLIC_API_URL}${form.fileUrl}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">Lihat</a> (Biarkan kosong untuk mempertahankan file lama)</p>
                  )}
                </div>
                <div className="flex items-center mt-6">
                  <input
                    id="isPublic"
                    name="isPublic"
                    type="checkbox"
                    checked={form.isPublic || false}
                    onChange={handleChange}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <label htmlFor="isPublic" className="ml-2 block text-sm text-gray-900">Publikasikan ke Umum</label>
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="submit"
                  className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  {editingRepoId ? 'Perbarui Repositori' : 'Unggah Repositori'}
                </button>
                {editingRepoId && (
                  <button
                    type="button"
                    onClick={resetForm}
                    className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Batal Edit
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* Daftar Repositori Milik Pengguna */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Repositori Anda</h2>
            {loading ? (
              <p>Memuat repositori Anda...</p>
            ) : repositories.length === 0 ? (
              <p>Anda belum mengunggah repositori apapun.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Judul</th>
                      <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Prodi</th>
                      <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status Publik</th>
                      <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {repositories.map((repo) => (
                      <tr key={repo.id} className="bg-white border-b hover:bg-gray-50">
                        <td className="py-3 px-4 whitespace-nowrap">{repo.title}</td>
                        <td className="py-3 px-4 whitespace-nowrap">{repo.prodi || '-'}</td>
                        <td className="py-3 px-4">{repo.isPublic ? 'Ya' : 'Tidak'}</td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => handleDownload(repo.id)}
                            className="font-medium text-green-600 hover:underline mr-3"
                          >
                            Unduh
                          </button>
                          <button
                            onClick={() => handleEdit(repo)}
                            className="font-medium text-blue-600 hover:underline mr-3"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(repo.id)}
                            className="font-medium text-red-600 hover:underline"
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
        </UserLayout>
      );
    }
    