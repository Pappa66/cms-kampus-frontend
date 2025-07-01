'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';
import { NavItem, SubMenuItem } from '@/types';
import { Plus, Trash2, Edit } from 'lucide-react';

export default function MenuManagementPage() {
    const [menuItems, setMenuItems] = useState<NavItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { token, refreshMenus } = useAuthStore();
    const router = useRouter();
    
    const fetchMenus = useCallback(async () => {
        setIsLoading(true);
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/menu-items`);
            if (!res.ok) throw new Error("Gagal memuat menu.");
            const data = await res.json();
            setMenuItems(data);
        } catch (error) { console.error(error); }
        finally { setIsLoading(false); }
    }, [token]);

    useEffect(() => {
        if (!token) router.replace('/login');
        else fetchMenus();
    }, [token, router, fetchMenus]);

    const handleCreateMenu = async (isSubmenu: boolean, parentId?: string) => {
        const name = window.prompt(`Masukkan nama ${isSubmenu ? 'submenu' : 'menu utama'} baru:`);
        if (!name) return;
        
        let url = `${process.env.NEXT_PUBLIC_API_URL}/${isSubmenu ? 'submenus' : 'menu-items'}`;
        let body: any = { name };
        if (isSubmenu && parentId) { body.menuItemId = parentId; }

        try {
            const res = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify(body),
            });
            if (!res.ok) {
                const errData = await res.json();
                throw new Error(errData.message || 'Gagal membuat item.');
            }
            fetchMenus();
            refreshMenus();
        } catch (err: any) { alert(err.message); }
    };

    const handleDelete = async (id: string, isSubmenu: boolean) => {
        if (!window.confirm("Yakin ingin menghapus item ini?")) return;
        const url = `${process.env.NEXT_PUBLIC_API_URL}/${isSubmenu ? 'submenus' : 'menu-items'}/${id}`;
        try {
            await fetch(url, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
            fetchMenus();
            refreshMenus();
        } catch (err: any) { alert(err.message); }
    };

    if (isLoading) return <div className="text-center py-12">Memuat data menu...</div>;

    const renderMenuItem = (item: NavItem | SubMenuItem, isSubmenu: boolean) => {
        const itemClass = isSubmenu
            ? "flex justify-between items-center text-sm py-1"
            : "flex justify-between items-center";
        
        return (
            <div key={item.id} className={itemClass}>
                <div className="flex items-center gap-3">
                    <span className={isSubmenu ? "" : "font-bold"}>{isSubmenu ? `- ${item.name}`: item.name}</span>
                    {item.type === 'EXTERNAL' && (
                        <span className="text-xs bg-gray-200 text-gray-700 px-2 py-0.5 rounded-full">
                            Eksternal
                        </span>
                    )}
                    {item.type === 'STATIC_PATH' && (
                        <span className="text-xs bg-purple-200 text-purple-800 px-2 py-0.5 rounded-full">
                            Path Statis
                        </span>
                    )}
                </div>
                <div className="flex items-center gap-2">
                    {/* Tombol Edit sekarang adalah Link ke halaman edit dinamis */}
                    <Link href={`/dashboard/menu/edit/${item.id}`} className="text-sm flex items-center gap-1 text-blue-600 hover:underline" title="Edit Menu/Submenu">
                        <Edit size={isSubmenu ? 12 : 14} /> Edit
                    </Link>
                    <button onClick={() => handleDelete(item.id, isSubmenu)} className="p-2 text-red-500 hover:bg-red-100 rounded-full" title="Hapus">
                        <Trash2 size={isSubmenu ? 12 : 16} />
                    </button>
                </div>
            </div>
        );
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Manajemen Menu</h1>
                <button onClick={() => handleCreateMenu(false)} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                    <Plus size={18} /> Tambah Menu Utama
                </button>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
                <div className="space-y-4">
                    {menuItems.map((item) => (
                        <div key={item.id} className="border p-4 rounded-md">
                            {renderMenuItem(item, false)}
                            {item.submenus && item.submenus.length > 0 && (
                                <div className="pl-6 mt-2 space-y-2 border-l-2 ml-2">
                                    {item.submenus.map((submenu) => renderMenuItem(submenu, true))}
                                </div>
                            )}
                             <div className="pl-6 mt-2 ml-2">
                                <button onClick={() => handleCreateMenu(true, item.id)} className="text-xs text-green-600 hover:underline mt-2">+ Tambah Submenu</button>
                             </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}