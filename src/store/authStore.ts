import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

// Definisikan tipe untuk state dan actions
interface AuthState {
  token: string | null;
  setToken: (token: string) => void;
  logout: () => void;
}

// Buat store dengan middleware persist
// Middleware ini akan otomatis menyimpan state ke localStorage
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      setToken: (token) => set({ token }),
      logout: () => set({ token: null }),
    }),
    {
      name: 'auth-storage', // nama item di localStorage
      storage: createJSONStorage(() => localStorage), // (opsional) spesifikasikan localStorage
    }
  )
);
