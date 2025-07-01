'use client';

import { useState, useEffect, useCallback, ChangeEvent } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useRouter, useParams } from 'next/navigation';
import Spinner from '@/components/ui/Spinner';
import Link from 'next/link';
import dynamic from 'next/dynamic';

// Impor dinamis untuk RichEditor
const RichEditorWithNoSSR = dynamic(
    () => import('@/components/ui/RichEditor').then(mod => mod.RichEditor), 
    { ssr: false, loading: () => <div className="p-4 border rounded-md">Memuat editor...</div> }
);

export default function EditorPage() {
    const params = useParams();
    const postId = params.postId as string;
    const { token } = useAuthStore();
    const router = useRouter();
    
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const fetchPost = useCallback(async () => {
        if (!token || !postId) return;
        setIsLoading(true);
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/posts/${postId}`);
            if (!res.ok) throw new Error("Konten tidak ditemukan");
            const data = await res.json();
            setTitle(data.title);
            setContent(data.content || '');
            setImageUrl(data.imageUrl || null);
        } catch (error) {
            console.error(error);
            alert("Gagal memuat konten.");
        } finally {
            setIsLoading(false);
        }
    }, [token, postId]);

    useEffect(() => {
        if (token) fetchPost();
        else router.replace('/login');
    }, [token, router, fetchPost]);
    
    const handleImageUpload = async (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('upload', file);
        setIsUploading(true);

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/upload`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` },
                body: formData,
            });

            if (!res.ok) throw new Error('Upload gagal. Periksa log server backend.');
            
            const data = await res.json();
            setImageUrl(data.url);
        } catch (err: any) {
            alert(err.message);
        } finally {
            setIsUploading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/posts/${postId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({ title, content, imageUrl }),
            });
            if (!res.ok) throw new Error('Gagal menyimpan perubahan.');
            alert('Konten berhasil disimpan!');
            router.push('/dashboard/posts');
        } catch (err: any) {
            alert(err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) return <div className="text-center py-12">Memuat data...</div>;

    return (
        <div className="container py-8 mx-auto">
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="flex justify-between items-center">
                    <h1 className="text-2xl font-bold">Edit Konten</h1>
                    <Link href="/dashboard/posts" className="text-sm text-blue-600 hover:underline">{'< Kembali'}</Link>
                </div>
                
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Gambar Utama</label>
                    <div className="mt-2 flex items-center gap-4 p-4 border rounded-md">
                        {imageUrl && <img src={imageUrl} alt="Preview" className="w-40 h-auto rounded-md" />}
                        <div className="flex flex-col gap-2">
                            <input id="image-upload" type="file" onChange={handleImageUpload} className="text-sm"/>
                            {isUploading && <p className="text-sm text-gray-500">Mengupload...</p>}
                            {imageUrl && <button type="button" onClick={() => setImageUrl(null)} className="text-xs text-red-600 hover:underline text-left">Hapus Gambar</button>}
                        </div>
                    </div>
                </div>

                <div>
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">Judul Halaman</label>
                    <input id="title" type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full p-2 border rounded-md" required />
                </div>

                <div className="prose max-w-none">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Isi Konten</label>
                    <div className="bg-white rounded-lg border">
                        <RichEditorWithNoSSR value={content} onChange={setContent} />
                    </div>
                </div>

                <div className="flex justify-end pt-4">
                    <button type="submit" disabled={isSubmitting || isUploading} className="flex items-center justify-center gap-2 w-48 bg-green-600 text-white font-bold px-6 py-3 rounded-lg hover:bg-green-700 disabled:bg-gray-400">
                        {isSubmitting ? <Spinner/> : 'Simpan Perubahan'}
                    </button>
                </div>
            </form>
        </div>
    );
}