'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';
import { Edit, Trash2 } from 'lucide-react';
import Pagination from '@/components/ui/Pagination';

interface Post { 
    id: string; 
    title: string; 
    author: { name: string }; 
    menuItem?: { name: string };
    submenuItem?: { name: string, menuItem: { name: string } };
}

export default function PostManagementPage() {
    const { token } = useAuthStore();
    const router = useRouter();
    const [posts, setPosts] = useState<Post[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [searchQuery, setSearchQuery] = useState('');
    
    const [inputValue, setInputValue] = useState('');

    const fetchPosts = useCallback(async (page = 1, search = '') => {
        if (!token) return;
        setIsLoading(true);
        try {
            const url = new URL(`${process.env.NEXT_PUBLIC_API_URL}/posts`);
            url.searchParams.append('page', String(page));
            url.searchParams.append('limit', '10');
            if (search) {
                url.searchParams.append('search', search);
            }
            const res = await fetch(url.toString(), { headers: { Authorization: `Bearer ${token}` } });
            if (!res.ok) throw new Error('Gagal mengambil data postingan.');
            const data = await res.json();
            
            setPosts(data.posts);
            setCurrentPage(data.currentPage);
            setTotalPages(data.totalPages);
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    }, [token]);

    useEffect(() => {
        const timer = setTimeout(() => {
            setSearchQuery(inputValue);
            setCurrentPage(1);
        }, 500);

        return () => {
            clearTimeout(timer);
        };
    }, [inputValue]);

    useEffect(() => {
        fetchPosts(currentPage, searchQuery);
    }, [fetchPosts, currentPage, searchQuery]);

    const handleEdit = (postId: string) => {
        router.push(`/dashboard/editor/${postId}`);
    };

    const handleDelete = async (postId: string) => {
        if (!window.confirm('Yakin ingin menghapus postingan ini?')) return;
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/posts/${postId}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` }
            });
            if(!res.ok) throw new Error("Gagal menghapus post");
            alert('Post berhasil dihapus.');
            fetchPosts(1, searchQuery);
        } catch (err) {
            alert('Gagal menghapus postingan.');
        }
    };

    if (isLoading) return <div className="text-center py-12">Memuat data postingan...</div>;

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Manajemen Konten</h1>
                <input 
                    type="text" 
                    name="search" 
                    placeholder="Cari judul..." 
                    className="px-3 py-2 border rounded-md"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                />
            </div>
            
            {/* --- PERBAIKAN: Struktur tabel HTML yang benar --- */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="min-w-full text-left text-sm">
                    <thead className="border-b bg-gray-50">
                        <tr className="text-gray-600">
                            <th className="px-6 py-4 font-medium">Judul Halaman</th>
                            <th className="px-6 py-4 font-medium">Terhubung Ke</th>
                            <th className="px-6 py-4 font-medium">Author</th>
                            <th className="px-6 py-4 font-medium text-center">Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        {posts.map((post) => (
                            <tr key={post.id} className="border-b hover:bg-gray-50">
                                <td className="px-6 py-4 font-semibold">{post.title}</td>
                                <td className="px-6 py-4 text-xs">
                                    {post.menuItem && `Menu: ${post.menuItem.name}`}
                                    {post.submenuItem && `Submenu: ${post.submenuItem.name} (di ${post.submenuItem.menuItem.name})`}
                                    {!post.menuItem && !post.submenuItem && 'Tidak terhubung'}
                                </td>
                                <td className="px-6 py-4">{post.author?.name || 'N/A'}</td>
                                <td className="px-6 py-4">
                                    <div className="flex justify-center gap-2">
                                        <button onClick={() => handleEdit(post.id)} className="p-2 text-blue-600 hover:bg-blue-100 rounded-md" title="Edit">
                                            <Edit size={16} />
                                        </button>
                                        <button onClick={() => handleDelete(post.id)} className="p-2 text-red-600 hover:bg-red-100 rounded-md" title="Hapus">
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {posts.length === 0 && !isLoading && (
                    <div className="text-center p-16 text-gray-500">
                        <h3 className="text-lg font-semibold">Tidak Ada Konten</h3>
                        <p className="mt-2 text-sm">{searchQuery ? 'Tidak ada hasil untuk pencarian Anda.' : 'Buat menu baru untuk membuat konten.'}</p>
                    </div>
                )}
            </div>

            <Pagination 
                currentPage={currentPage} 
                totalPages={totalPages} 
                onPageChange={(page) => setCurrentPage(page)}
            />
        </div>
    );
}