// cms-kampus-frontend/app/admin/users/page.tsx

'use client';

import React, { useState, useEffect } from 'react';
import AdminLayout from '@/app/components/AdminLayout';
import Notification from '@/app/components/Notification';
import FormInput from '@/app/components/FormInput'; // Import FormInput
import FormSelect from '@/app/components/FormSelect'; // Import FormSelect
import { fetchAPI } from '@/app/lib/api';
import { useRouter } from 'next/navigation';

interface User {
  id: string;
  username: string;
  email: string;
  name: string | null;
  role: 'SUPERADMIN' | 'ADMIN' | 'DOSEN' | 'MAHASISWA';
  createdAt: string;
  updatedAt: string;
  biodata?: {
    name: string;
    nim?: string;
    nidn?: string;
    prodi?: string;
    fakultas?: string;
    tgl_lahir?: string; // Tanggal lahir mungkin string dari API
  } | null;
  adminAccess?: {
    canEdit: boolean;
    canDelete: boolean;
    canView: boolean;
    canDownload: boolean;
  } | null;
}

interface NotificationState {
  message: string;
  type: 'success' | 'error' | 'info';
}

export default function UserManagementPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [notification, setNotification] = useState<NotificationState | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false); // State untuk modal
  const [currentUser, setCurrentUser] = useState<User | null>(null); // State untuk user yang sedang diedit/ditambah
  const router = useRouter();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login-admin');
        return;
      }
      const response = await fetchAPI('/api/admin/users', 'GET', token);
      if (response.data) {
        setUsers(response.data);
      }
    } catch (error: any) {
      console.error('Failed to fetch users:', error);
      setNotification({ message: error.message || 'Gagal mengambil data pengguna.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (userId: string) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus pengguna ini?')) {
      return;
    }
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login-admin');
        return;
      }
      const response = await fetchAPI(`/api/admin/users/${userId}`, 'DELETE', token);
      setNotification({ message: response.message || 'Pengguna berhasil dihapus.', type: 'success' });
      fetchUsers(); // Refresh daftar pengguna
    } catch (error: any) {
      console.error('Failed to delete user:', error);
      setNotification({ message: error.message || 'Gagal menghapus pengguna.', type: 'error' });
    }
  };

  const handleOpenModal = (user: User | null) => {
    setCurrentUser(user);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentUser(null);
  };

  const handleSaveUser = () => {
    handleCloseModal();
    fetchUsers(); // Refresh daftar user setelah simpan
    setNotification({ message: 'Pengguna berhasil disimpan!', type: 'success' });
  };

  const closeNotification = () => setNotification(null);

  if (loading) {
    return (
      <AdminLayout>
        <p>Memuat daftar pengguna...</p>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <h1 className="text-2xl font-bold mb-6">Manajemen Pengguna</h1>

      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={closeNotification}
        />
      )}

      <div className="bg-white p-6 rounded-lg shadow-md mb-8 overflow-x-auto">
        <div className="flex justify-end mb-4">
          <button
            onClick={() => handleOpenModal(null)} // Tombol tambah user baru
            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Tambah Pengguna Baru
          </button>
        </div>
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Nama
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Username
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Email
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Role
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Aksi
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-500">
                  Tidak ada pengguna ditemukan.
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {user.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {user.username}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {user.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {user.role}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => handleOpenModal(user)} // Tombol Edit user
                      className="text-indigo-600 hover:text-indigo-900 mr-4"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(user.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Hapus
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <UserFormModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onSave={handleSaveUser}
          user={currentUser}
        />
      )}
    </AdminLayout>
  );
}

// UserFormModal Component
interface UserFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  user: User | null;
}

