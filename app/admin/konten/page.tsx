// cms-kampus-frontend/app/admin/konten/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import AdminLayout from '@/app/components/AdminLayout';
import FormInput from '@/app/components/FormInput'; // Menggunakan FormInput yang baru
import Notification from '@/app/components/Notification';
import { fetchAPI } from '@/app/lib/api'; // Asumsi fetchAPI ada di sini
import { useRouter } from 'next/navigation';

interface Post {
  id: number;
  title: string;
  slug: string;
  type: 'berita' | 'pengumuman' | 'profil';
  content: string;
  fileUrl?: string | null;
  imageUrl?: string | null;
  published: boolean;
  authorId: string;
  createdAt: string;
  updatedAt: string;
}

interface NotificationState {
  message: string;
  type: 'success' | 'error' | 'info';
}

type PostForm = Partial<Omit<Post, 'id' | 'authorId' | 'createdAt' | 'updatedAt'>>;

export default function ContentManagementPage() {
  const router = useRouter();
  const [posts, setPosts] = useState<Post[]>([]);
  const [form, setForm] = useState<PostForm>({
    title: '',
    slug: '',
    type: 'berita', // Default
    content: '',
    published: false,
    fileUrl: '', // Untuk preview/edit
    imageUrl: '', // Untuk preview/edit
  });
  const [notification, setNotification] = useState<NotificationState | null>(null);
  const [editingPostId, setEditingPostId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [file, setFile] = useState<File | null>(null); // Untuk file upload
  const [image, setImage] = useState<File | null>(null); // Untuk image upload

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userRole = localStorage.getItem('userRole');

    if (!token || (userRole !== 'SUPERADMIN' && userRole !== 'ADMIN')) {
      router.push('/login'); // Redirect ke /login
      return;
    }
    fetchPosts();
  }, [router]);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No token found.');

      const response = await fetchAPI('/api/posts', 'GET', token); // Mengambil semua jenis post
      if (response.data) {
        setPosts(response.data);
      }
    } catch (error: any) {
      console.error('Failed to fetch posts:', error);
      setNotification({ message: error.message || 'Gagal mengambil data konten.', type: 'error' });
      // Redirect to login if unauthorized or forbidden
      if (error.message.includes('Unauthorized') || error.message.includes('Forbidden')) {
        router.push('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type, checked } = e.target as HTMLInputElement;

    // Handle slug generation if title changes and not in edit mode (or slug is empty)
    if (name === 'title' && !editingPostId && !form.slug) {
        setForm(prevForm => ({
            ...prevForm,
            title: value,
            slug: value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-*|-*$/g, ''),
        }));
    } else {
        setForm({
            ...form,
            [name]: type === 'checkbox' ? checked : value,
        });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    } else {
      setFile(null);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImage(e.target.files[0]);
    } else {
      setImage(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No token found.');

      const formData = new FormData();
      formData.append('title', form.title || '');
      formData.append('slug', form.slug || form.title?.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-*|-*$/g, '') || ''); // Fallback slug
      formData.append('type', form.type || 'berita');
      formData.append('content', form.content || '');
      formData.append('published', String(form.published));
      if (file) formData.append('file', file);
      if (image) formData.append('image', image); // <-- Pastikan backend menerima field 'image'

      let response;
      if (editingPostId) {
        // Update existing post
        response = await fetchAPI(`/api/posts/${editingPostId}`, 'PUT', token, formData, true); // true for FormData
        setNotification({ message: response.message || 'Konten berhasil diperbarui!', type: 'success' });
      } else {
        // Create new post
        response = await fetchAPI('/api/posts', 'POST', token, formData, true); // true for FormData
        setNotification({ message: response.message || 'Konten berhasil dibuat!', type: 'success' });
      }
      resetForm();
      fetchPosts(); // Refresh list
    } catch (error: any) {
      console.error('Failed to save post:', error);
      setNotification({ message: error.message || 'Gagal menyimpan konten.', type: 'error' });
       // Redirect to login if unauthorized or forbidden
       if (error.message.includes('Unauthorized') || error.message.includes('Forbidden')) {
        router.push('/login');
      }
    }
  };

  const handleEdit = async (post: Post) => {
    setForm({
      title: post.title,
      slug: post.slug,
      type: post.type,
      content: post.content,
      published: post.published,
      fileUrl: post.fileUrl || '',
      imageUrl: post.imageUrl || '',
    });
    setEditingPostId(post.id);
    setFile(null); // Reset file input
    setImage(null); // Reset image input
    setNotification(null);
  };

  const handleDelete = async (id: number) => {
    if (confirm('Apakah Anda yakin ingin menghapus konten ini?')) {
      try {
        const token = localStorage.getItem('token');
        if (!token) throw new Error('No token found.');

        const response = await fetchAPI(`/api/posts/${id}`, 'DELETE', token);
        setNotification({ message: response.message || 'Konten berhasil dihapus!', type: 'success' });
        fetchPosts(); // Refresh list
      } catch (error: any) {
        console.error('Failed to delete post:', error);
        setNotification({ message: error.message || 'Gagal menghapus konten.', type: 'error' });
         // Redirect to login if unauthorized or forbidden
         if (error.message.includes('Unauthorized') || error.message.includes('Forbidden')) {
          router.push('/login');
        }
      }
    }
  };

  const resetForm = () => {
    setForm({
      title: '',
      slug: '',
      type: 'berita',
      content: '',
      published: false,
      fileUrl: '',
      imageUrl: '',
    });
    setEditingPostId(null);
    setFile(null);
    setImage(null);
    setNotification(null);
  };

  const closeNotification = () => setNotification(null);

  return (
    <AdminLayout>
      <h1 className="text-2xl font-bold mb-6">Manajemen Konten</h1>

      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={closeNotification}
        />
      )}

      {/* Form Tambah/Edit Konten */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-xl font-semibold mb-4">{editingPostId ? 'Edit Konten' : 'Tambah Konten Baru'}</h2>
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
            <FormInput
              label="Slug (URL)"
              name="slug"
              type="text"
              value={form.slug || ''}
              onChange={handleChange}
              placeholder="Akan otomatis jika kosong"
              readOnly={!!editingPostId} // Slug read-only saat edit
              className={editingPostId ? "bg-gray-100" : ""}
            />
            <div>
              <label htmlFor="type" className="block text-sm font-medium text-gray-700">Tipe Konten</label>
              <select
                id="type"
                name="type"
                value={form.type || 'berita'}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                required
              >
                <option value="berita">Berita</option>
                <option value="pengumuman">Pengumuman</option>
                <option value="profil">Profil Kampus</option>
              </select>
            </div>
            <div className="flex items-center">
              <input
                id="published"
                name="published"
                type="checkbox"
                checked={form.published || false}
                onChange={handleChange}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <label htmlFor="published" className="ml-2 block text-sm text-gray-900">Publikasikan</label>
            </div>
          </div>

          <div className="mb-4">
            <label htmlFor="content" className="block text-sm font-medium text-gray-700">Konten (HTML)</label>
            <textarea
              id="content"
              name="content"
              rows={8}
              value={form.content || ''}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              required
            ></textarea>
            {/* TODO: Integrasi Rich Text Editor di sini */}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <FormInput
                label="Lampiran File (PDF, DOCX, dll.)"
                name="file"
                type="file"
                onChange={handleFileChange}
                accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx" // Tambahkan accept types
              />
              {editingPostId && form.fileUrl && !file && (
                <p className="text-sm text-gray-500 mt-1">File saat ini: <a href={`${process.env.NEXT_PUBLIC_API_URL}${form.fileUrl}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">Lihat</a> (Biarkan kosong untuk mempertahankan file lama)</p>
              )}
            </div>
            <div>
              <FormInput
                label="Gambar (Thumbnail)"
                name="image" // Ganti 'image' agar konsisten dengan FormData
                type="file"
                onChange={handleImageChange}
                accept="image/*"
              />
              {editingPostId && form.imageUrl && !image && (
                <p className="text-sm text-gray-500 mt-1">Gambar saat ini: <a href={`${process.env.NEXT_PUBLIC_API_URL}${form.imageUrl}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">Lihat</a> (Biarkan kosong untuk mempertahankan gambar lama)</p>
              )}
            </div>
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="submit"
              className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              {editingPostId ? 'Perbarui Konten' : 'Tambah Konten'}
            </button>
            {editingPostId && (
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

      {/* Daftar Konten */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Daftar Konten</h2>
        {loading ? (
          <p>Memuat konten...</p>
        ) : posts.length === 0 ? (
          <p>Belum ada konten yang ditambahkan.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Judul</th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipe</th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Publikasi</th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {posts.map((post) => (
                  <tr key={post.id} className="bg-white border-b hover:bg-gray-50">
                    <td className="py-3 px-4 whitespace-nowrap">{post.title}</td>
                    <td className="py-3 px-4 capitalize">{post.type}</td>
                    <td className="py-3 px-4">{post.published ? 'Ya' : 'Tidak'}</td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleEdit(post)}
                        className="font-medium text-blue-600 hover:underline mr-3"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(post.id)}
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
    </AdminLayout>
  );
}
