import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthState {
    token: string | null;
    setToken: (token: string) => void;
    logout: () => void;
    // --- TAMBAHKAN DUA BARIS INI ---
    menuVersion: number;
    refreshMenus: () => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            token: null,
            setToken: (token) => set({ token }),
            logout: () => set({ token: null }),
            // --- TAMBAHKAN DUA BARIS INI ---
            menuVersion: 0,
            refreshMenus: () => set((state) => ({ menuVersion: state.menuVersion + 1 })),
        }),
        {
            name: 'auth-storage',
        }
    )
);