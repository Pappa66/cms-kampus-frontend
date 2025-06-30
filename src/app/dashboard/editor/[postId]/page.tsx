'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';
import Spinner from '@/components/ui/Spinner';
import Link from 'next/link';

interface PostData { title: string; content: string; }

export default function EditorPage({ params }: { params: { postId: string } }) {
  const { token } = useAuthStore();
  const router = useRouter();
  const [post, setPost] = useState<PostData | null>(null);
  const [content, setContent] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchPost = useCallback(async () => {
    if (!token || !params.postId) return;
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/posts/${params.postId}`, { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error("Konten tidak ditemukan");
      const data = await res.json();
      setPost(data);
      setContent(data.content);
    } catch (error) { console.error(error); } 
    finally { setIsLoading(false); }
  }, [token, params.postId]);

  useEffect(() => {
    if (!token) router.replace('/login');
    else fetchPost();
  }, [token, router, fetchPost]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/posts/${params.postId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ title: post?.title, content }),
      });
      if (!res.ok) throw new Error('Gagal menyimpan perubahan.');
      alert('Konten berhasil disimpan!');
      router.back();
    } catch (err: any) { alert(err.message); } 
    finally { setIsSubmitting(false); }
  };

  if (isLoading) return <div className="text-center py-12">Memuat editor...</div>;
  if (!post) return <div className="text-center py-12">Konten tidak ditemukan atau Anda tidak punya akses.</div>;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Edit Konten: {post.title}</h1>
        <Link href="/dashboard/menu" className="text-sm text-blue-600 hover:underline">{'< Kembali ke Manajemen Menu'}</Link>
      </div>
      <div className="bg-white p-6 rounded-lg shadow">
        <textarea 
          value={content} 
          onChange={(e) => setContent(e.target.value)}
          rows={25}
          className="w-full p-4 border rounded-md"
        />
      </div>
      <div className="flex justify-end">
        <button type="submit" disabled={isSubmitting} className="flex items-center justify-center gap-2 w-48 bg-green-600 text-white font-bold px-6 py-3 rounded-lg hover:bg-green-700 disabled:bg-green-300">
          {isSubmitting ? <Spinner/> : 'Simpan Perubahan'}
        </button>
      </div>
    </form>
  );
}