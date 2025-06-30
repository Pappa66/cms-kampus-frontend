'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';
import { NavItem } from '@/types';
import { Plus, Trash2, Edit } from 'lucide-react';

export default function MenuManagementPage() {
  const [menuItems, setMenuItems] = useState<NavItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { token } = useAuthStore();
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
  }, []);

  useEffect(() => {
    if (!token) router.replace('/login');
    else fetchMenus();
  }, [token, router, fetchMenus]);

  const handleCreateMenu = async (isSubmenu: boolean, parentId?: string) => {
    const name = window.prompt(`Masukkan nama ${isSubmenu ? 'submenu' : 'menu utama'} baru:`);
    if (!name) return;
    
    let url = `${process.env.NEXT_PUBLIC_API_URL}/${isSubmenu ? 'submenus' : 'menu-items'}`;
    let body: any = { name };
    if (isSubmenu) { body.menuItemId = parentId; }

    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error('Gagal membuat item.');
      fetchMenus();
    } catch (err: any) { alert(err.message); }
  };

  const handleDelete = async (id: string, isSubmenu: boolean) => {
    if (!window.confirm("Yakin ingin menghapus item ini?")) return;
    const url = `${process.env.NEXT_PUBLIC_API_URL}/${isSubmenu ? 'submenus' : 'menu-items'}/${id}`;
    try {
        await fetch(url, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
        fetchMenus();
    } catch (err: any) { alert(err.message); }
  };

  if (isLoading) return <div className="text-center py-12">Memuat data menu...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Manajemen Menu & Konten</h1>
        <button onClick={() => handleCreateMenu(false)} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
          <Plus size={18} /> Tambah Menu Utama
        </button>
      </div>
      <div className="bg-white rounded-lg shadow p-6">
        <div className="space-y-4">
          {menuItems.map((item) => (
            <div key={item.id} className="border p-4 rounded-md bg-gray-50">
              <div className="flex justify-between items-center">
                <span className="font-bold text-gray-800">{item.name}</span>
                <div className="flex items-center gap-2">
                  <button onClick={() => handleCreateMenu(true, item.id)} className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded hover:bg-green-200">Tambah Submenu</button>
                  <button onClick={() => handleDelete(item.id, false)} className="p-2 text-red-500 hover:bg-red-100 rounded-full"><Trash2 size={16}/></button>
                </div>
              </div>
              <div className="pl-4 mt-2 space-y-2 border-l-2 ml-2">
                {item.submenus?.map((submenu) => (
                  <div key={submenu.id} className="flex justify-between items-center text-sm py-1">
                    <span>- {submenu.name}</span>
                    <div className="flex items-center gap-2">
                      <Link href={`/dashboard/editor/${submenu.post?.id}`} className="text-xs flex items-center gap-1 text-blue-600 hover:underline">
                        <Edit size={12}/> Edit Konten
                      </Link>
                      <button onClick={() => handleDelete(submenu.id, true)} className="p-1 text-red-500 hover:bg-red-100 rounded-full"><Trash2 size={14}/></button>
                    </div>
                  </div>
                ))}
                {(!item.submenus || item.submenus.length === 0) && item.post && (
                    <Link href={`/dashboard/editor/${item.post.id}`} className="text-sm flex items-center gap-1 text-blue-600 hover:underline">
                        <Edit size={14}/> Edit Konten Halaman Ini
                    </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
