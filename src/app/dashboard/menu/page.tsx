'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';
import { NavItem, SubMenuItem } from '@/types';
import { Plus, Trash2, Edit, GripVertical } from 'lucide-react';
import {
    DndContext,
    closestCenter,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent,
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    useSortable,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { fetchWithAuth } from '@/utils/api';

// Komponen SortableItem (tidak ada perubahan)
function SortableItem({ item, isSubmenu, onDelete }: { 
    item: NavItem | SubMenuItem, 
    isSubmenu: boolean,
    onDelete: (id: string, isSubmenu: boolean) => void 
}) {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: item.id });
    const style = { transform: CSS.Transform.toString(transform), transition };
    const itemClass = isSubmenu ? "flex justify-between items-center text-sm py-2 px-2 bg-card rounded-md" : "flex justify-between items-center font-semibold bg-card p-4 border rounded-lg";

    return (
        <div ref={setNodeRef} style={style} {...attributes} className={itemClass}>
            <div className="flex items-center gap-3">
                <button {...listeners} className="cursor-grab p-2"><GripVertical size={16} /></button>
                <span className={isSubmenu ? "" : "text-lg"}>{isSubmenu ? `- ${item.name}` : item.name}</span>
                {item.type === 'EXTERNAL' && <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">Eksternal</span>}
                {item.type === 'STATIC_PATH' && <span className="text-xs bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full">Path Statis</span>}
            </div>
            <div className="flex items-center gap-2">
                <Link href={`/dashboard/menu/edit/${item.id}`} className="text-sm flex items-center gap-1 text-blue-600 hover:underline"><Edit size={isSubmenu ? 12 : 14} /> Edit</Link>
                <button onClick={() => onDelete(item.id, isSubmenu)} className="p-2 text-red-500 hover:bg-red-100 rounded-full"><Trash2 size={isSubmenu ? 12 : 16} /></button>
            </div>
        </div>
    );
}

// Komponen Halaman Utama
export default function MenuManagementPage() {
    const [menuItems, setMenuItems] = useState<NavItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { token, refreshMenus } = useAuthStore();
    const router = useRouter();
    
    const fetchInitialMenus = async () => {
        if (!token) return;
        setIsLoading(true);
        try {
            const res = await fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}/menu-items`);
            if (!res.ok) throw new Error("Gagal memuat menu.");
            const data = await res.json();
            setMenuItems(data);
        } catch (error) { 
            console.error(error); 
        } finally { 
            setIsLoading(false); 
        }
    };

    useEffect(() => {
        if (token) {
            fetchInitialMenus();
        } else {
            router.replace('/login');
        }
    }, [token, router]);

    const handleCreateMenu = async (isSubmenu: boolean, parentId?: string) => {
        const name = window.prompt(`Masukkan nama untuk ${isSubmenu ? 'Sub Menu' : 'Menu Utama'} baru:`);
        if (!name || name.trim() === '') return;
        
        const url = `${process.env.NEXT_PUBLIC_API_URL}/${isSubmenu ? 'submenus' : 'menu-items'}`;
        const body: any = { name: name.trim() };
        if (isSubmenu && parentId) { body.menuItemId = parentId; }

        try {
            const res = await fetchWithAuth(url, {
                method: 'POST',
                body: JSON.stringify(body),
            });
            if (!res.ok) {
                const errData = await res.json();
                throw new Error(errData.message || 'Gagal membuat item.');
            }
            await fetchInitialMenus(); // Muat ulang semua menu
            refreshMenus(); // Trigger refresh di header
        } catch (err: any) { 
            if (err.name !== 'AbortError') alert(err.message);
        }
    };

    const handleDelete = async (id: string, isSubmenu: boolean) => {
        if (!window.confirm(`Apakah Anda yakin ingin menghapus item ini?`)) return;
        
        const url = `${process.env.NEXT_PUBLIC_API_URL}/${isSubmenu ? 'submenus' : 'menu-items'}/${id}`;
        try {
            await fetchWithAuth(url, { method: 'DELETE' });
            await fetchInitialMenus();
            refreshMenus();
        } catch (err: any) { 
            if (err.name !== 'AbortError') alert(err.message);
        }
    };

    const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

    // --- FUNGSI handleDragEnd YANG SUDAH DIPERBAIKI ---
    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;

        if (over && active.id !== over.id) {
            // Cek apakah ini reorder menu utama
            const isMainMenuReorder = menuItems.some(item => item.id === active.id);

            if (isMainMenuReorder) {
                const oldIndex = menuItems.findIndex((item) => item.id === active.id);
                const newIndex = menuItems.findIndex((item) => item.id === over.id);
                
                // 1. Buat array baru dengan urutan yang sudah diubah
                const reorderedMenuItems = arrayMove(menuItems, oldIndex, newIndex);
                
                // 2. Update state lokal untuk UI yang responsif
                setMenuItems(reorderedMenuItems);
                
                // 3. Buat variabel `reorderedData` yang dibutuhkan oleh API
                const reorderedData = reorderedMenuItems.map((item, index) => ({
                    id: item.id,
                    order: index, // Backend akan menggunakan `order` ini untuk update
                }));

                try {
                    // 4. Kirim data yang benar ke API
                    await fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}/menu-items/reorder`, {
                        method: 'PUT',
                        body: JSON.stringify({ items: reorderedData }),
                    });
                    refreshMenus(); // Panggil fungsi dari store untuk refresh header
                } catch (error) {
                    console.error("Gagal menyimpan urutan menu:", error);
                    // Kembalikan ke state semula jika API call gagal
                    await fetchInitialMenus(); 
                    alert("Gagal memperbarui urutan menu.");
                }
            }
            // TODO: Tambahkan logika untuk reorder submenu jika diperlukan di masa depan
        }
    };

    if (isLoading) return <div className="text-center py-12">Memuat data menu...</div>;

    return (
        <div className="container mx-auto py-8">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold">Manajemen Menu</h1>
                <button onClick={() => handleCreateMenu(false)} className="bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-lg flex items-center gap-2">
                    <Plus size={18} /> Tambah Menu Utama
                </button>
            </div>

            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext items={menuItems} strategy={verticalListSortingStrategy}>
                    <div className="space-y-6">
                        {menuItems.map(item => (
                            <div key={item.id} className="p-4 border rounded-xl bg-background">
                                <SortableItem item={item} isSubmenu={false} onDelete={handleDelete} />
                                <div className="pl-12 mt-2 space-y-2">
                                    {item.submenus && item.submenus.map(submenu => (
                                        <SortableItem key={submenu.id} item={submenu} isSubmenu={true} onDelete={handleDelete} />
                                    ))}
                                    <button onClick={() => handleCreateMenu(true, item.id)} className="text-sm text-primary hover:underline flex items-center gap-1 mt-2">
                                        <Plus size={14} /> Tambah Sub Menu
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </SortableContext>
            </DndContext>
        </div>
    );
}