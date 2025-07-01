// Definisikan tipe untuk MenuType agar bisa digunakan di semua file
export type MenuType = 'INTERNAL' | 'EXTERNAL' | 'STATIC_PATH';

export interface SubMenuItem {
    id: string;
    name: string;
    order: number;
    type: MenuType;
    href: string | null;
    post: { id: string } | null;
    postId: string | null;
    menuItemId: string;
}

export interface NavItem {
    id: string;
    name: string;
    order: number;
    type: MenuType;
    href: string | null;
    post: { id: string } | null;
    postId: string | null;
    submenus: SubMenuItem[];
}