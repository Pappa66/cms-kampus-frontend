'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Spinner from '@/components/ui/Spinner';
import { Plus, Edit, Trash2, Eye, X } from 'lucide-react';

interface Post { id: string; title: string; status: 'PUBLISHED' | 'PRIVATE'; author: { name: string }; slug: string; }
type EditorMode = 'create' | 'edit';

export default function PostManagementPage() {
  const { token } = useAuthStore();
  const router = useRouter();

  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [showModal, setShowModal] = useState(false);
  const [mode, setMode] = useState<EditorMode>('create');
  const [currentItem, setCurrentItem] = useState<Post | null>(null);

  const fetchPosts = useCallback(async () => {
    if (!token) return;
    setIsLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/posts`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Gagal mengambil data postingan.');
      const data = await res.json();
      setPosts(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (!token) router.replace('/login');
    else fetchPosts();
  }, [token, router, fetchPosts]);

  const handleOpenModal = (mode: EditorMode, item: Post | null = null) => {
    setMode(mode);
    setCurrentItem(item);
    setShowModal(true);
  };
  
  const handleCloseModal = () => setShowModal(false);

  const handleDelete = async (postId: string) => {
    if (!window.confirm('Yakin ingin menghapus postingan ini?')) return;
    try {
        await fetch(`${process.env.NEXT_PUBLIC_API_URL}/posts/${postId}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token}` }
        });
        fetchPosts();
    } catch (err) {
        alert('Gagal menghapus postingan.');
    }
  };

  if (isLoading) return <div className="text-center py-12">Memuat data postingan...</div>;

  return (
    <>
      <div>
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Manajemen Konten (Postingan)</h1>
          <button onClick={() => handleOpenModal('create')} className="flex items-center gap-2 bg-brand-blue text-white px-4 py-2 rounded-lg hover:bg-brand-blue/90">
            <Plus size={18} /> Buat Postingan Baru
          </button>
        </div>
        
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b bg-gray-50">
                <tr className="text-gray-600">
                    <th className="px-6 py-4 font-medium">Judul</th>
                    <th className="px-6 py-4 font-medium">Author</th>
                    <th className="px-6 py-4 font-medium">Status</th>
                    <th className="px-6 py-4 font-medium">Aksi</th>
                </tr>
            </thead>
            <tbody>
              {posts.map((post) => (
                <tr key={post.id} className="border-b hover:bg-gray-50">
                  <td className="px-6 py-4 font-semibold">{post.title}</td>
                  <td className="px-6 py-4">{post.author?.name || 'N/A'}</td>
                  <td className="px-6 py-4"><span className={`px-2 py-1 text-xs rounded-full ${post.status === 'PUBLISHED' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>{post.status}</span></td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                        <Link href={`/page/${post.slug}`} target="_blank" className="p-2 text-gray-600 hover:bg-gray-100 rounded-md" title="Lihat Halaman Publik"><Eye size={16} /></Link>
                        <button onClick={() => handleOpenModal('edit', post)} className="p-2 text-blue-600 hover:bg-blue-100 rounded-md" title="Edit"><Edit size={16} /></button>
                        <button onClick={() => handleDelete(post.id)} className="p-2 text-red-600 hover:bg-red-100 rounded-md" title="Hapus"><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {posts.length === 0 && !isLoading && (
            <div className="text-center p-16 text-gray-500"><h3 className="text-lg font-semibold">Belum Ada Postingan</h3><p className="mt-2">Silakan klik tombol "Buat Postingan Baru" untuk memulai.</p></div>
          )}
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-start z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl my-8">
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-xl font-bold">{mode === 'create' ? 'Buat Postingan Baru' : 'Edit Postingan'}</h2>
              <button onClick={handleCloseModal} className="p-1 hover:bg-gray-100 rounded-full"><X size={24} /></button>
            </div>
            <div className="p-6">
                {/* Komponen Form akan kita buat terpisah agar rapi */}
                <PostEditor 
                    mode={mode} 
                    initialData={currentItem} 
                    onClose={handleCloseModal} 
                    onSave={() => {
                        fetchPosts();
                        handleCloseModal();
                    }}
                />
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// --- KOMPONEN BARU: Form Editor di dalam file yang sama ---
function PostEditor({ mode, initialData, onClose, onSave }: { mode: EditorMode, initialData: Post | null, onClose: () => void, onSave: () => void }) {
    const { token } = useAuthStore();
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSubmitting(true);
        const formData = new FormData(e.currentTarget);
        // Logika untuk upload file dan kirim data akan ada di sini
        try {
            // ... Logika lengkap untuk POST atau PUT
            alert('Aksi berhasil!');
            onSave();
        } catch (err) {
            alert('Aksi gagal.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div>
                <label className="font-medium">Judul Postingan</label>
                <input name="title" defaultValue={initialData?.title || ''} required className="w-full mt-1 p-2 border rounded"/>
            </div>
             {/* Text Editor (Rich Text) akan diimplementasikan di sini */}
            <div>
                <label className="font-medium">Konten</label>
                <textarea name="content" rows={15} defaultValue={''} className="w-full mt-1 p-2 border rounded"/>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
                <div>
                    <label className="font-medium">Gambar Unggulan (Opsional)</label>
                    <input name="image" type="file" accept="image/*" className="w-full mt-1 text-sm"/>
                </div>
                 <div>
                    <label className="font-medium">Link Video (YouTube, opsional)</label>
                    <input name="videoUrl" defaultValue={''} placeholder="https://www.youtube.com/watch?v=..." className="w-full mt-1 p-2 border rounded"/>
                </div>
            </div>
            <div>
                <label className="font-medium">Status</label>
                <select name="status" defaultValue={initialData?.status || 'PRIVATE'} className="w-full mt-1 p-2 border rounded">
                    <option value="PRIVATE">Draf</option>
                    <option value="PUBLISHED">Publikasikan</option>
                </select>
            </div>
            <div className="flex justify-end gap-4 pt-4 border-t">
                <button type="button" onClick={onClose} className="px-4 py-2 rounded border">Batal</button>
                <button type="submit" disabled={isSubmitting} className="flex items-center justify-center gap-2 bg-green-600 text-white font-bold px-6 py-3 rounded-lg">
                    {isSubmitting ? <Spinner/> : 'Simpan Postingan'}
                </button>
            </div>
        </form>
    );
}