const UserFormModal: React.FC<UserFormModalProps> = ({ isOpen, onClose, onSave, user }) => {
  const [formData, setFormData] = useState({
    username: user?.username || '',
    email: user?.email || '',
    password: '', // Password tidak di-load, harus diisi saat edit
    name: user?.name || '',
    role: user?.role || 'MAHASISWA', // Default role
    // Biodata fields for new user
    nim: user?.biodata?.nim || '',
    nidn: user?.biodata?.nidn || '',
    prodi: user?.biodata?.prodi || '',
    fakultas: user?.biodata?.fakultas || '',
    tgl_lahir: user?.biodata?.tgl_lahir ? new Date(user.biodata.tgl_lahir).toISOString().split('T')[0] : '', // Format tanggal untuk input
  });
  const [notification, setNotification] = useState<NotificationState | null>(null);
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login-admin');
        return;
      }

      const payload: any = {
        username: formData.username,
        email: formData.email,
        name: formData.name,
        role: formData.role,
      };

      if (formData.password) { // Hanya kirim password jika diisi
        payload.password = formData.password;
      }

      // Tambahkan biodata jika ada
      const biodata = {
        name: formData.name,
        nim: formData.nim,
        nidn: formData.nidn,
        prodi: formData.prodi,
        fakultas: formData.fakultas,
        tgl_lahir: formData.tgl_lahir ? new Date(formData.tgl_lahir).toISOString() : undefined,
      };

      // Pastikan biodata hanya dikirim jika ada nilai yang relevan
      const hasBiodata = Object.values(biodata).some(val => val !== '' && val !== undefined);
      if (hasBiodata) {
        payload.biodata = biodata;
      }


      let response;
      if (user && user.id) {
        // Update User
        response = await fetchAPI(`/api/admin/users/${user.id}`, 'PUT', token, payload);
      } else {
        // Create New User
        response = await fetchAPI('/api/admin/users', 'POST', token, payload);
      }
      setNotification({ message: response.message || 'Pengguna berhasil disimpan!', type: 'success' });
      onSave(); // Panggil onSave untuk refresh data di parent
    } catch (error: any) {
      console.error('Failed to save user:', error);
      setNotification({ message: error.message || 'Gagal menyimpan pengguna.', type: 'error' });
    }
  };

  const closeNotification = () => setNotification(null);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex justify-center items-center">
      <div className="relative p-8 bg-white w-full max-w-2xl rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold mb-4">{user ? 'Edit Pengguna' : 'Tambah Pengguna Baru'}</h2>
        
        {notification && (
          <Notification
            message={notification.message}
            type={notification.type}
            onClose={closeNotification}
          />
        )}

        <form onSubmit={handleSubmit}>
          <FormInput
            label="Nama Lengkap"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
          <FormInput
            label="Username"
            name="username"
            value={formData.username}
            onChange={handleChange}
            required
          />
          <FormInput
            label="Email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
          <FormInput
            label="Password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            placeholder={user ? "Biarkan kosong jika tidak ingin mengubah" : "Masukkan password"}
            required={!user} // Required only for new users
          />
          <FormSelect
            label="Role"
            name="role"
            value={formData.role}
            onChange={handleChange}
            options={[
              { value: 'MAHASISWA', label: 'Mahasiswa' },
              { value: 'DOSEN', label: 'Dosen' },
              { value: 'ADMIN', label: 'Admin' },
              { value: 'SUPERADMIN', label: 'Superadmin' },
            ]}
            required
          />

          {/* Biodata Fields (Optional for all roles, but important for Mahasiswa/Dosen) */}
          <h3 className="text-xl font-semibold mt-6 mb-4">Detail Biodata (Opsional)</h3>
          <FormInput
            label="NIM (Mahasiswa)"
            name="nim"
            value={formData.nim}
            onChange={handleChange}
            placeholder="Nomor Induk Mahasiswa"
          />
          <FormInput
            label="NIDN (Dosen)"
            name="nidn"
            value={formData.nidn}
            onChange={handleChange}
            placeholder="Nomor Induk Dosen Nasional"
          />
          <FormInput
            label="Program Studi"
            name="prodi"
            value={formData.prodi}
            onChange={handleChange}
            placeholder="Program Studi"
          />
          <FormInput
            label="Fakultas"
            name="fakultas"
            value={formData.fakultas}
            onChange={handleChange}
            placeholder="Fakultas"
          />
          <FormInput
            label="Tanggal Lahir"
            name="tgl_lahir"
            type="date"
            value={formData.tgl_lahir}
            onChange={handleChange}
          />

          <div className="flex justify-end space-x-4 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Batal
            </button>
            <button
              type="submit"
              className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Simpan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
