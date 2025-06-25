'use client'
import { useEffect, useState } from 'react'
import AdminLayout from '../../components/AdminLayout'
import { useRouter } from 'next/navigation'

type Stats = {
  totalPosts: number
  totalRepositories: number
  totalUsers: {
    SUPERADMIN: number
    ADMIN: number
    DOSEN: number
    MAHASISWA: number
  }
}

// Asumsi fetchAPI Anda ada dan bisa mengirim token
interface ApiResponse {
  message: string;
  data?: any;
}

const fetchAPI = async (
  endpoint: string,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE',
  token: string,
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
    // Tangani error khusus untuk 401/403
    if (response.status === 401 || response.status === 403) {
      throw new Error('Unauthorized or Forbidden: Please login again.');
    }
    throw new Error(errorData.message || `API Error: ${response.statusText}`);
  }

  return response.json();
};


export default function AdminDashboard() {
  const router = useRouter()
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const token = localStorage.getItem('token')

    if (!token) {
      router.push('/login-admin')
      return
    }

    const fetchDashboardStats = async () => {
      try {
        setLoading(true)
        setError(null) // Reset error state

        const response = await fetchAPI('/api/admin/dashboard', 'GET', token) // Pastikan endpoint ini benar

        if (response.data) {
          // Normalisasi data totalUsers untuk memastikan semua role ada dengan nilai 0 jika tidak ada
          const normalizedStats: Stats = {
            totalPosts: response.data.totalPosts || 0,
            totalRepositories: response.data.totalRepositories || 0,
            totalUsers: {
              SUPERADMIN: response.data.totalUsers?.SUPERADMIN || 0,
              ADMIN: response.data.totalUsers?.ADMIN || 0,
              DOSEN: response.data.totalUsers?.DOSEN || 0,
              MAHASISWA: response.data.totalUsers?.MAHASISWA || 0,
            },
          };
          setStats(normalizedStats);
        } else {
          setError('Gagal memuat statistik dashboard: Data tidak ditemukan.');
        }
      } catch (err: any) {
        console.error('Error fetching dashboard stats:', err);
        setError(err.message || 'Terjadi kesalahan saat memuat data.');
        if (err.message === 'Unauthorized or Forbidden: Please login again.') {
          localStorage.removeItem('token');
          localStorage.removeItem('userRole');
          router.push('/login-admin');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardStats();
  }, [router])

  if (loading) return (
    <AdminLayout>
      <p className="text-center py-8">Memuat data dashboard...</p>
    </AdminLayout>
  )

  if (error) return (
    <AdminLayout>
      <p className="text-red-500 text-center py-8">Error: {error}</p>
    </AdminLayout>
  )

  // Pastikan stats dan totalUsers ada sebelum merender StatCard
  if (!stats || !stats.totalUsers) {
    return (
      <AdminLayout>
        <p className="text-center py-8">Data statistik tidak lengkap atau tidak tersedia.</p>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <h1 className="text-2xl font-bold mb-6">Dashboard Admin</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Menggunakan optional chaining (?.) untuk akses yang lebih aman */}
        <StatCard label="Total Postingan" value={stats.totalPosts} />
        <StatCard label="Total Repository" value={stats.totalRepositories} />
        <StatCard label="Super Admin" value={stats.totalUsers?.SUPERADMIN || 0} />
        <StatCard label="Admin" value={stats.totalUsers?.ADMIN || 0} />
        <StatCard label="Dosen" value={stats.totalUsers?.DOSEN || 0} />
        <StatCard label="Mahasiswa" value={stats.totalUsers?.MAHASISWA || 0} />
      </div>
    </AdminLayout>
  )
}

function StatCard({ label, value }: { label: string, value: number }) {
  return (
    <div className="bg-white rounded-lg shadow p-4 text-center">
      <p className="text-gray-500 text-sm">{label}</p>
      <p className="text-3xl font-bold text-indigo-600 mt-1">{value}</p>
    </div>
  )
}
