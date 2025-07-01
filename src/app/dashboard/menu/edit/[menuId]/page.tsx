'use client';

import React, { useState, useEffect, useCallback, FormEvent } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { NavItem, MenuType } from '@/types';
import Spinner from '@/components/ui/Spinner';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function EditMenuPage() {
    const router = useRouter();
    const params = useParams();
    const menuId = params.menuId as string;
    const { token, refreshMenus } = useAuthStore();

    const [menuItem, setMenuItem] = useState<NavItem | null>(null);
    const [name, setName] = useState('');
    const [type, setType] = useState<MenuType>('INTERNAL');
    const [href, setHref] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const fetchMenuItem = useCallback(async () => {
        if (!menuId || !token) return;
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/menu-items`);
            const allItems = await res.json();
            let currentItem: NavItem | undefined;
            for (const menu of allItems) {
                if (menu.id === menuId) {
                    currentItem = menu;
                    break;
                }
                const subItem = menu.submenus?.find((sub: any) => sub.id === menuId);
                if (subItem) {
                    currentItem = subItem;
                    break;
                }
            }
            
            if (currentItem) {
                setMenuItem(currentItem);
                setName(currentItem.name);
                setType(currentItem.type || 'INTERNAL');
                setHref(currentItem.href || '');
            } else {
                throw new Error("Menu item tidak ditemukan");
            }
        } catch (error) {
            console.error("Gagal mengambil data menu:", error);
            alert("Gagal memuat data menu.");
        } finally {
            setIsLoading(false);
        }
    }, [menuId, token]);

    useEffect(() => {
        fetchMenuItem();
    }, [fetchMenuItem]);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        const isSubmenu = 'menuItemId' in menuItem!;
        const payload = { name, type, href: (type === 'EXTERNAL' || type === 'STATIC_PATH') ? href : null };
        const url = `${process.env.NEXT_PUBLIC_API_URL}/${isSubmenu ? 'submenus' : 'menu-items'}/${menuId}`;

        try {
            const res = await fetch(url, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify(payload),
            });
            if (!res.ok) {
                 try {
                    const errData = await res.json();
                    throw new Error(errData.message || 'Update gagal.');
                } catch {
                    throw new Error('Server error saat update. Periksa log backend.');
                }
            }
            refreshMenus();
            alert('Menu berhasil diperbarui!');
            router.push('/dashboard/menu');
        } catch (err: any) {
            alert(err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) return <div className="text-center py-12">Memuat data menu...</div>;
    if (!menuItem) return <div className="text-center py-12">Menu tidak ditemukan.</div>;

    return (
        <div className="container py-8 mx-auto">
            <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-6">
                <div className="flex justify-between items-center mb-4">
                    <h1 className="text-3xl font-bold">Edit Menu</h1>
                    {/* --- TOMBOL KEMBALI --- */}
                    <Link href="/dashboard/menu" className="flex items-center gap-2 px-4 py-2 text-sm font-medium border rounded-lg hover:bg-secondary">
                        <ArrowLeft size={16} />
                        Kembali ke Daftar Menu
                    </Link>
                </div>
                
                <div className="p-6 space-y-6 border rounded-lg bg-card text-card-foreground">
                    <div>
                        <label className="block text-sm font-medium mb-1">Nama</label>
                        <input type="text" value={name} onChange={(e) => setName(e.target.value)} required className="w-full px-3 py-2 border rounded-md bg-background"/>
                    </div>
                    <div>
                        <label className="block text-sm font-medium">Jenis Link</label>
                        <fieldset className="mt-2 space-y-3">
                            <label className="flex items-center"><input type="radio" name="type" value="INTERNAL" checked={type === 'INTERNAL'} onChange={() => setType('INTERNAL')} className="h-4 w-4"/><span className="ml-3 text-sm">Halaman Internal (dari Konten)</span></label>
                            <label className="flex items-center"><input type="radio" name="type" value="STATIC_PATH" checked={type === 'STATIC_PATH'} onChange={() => setType('STATIC_PATH')} className="h-4 w-4"/><span className="ml-3 text-sm">Path Halaman Statis (dari Kode)</span></label>
                            <label className="flex items-center"><input type="radio" name="type" value="EXTERNAL" checked={type === 'EXTERNAL'} onChange={() => setType('EXTERNAL')} className="h-4 w-4"/><span className="ml-3 text-sm">Link Eksternal (URL Lengkap)</span></label>
                        </fieldset>
                    </div>
                    {type === 'INTERNAL' && menuItem.post?.id && (
                        <div><label className="block text-sm font-medium">Konten Halaman</label><Link href={`/dashboard/editor/${menuItem.post.id}`} className="mt-1 text-sm text-blue-600 hover:underline block">Klik di sini untuk mengedit</Link></div>
                    )}
                    {type === 'STATIC_PATH' && (
                        <div><label className="block text-sm font-medium">Path Internal</label><input type="text" placeholder="/repository" value={href} onChange={(e) => setHref(e.target.value)} required className="w-full mt-1 px-3 py-2 border rounded-md bg-background"/></div>
                    )}
                    {type === 'EXTERNAL' && (
                        <div><label className="block text-sm font-medium">URL Eksternal</label><input type="url" placeholder="https://google.com" value={href} onChange={(e) => setHref(e.target.value)} required className="w-full mt-1 px-3 py-2 border rounded-md bg-background"/></div>
                    )}
                </div>
                <div className="flex justify-end pt-4">
                    <button type="submit" disabled={isSubmitting} className="flex items-center justify-center w-36 px-4 py-2 rounded-md border bg-blue-600 text-white">
                        {isSubmitting ? <Spinner/> : 'Simpan'}
                    </button>
                </div>
            </form>
        </div>
    );
}
