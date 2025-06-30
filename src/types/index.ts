export type UserRole = "public" | "mahasiswa" | "dosen" | "admin";

// Tipe data lengkap untuk menu, submenu, dan post
export interface Post {
  id: string;
  title: string;
  slug: string;
}

export interface SubMenuItem {
  id: string;
  name: string;
  href?: string | null;
  post?: Post | null;
}

export interface NavItem {
  id: string;
  name: string;
  href?: string | null;
  post?: Post | null;
  submenus?: SubMenuItem[];
}
export interface RepositoryItem {
  id: string;
  title: string;
  author: string;
  year: number;
  studyProgram: string;
  fileUrl: string;
}