'use client';

import React, { useState, useEffect } from 'react';
import AdminLayout from '@/app/components/AdminLayout'; // Path relatif yang umum digunakan
import FormInput from '@/app/components/FormInput'; // Komponen FormInput Anda
import Notification from '@/app/components/Notification'; // Komponen Notification Anda
import { useRouter } from 'next/navigation';

// Asumsi fetchAPI Anda ada dan bisa mengirim token (seperti yang sudah kita diskusikan)
// Jika Anda masih menggunakan fetch() langsung, sesuaikan function di bawah ini
interface ApiResponse {
  message: string;
  data?: any;
}

const fetchAPI = async (
  endpoint: string,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE',
  token: string, // Token wajib untuk endpoint admin
  body?: any
): Promise<ApiResponse> => {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  };

  const config: RequestInit = {
    method: method,
    headers: headers,
  };

  if (body) {
    config.body = JSON.stringify(body);
  }

  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${endpoint}`, config);

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || `API Error: ${response.statusText}`);
  }

  return response.json();
};


interface User {
  id: string;
  username?: string | null; // Opsional karena di skema Prisma dibuat String?
  name?: string | null;     // Opsional
  email: string;
  role: 'SUPERADMIN' | 'ADMIN' | 'DOSEN' | 'MAHASISWA';
  createdAt: string;
  updatedAt: string;
  biodata?: {
    name: string;
    nim?: string | null;
    nidn?: string | null;
    prodi?: string | null;
    fakultas?: string | null;
    tgl_lahir: string;
  };
  adminAccess?: {
    canEdit: boolean;
    canDelete: boolean;
    canView: boolean;
    canDownload: boolean;
  };
}

interface NotificationState {
  message: string;
  type: 'success' | 'error' | 'info';
}

type UserForm = Partial<Omit<User, 'id' | 'createdAt' | 'updatedAt'>> & {
  password?: string; // Password hanya untuk input form, tidak ada di User interface
};

export default function UserManagementPage() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [form, setForm] = useState<UserForm>({
    username: '',
    email: '',
    password: '',
    name: '',
    role: 'MAHASISWA', // Default role saat membuat user
    biodata: {
      name: '',
      tgl_lahir: new Date().toISOString().split('T')[0], // Format YYYY-MM-DD
    },
    adminAccess: {
      canEdit: false, canDelete: false, canView: true, canDownload: false
    }
  });
  const [notification, setNotification] = useState<NotificationState | null>(null);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentUserRole, setCurrentUserRole] = useState<string | null>(null); // Role dari user yang sedang login

  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('userRole'); // Ambil role user yang login
    setCurrentUserRole(role);

    if (!token || role !== 'SUPERADMIN') {
      // Hanya Superadmin yang boleh mengakses halaman ini
      router.push('/login-admin'); // Atau halaman unauthorized
      return;
    }
    fetchUsers();
  }, [router]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No token found.');

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type, checked } = e.target as HTMLInputElement;

    // Handle nested biodata and adminAccess fields
    if (name.startsWith('biodata.')) {
      const field = name.split('.')[1];
      setForm(prevForm => ({
        ...prevForm,
        biodata: {
          ...prevForm.biodata,
          [field]: type === 'date' ? new Date(value).toISOString() : value,
        } as any // Cast to any to bypass strict type checking for dynamic field
      }));
    } else if (name.startsWith('adminAccess.')) {
      const field = name.split('.')[1];
      setForm(prevForm => ({
        ...prevForm,
        adminAccess: {
          ...prevForm.adminAccess,
          [field]: checked,
        } as any
      }));
    } else {
      setForm({
        ...form,
        [name]: value,
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No token found.');

      // Clone form data to modify before sending
      const dataToSend: any = { ...form };

      // Clean up biodata if not applicable or empty
      if (dataToSend.biodata && Object.values(dataToSend.biodata).every(val => val === '' || val === null || val === undefined)) {
        delete dataToSend.biodata;
      } else if (dataToSend.biodata && dataToSend.biodata.tgl_lahir) {
        // Ensure tgl_lahir is a valid ISO string date
        dataToSend.biodata.tgl_lahir = new Date(dataToSend.biodata.tgl_lahir).toISOString();
      }

      // Clean up adminAccess if not applicable or empty
      if (dataToSend.role !== 'ADMIN' && dataToSend.role !== 'SUPERADMIN') {
        delete dataToSend.adminAccess;
      } else if (dataToSend.adminAccess && Object.values(dataToSend.adminAccess).every(val => val === '' || val === null || val === undefined || val === false || val === true)) {
        // If all adminAccess fields are default (false/true) or empty, ensure it's not sent if not needed
        // Or ensure it's only sent if the role applies
        // This logic can be refined based on exact requirements for default adminAccess
      }

      let response;
      if (editingUserId) {
        // Update existing user
        response = await fetchAPI(`/api/admin/users/${editingUserId}`, 'PUT', token, dataToSend);
        setNotification({ message: response.message || 'Pengguna berhasil diperbarui!', type: 'success' });
      } else {
        // Create new user
        response = await fetchAPI('/api/admin/users', 'POST', token, dataToSend);
        setNotification({ message: response.message || 'Pengguna berhasil dibuat!', type: 'success' });
      }
      resetForm(); // Reset form and editing state
      fetchUsers(); // Refresh user list
    } catch (error: any) {
      console.error('Failed to save user:', error);
      setNotification({ message: error.message || 'Gagal menyimpan pengguna.', type: 'error' });
    }
  };

  const handleEdit = (user: User) => {
    // Populate form with user data for editing
    setForm({
      username: user.username || '',
      email: user.email,
      password: '', // Password should not be pre-filled
      name: user.name || '',
      role: user.role,
      biodata: user.biodata ? {
        name: user.biodata.name,
        nim: user.biodata.nim || '',
        nidn: user.biodata.nidn || '',
        prodi: user.biodata.prodi || '',
        fakultas: user.biodata.fakultas || '',
        tgl_lahir: user.biodata.tgl_lahir ? new Date(user.biodata.tgl_lahir).toISOString().split('T')[0] : '',
      } : { // Default empty biodata if not present
        name: '', nim: '', nidn: '', prodi: '', fakultas: '', tgl_lahir: new Date().toISOString().split('T')[0],
      },
      adminAccess: user.adminAccess ? {
        canEdit: user.adminAccess.canEdit,
        canDelete: user.adminAccess.canDelete,
        canView: user.adminAccess.canView,
        canDownload: user.adminAccess.canDownload,
      } : { // Default empty adminAccess if not present
        canEdit: false, canDelete: false, canView: true, canDownload: false
      }
    });
    setEditingUserId(user.id);
    setNotification(null); // Clear notification
  };

  const handleDelete = async (id: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus pengguna ini?')) {
      try {
        const token = localStorage.getItem('token');
        if (!token) throw new Error('No token found.');

        const response = await fetchAPI(`/api/admin/users/${id}`, 'DELETE', token);
        setNotification({ message: response.message || 'Pengguna berhasil dihapus!', type: 'success' });
        fetchUsers(); // Refresh user list
      } catch (error: any) {
        console.error('Failed to delete user:', error);
        setNotification({ message: error.message || 'Gagal menghapus pengguna.', type: 'error' });
      }
    }
  };

  const resetForm = () => {
    setForm({
      username: '',
      email: '',
      password: '',
      name: '',
      role: 'MAHASISWA',
      biodata: {
        name: '',
        tgl_lahir: new Date().toISOString().split('T')[0],
      },
      adminAccess: {
        canEdit: false, canDelete: false, canView: true, canDownload: false
      }
    });
    setEditingUserId(null);
    setNotification(null);
  };

  const closeNotification = () => setNotification(null);


  // Render hanya jika userRole adalah SUPERADMIN
  if (currentUserRole !== 'SUPERADMIN') {
    return (
      <AdminLayout>
        <p className="text-red-500 text-center py-8">Anda tidak memiliki akses ke halaman ini. Hanya Superadmin yang diizinkan.</p>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <h1 className="text-2xl font-bold mb-6">Manajemen Akun Pengguna</h1>

      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={closeNotification}
        />
      )}

      {/* Form Tambah/Edit Pengguna */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-xl font-semibold mb-4">{editingUserId ? 'Edit Pengguna' : 'Tambah Pengguna Baru'}</h2>
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <FormInput
              label="Username"
              name="username"
              type="text"
              value={form.username || ''}
              onChange={handleChange}
              required
            />
            <FormInput
              label="Email"
              name="email"
              type="email"
              value={form.email || ''}
              onChange={handleChange}
              required
            />
            <FormInput
              label="Password"
              name="password"
              type="password"
              value={form.password || ''}
              onChange={handleChange}
              placeholder={editingUserId ? 'Biarkan kosong jika tidak ingin mengubah password' : ''}
              required={!editingUserId} // Password required only for new user
            />
            <FormInput
              label="Nama Lengkap"
              name="name"
              type="text"
              value={form.name || ''}
              onChange={handleChange}
              required
            />
            <div>
              <label htmlFor="role" className="block text-sm font-medium text-gray-700">Peran (Role)</label>
              <select
                id="role"
                name="role"
                value={form.role || 'MAHASISWA'}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                required
              >
                <option value="MAHASISWA">MAHASISWA</option>
                <option value="DOSEN">DOSEN</option>
                <option value="ADMIN">ADMIN</option>
                <option value="SUPERADMIN">SUPERADMIN</option>
              </select>
            </div>
          </div>

          {/* Biodata Fields */}
          <h3 className="text-lg font-semibold mb-3 border-b pb-2">Biodata (Opsional)</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <FormInput
              label="Nama di Biodata"
              name="biodata.name"
              type="text"
              value={form.biodata?.name || ''}
              onChange={handleChange}
              placeholder="Sama dengan nama lengkap jika ada"
            />
             <FormInput
              label="Tanggal Lahir"
              name="biodata.tgl_lahir"
              type="date"
              value={form.biodata?.tgl_lahir ? new Date(form.biodata.tgl_lahir).toISOString().split('T')[0] : ''}
              onChange={handleChange}
            />
            {form.role === 'MAHASISWA' && (
              <>
                <FormInput
                  label="NIM"
                  name="biodata.nim"
                  type="text"
                  value={form.biodata?.nim || ''}
                  onChange={handleChange}
                />
                <FormInput
                  label="Prodi"
                  name="biodata.prodi"
                  type="text"
                  value={form.biodata?.prodi || ''}
                  onChange={handleChange}
                />
                <FormInput
                  label="Fakultas"
                  name="biodata.fakultas"
                  type="text"
                  value={form.biodata?.fakultas || ''}
                  onChange={handleChange}
                />
              </>
            )}
            {form.role === 'DOSEN' && (
              <>
                <FormInput
                  label="NIDN"
                  name="biodata.nidn"
                  type="text"
                  value={form.biodata?.nidn || ''}
                  onChange={handleChange}
                />
                <FormInput
                  label="Prodi"
                  name="biodata.prodi"
                  type="text"
                  value={form.biodata?.prodi || ''}
                  onChange={handleChange}
                />
                <FormInput
                  label="Fakultas"
                  name="biodata.fakultas"
                  type="text"
                  value={form.biodata?.fakultas || ''}
                  onChange={handleChange}
                />
              </>
            )}
          </div>

          {/* Admin Access Fields (Hanya tampil jika role adalah Admin atau Superadmin) */}
          {(form.role === 'ADMIN' || form.role === 'SUPERADMIN') && (
            <>
              <h3 className="text-lg font-semibold mb-3 border-b pb-2">Admin Access (Opsional)</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="flex items-center">
                  <input
                    id="canView"
                    name="adminAccess.canView"
                    type="checkbox"
                    checked={form.adminAccess?.canView || false}
                    onChange={handleChange}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <label htmlFor="canView" className="ml-2 block text-sm text-gray-900">Bisa Melihat</label>
                </div>
                <div className="flex items-center">
                  <input
                    id="canEdit"
                    name="adminAccess.canEdit"
                    type="checkbox"
                    checked={form.adminAccess?.canEdit || false}
                    onChange={handleChange}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <label htmlFor="canEdit" className="ml-2 block text-sm text-gray-900">Bisa Mengedit</label>
                </div>
                <div className="flex items-center">
                  <input
                    id="canDelete"
                    name="adminAccess.canDelete"
                    type="checkbox"
                    checked={form.adminAccess?.canDelete || false}
                    onChange={handleChange}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <label htmlFor="canDelete" className="ml-2 block text-sm text-gray-900">Bisa Menghapus</label>
                </div>
                <div className="flex items-center">
                  <input
                    id="canDownload"
                    name="adminAccess.canDownload"
                    type="checkbox"
                    checked={form.adminAccess?.canDownload || false}
                    onChange={handleChange}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <label htmlFor="canDownload" className="ml-2 block text-sm text-gray-900">Bisa Mengunduh</label>
                </div>
              </div>
            </>
          )}

          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="submit"
              className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              {editingUserId ? 'Perbarui Pengguna' : 'Tambah Pengguna'}
            </button>
            {editingUserId && (
              <button
                type="button"
                onClick={resetForm}
                className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Batal Edit
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Daftar Pengguna */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Daftar Pengguna</h2>
        {loading ? (
          <p>Memuat pengguna...</p>
        ) : users.length === 0 ? (
          <p>Belum ada pengguna yang terdaftar.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Username</th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama</th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Peran</th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((user) => (
                  <tr key={user.id} className="bg-white border-b hover:bg-gray-50">
                    <td className="py-3 px-4 whitespace-nowrap">{user.username || '-'}</td>
                    <td className="py-3 px-4 whitespace-nowrap">{user.name || '-'}</td>
                    <td className="py-3 px-4">{user.email}</td>
                    <td className="py-3 px-4">{user.role}</td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleEdit(user)}
                        className="font-medium text-blue-600 hover:underline mr-3"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(user.id)}
                        className="font-medium text-red-600 hover:underline"
                      >
                        Hapus
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
