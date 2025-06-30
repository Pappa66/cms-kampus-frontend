'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import clsx from 'clsx';
import { useAuthStore } from '@/store/authStore';
import { NavItem as NavItemType, SubMenuItem as SubMenuItemType } from '@/types';
import { Search, ChevronDown, LogOut, LayoutDashboard, LogIn } from 'lucide-react';

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { token, logout } = useAuthStore();
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);
  const [navigationData, setNavigationData] = useState<NavItemType[]>([]);

  useEffect(() => {
    setIsClient(true);
    const fetchMenuData = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/menu-items`);
        if (!res.ok) throw new Error('Failed to fetch menu');
        const data = await res.json();
        setNavigationData(data);
      } catch (error) {
        console.error("Gagal mengambil data menu:", error);
      }
    };
    fetchMenuData();
  }, []);

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  return (
    <header className="sticky top-0 z-50 shadow-md">
      <div className="bg-primary text-primary-foreground">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <Image src="/logo-stisip.png" alt="Logo STISIP" width={40} height={40}/>
            <span className="hidden text-lg font-bold sm:inline-block">STISIP SYAMSUL ULUM</span>
          </Link>
          <div className="flex items-center gap-4">
            <div className="relative hidden lg:block">
              <input type="text" placeholder="Cari di sini ..." className="w-64 rounded-md border-none bg-black/20 px-4 py-2 text-sm text-white placeholder:text-gray-300 focus:ring-2 focus:ring-brand-orange"/>
              <Search className="absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-300" />
            </div>
            {isClient && token && pathname !== '/login' ? (
              <div className="flex items-center gap-2">
                 <Link href="/dashboard" className="flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors hover:bg-white/10">
                    <LayoutDashboard className="h-4 w-4" /> Dashboard
                 </Link>
                 <button onClick={handleLogout} className="flex items-center gap-2 rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700">
                    <LogOut className="h-4 w-4" /> Logout
                 </button>
              </div>
            ) : (
              <Link href="/login" className="flex items-center gap-1 rounded-md border border-white px-4 py-2 text-sm font-medium transition-colors hover:bg-white/10">
                <LogIn className="h-4 w-4" /> Login
              </Link>
            )}
          </div>
        </div>
      </div>
      <nav className="bg-secondary text-secondary-foreground">
        <div className="container flex h-12 items-center justify-center">
          <ul className="flex h-full items-center gap-8">
            {navigationData.map((item) => {
              const linkHref = item.post ? `/page/${item.post.slug}` : item.href || '#';
              return (
                <li key={item.id} className="relative h-full" onMouseEnter={() => item.submenus && item.submenus.length > 0 && setOpenMenu(item.name)} onMouseLeave={() => item.submenus && setOpenMenu(null)}>
                  <Link href={linkHref} className={clsx("flex h-full items-center gap-1 text-sm font-semibold transition-colors hover:text-primary")}>
                    {item.name}
                    {item.submenus && item.submenus.length > 0 && <ChevronDown size={16} />}
                  </Link>
                  {item.submenus && item.submenus.length > 0 && openMenu === item.name && (
                     <ul className="absolute left-0 top-full w-56 origin-top-left rounded-md bg-background py-2 text-foreground shadow-lg ring-1 ring-black ring-opacity-5">
                      {item.submenus.map((submenu: SubMenuItemType) => {
                         const submenuHref = submenu.post ? `/page/${submenu.post.slug}` : submenu.href || '#';
                         return (
                           <li key={submenu.id}>
                             <Link href={submenuHref} className="block px-4 py-2 text-sm transition-colors hover:bg-muted" onClick={() => setOpenMenu(null)}>
                               {submenu.name}
                             </Link>
                           </li>
                         );
                      })}
                    </ul>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      </nav>
    </header>
  );
}
