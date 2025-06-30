'use client';

import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';
import { jwtDecode } from 'jwt-decode';
import * as XLSX from 'xlsx';
import Spinner from '@/components/ui/Spinner';
import { Edit, Trash2, UserPlus, Upload, Search, Info, Download, X, KeyRound } from 'lucide-react';

interface User { id: string; name: string; email: string; role: 'ADMIN' | 'MAHASISWA' | 'DOSEN'; createdAt: string; }
interface DecodedToken { userId: string; role: 'ADMIN' | 'MAHASISWA' | 'DOSEN'; exp: number; }

export default function UserManagementPage() {
  const { token } = useAuthStore();
  const router = useRouter();

  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentUserId, setCurrentUserId] = useState('');
  
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'ALL' | 'ADMIN' | 'MAHASISWA' | 'DOSEN'>('ALL');
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [formRole, setFormRole] = useState<'MAHASISWA' | 'DOSEN'>('MAHASISWA');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchUsers = useCallback(async () => {
    if (!token) return;
    setIsLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users`, { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error('Gagal mengambil data pengguna.');
      const data = await res.json();
      setUsers(data);
    } catch (err: any) { 
      setError(err.message); 
    } finally { 
      setIsLoading(false); 
    }
  }, [token]);

  useEffect(() => {
    if (!token) { router.replace('/login'); return; }
    try {
      const decodedToken: DecodedToken = jwtDecode(token);
      if (decodedToken.role !== 'ADMIN') {
        setError('Akses ditolak. Anda bukan admin.');
        setIsLoading(false);
        return;
      }
      setCurrentUserId(decodedToken.userId);
      fetchUsers();
    } catch (e) {
      setError('Token tidak valid atau kadaluarsa.');
      setIsLoading(false);
    }
  }, [token, router, fetchUsers]);

  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) || user.email.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesRole = roleFilter === 'ALL' || user.role === roleFilter;
      return matchesSearch && matchesRole;
    });
  }, [users, searchQuery, roleFilter]);

  const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const json: any[] = XLSX.utils.sheet_to_json(worksheet);
        
        const existingEmails = new Set(users.map(u => u.email));
        const newUsers: any[] = [];
        const duplicateEmails: string[] = [];
        for (const row of json) {
          if (existingEmails.has(row.email)) {
            duplicateEmails.push(row.email);
          } else {
            newUsers.push({ name: row.name, email: row.email, password: String(row.password), role: row.role.toUpperCase() });
            existingEmails.add(row.email);
          }
        }
        if (duplicateEmails.length > 0) {
          if (!window.confirm(`${duplicateEmails.length} email sudah ada di database dan akan dilewati. Lanjutkan mengimpor ${newUsers.length} pengguna baru?`)) return;
        }
        if (newUsers.length === 0) {
            alert('Tidak ada pengguna baru untuk diimpor.');
            return;
        }
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/bulk`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify(newUsers) });
        if (!res.ok) throw new Error('Gagal mengimpor data ke server.');
        alert(`${newUsers.length} pengguna berhasil diimpor! Daftar akan diperbarui.`);
        fetchUsers();
      } catch (err) {
        alert('Gagal memproses file Excel. Pastikan format kolom benar: name, email, password, role.');
      } finally {
        if(fileInputRef.current) fileInputRef.current.value = "";
      }
    };
    reader.readAsBinaryString(file);
  };

  const handleDownloadTemplate = () => {
    const templateData = [{ name: 'Contoh Nama', email: 'contoh@email.com', password: 'password123', role: 'MAHASISWA' }];
    const worksheet = XLSX.utils.json_to_sheet(templateData);
    worksheet['!cols'] = [{ wch: 30 }, { wch: 30 }, { wch: 20 }, { wch: 20 }];
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Template Pengguna");
    XLSX.writeFile(workbook, "template_import_pengguna.xlsx");
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ name, email, password, role: formRole }) });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Gagal membuat pengguna baru.');
      }
      await fetchUsers();
      setName(''); setEmail(''); setPassword(''); setFormRole('MAHASISWA');
      setShowAddForm(false);
      alert('Pengguna baru berhasil dibuat!');
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleDeleteUser = async (userId: string) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus pengguna ini? Aksi ini tidak dapat dibatalkan.')) return;
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/${userId}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error('Gagal menghapus pengguna.');
      setUsers(users.filter(user => user.id !== userId));
      alert('Pengguna berhasil dihapus.');
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    setIsSubmitting(true);
    try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/${editingUser.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ name: editingUser.name, email: editingUser.email, role: editingUser.role }) });
        if (!res.ok) throw new Error('Gagal memperbarui pengguna.');
        await fetchUsers();
        alert('Pengguna berhasil diperbarui.');
        setEditingUser(null);
    } catch (err: any) {
        alert(err.message);
    } finally {
        setIsSubmitting(false);
    }
  };

  const handleResetPassword = async (userId: string) => {
    const newPassword = window.prompt('Masukkan password baru untuk pengguna ini:');
    if (!newPassword) {
      alert('Reset password dibatalkan.');
      return;
    }
    if (!window.confirm(`Apakah Anda yakin ingin mereset password pengguna ini menjadi "${newPassword}"?`)) return;
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/${userId}/reset-password`, { method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ password: newPassword }) });
      if (!res.ok) throw new Error('Gagal mereset password.');
      alert('Password berhasil direset.');
    } catch (err: any) {
      alert(err.message);
    }
  };

  if (isLoading && users.length === 0) return <div className="container py-8 text-center">Memuat data pengguna...</div>;
  if (error) return <div className="container py-8 text-center text-red-500">{error}</div>;

  return (
    <div className="container py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Manajemen Pengguna</h1>
        <div className="flex gap-2">
            <button onClick={handleDownloadTemplate} className="flex items-center gap-2 bg-white text-gray-700 border border-gray-300 p-2 rounded hover:bg-gray-50"><Download size={16} /> Unduh Template</button>
            <input ref={fileInputRef} type="file" accept=".xlsx, .xls" className="hidden" onChange={handleFileImport} />
            <button onClick={() => fileInputRef.current?.click()} className="flex items-center gap-2 bg-green-600 text-white p-2 rounded hover:bg-green-700"><Upload size={16} /> Import Excel</button>
            <button onClick={() => setShowAddForm(!showAddForm)} className="flex items-center gap-2 bg-brand-blue text-white p-2 rounded hover:bg-brand-blue/90"><UserPlus size={16} /> {showAddForm ? 'Tutup Form' : 'Tambah Manual'}</button>
        </div>
      </div>
      
      <div className="mb-4 p-3 border-l-4 border-yellow-400 bg-yellow-50 text-yellow-800 rounded-r-lg flex items-center gap-3">
          <Info size={20} />
          <span>Untuk impor, gunakan template yang disediakan. Kolom harus berisi: `name`, `email`, `password`, dan `role` (`MAHASISWA` atau `DOSEN`).</span>
      </div>

      {showAddForm && (
        <div className="mb-8 p-6 border rounded-lg bg-white transition-all duration-300">
          <h2 className="text-xl font-semibold mb-4">Tambah Pengguna Baru</h2>
          <form onSubmit={handleCreateUser} className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <input type="text" placeholder="Nama Lengkap" value={name} onChange={e => setName(e.target.value)} className="md:col-span-1 p-2 border rounded" required />
            <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} className="md:col-span-1 p-2 border rounded" required />
            <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} className="md:col-span-1 p-2 border rounded" required />
            <select value={formRole} onChange={e => setFormRole(e.target.value as any)} className="md:col-span-1 p-2 border rounded"><option value="MAHASISWA">Mahasiswa</option><option value="DOSEN">Dosen</option></select>
            <button type="submit" disabled={isSubmitting} className="flex justify-center items-center md:col-span-1 bg-brand-blue text-white p-2 rounded hover:bg-brand-blue/90 disabled:bg-brand-blue/50">{isSubmitting ? <Spinner /> : 'Tambah'}</button>
          </form>
        </div>
      )}

      <div className="mb-4 p-4 border rounded-lg bg-white flex justify-between items-center gap-4">
        <div className="relative flex-grow">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" placeholder="Cari berdasarkan nama atau email..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="w-full max-w-sm p-2 pl-10 border rounded" />
        </div>
        <div className="flex gap-1 bg-gray-100 p-1 rounded-md">
          {(['ALL', 'ADMIN', 'MAHASISWA', 'DOSEN'] as const).map(r => (
            <button key={r} onClick={() => setRoleFilter(r)} className={`px-3 py-1 text-sm rounded ${roleFilter === r ? 'bg-white shadow' : 'hover:bg-gray-200'}`}>{r === 'ALL' ? 'Semua' : r.charAt(0) + r.slice(1).toLowerCase()}</button>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto bg-white rounded-lg border">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50">
            <tr><th className="p-4 text-left font-semibold">Nama</th><th className="p-4 text-left font-semibold">Email</th><th className="p-4 text-left font-semibold">Peran</th><th className="p-4 text-left font-semibold">Aksi</th></tr>
          </thead>
          <tbody>
            {filteredUsers.map((user) => (
              <tr key={user.id} className="border-t">
                <td className="p-4">{user.name}</td>
                <td className="p-4">{user.email}</td>
                <td className="p-4"><span className={`px-2 py-1 text-xs rounded-full ${user.role === 'ADMIN' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'}`}>{user.role}</span></td>
                <td className="p-4">
                  <div className="flex gap-2">
                    <button onClick={() => setEditingUser(user)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-md" title="Edit Pengguna"><Edit size={16} /></button>
                    <button onClick={() => handleResetPassword(user.id)} className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-md disabled:text-gray-300" disabled={user.id === currentUserId} title="Reset Password"><KeyRound size={16} /></button>
                    <button onClick={() => handleDeleteUser(user.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-md disabled:text-gray-300" disabled={user.id === currentUserId} title="Hapus Pengguna"><Trash2 size={16} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredUsers.length === 0 && (
          <p className="text-center p-8 text-gray-500">Tidak ada pengguna yang cocok.</p>
        )}
      </div>

      {editingUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold">Edit Pengguna</h2>
                    <button onClick={() => setEditingUser(null)}><X size={24} /></button>
                </div>
                <form onSubmit={handleUpdateUser} className="space-y-4">
                    <div>
                        <label htmlFor="edit-name" className="block text-sm font-medium">Nama</label>
                        <input id="edit-name" type="text" value={editingUser.name} onChange={e => setEditingUser({ ...editingUser, name: e.target.value })} className="w-full p-2 border rounded mt-1" />
                    </div>
                    <div>
                        <label htmlFor="edit-email" className="block text-sm font-medium">Email</label>
                        <input id="edit-email" type="email" value={editingUser.email} onChange={e => setEditingUser({ ...editingUser, email: e.target.value })} className="w-full p-2 border rounded mt-1" />
                    </div>
                    <div>
                        <label htmlFor="edit-role" className="block text-sm font-medium">Peran</label>
                        <select id="edit-role" value={editingUser.role} onChange={e => setEditingUser({ ...editingUser, role: e.target.value as any })} className="w-full p-2 border rounded mt-1">
                            <option value="MAHASISWA">Mahasiswa</option><option value="DOSEN">Dosen</option><option value="ADMIN">Admin</option>
                        </select>
                    </div>
                    <div className="flex justify-end gap-4 pt-4">
                        <button type="button" onClick={() => setEditingUser(null)} className="px-4 py-2 rounded border">Batal</button>
                        <button type="submit" disabled={isSubmitting} className="px-4 py-2 rounded bg-brand-blue text-white flex items-center justify-center">{isSubmitting ? <Spinner /> : 'Simpan Perubahan'}</button>
                    </div>
                </form>
            </div>
        </div>
      )}
    </div>
  );
}