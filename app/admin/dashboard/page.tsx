'use client'
import { useEffect, useState } from 'react'
import AdminLayout from '../../components/AdminLayout'

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

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null)

  useEffect(() => {
    const token = localStorage.getItem('token')

    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/dashboard`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then(setStats)
      .catch((err) => console.error('Gagal load dashboard', err))
  }, [])

  if (!stats) return <AdminLayout><p>Loading...</p></AdminLayout>

  return (
    <AdminLayout>
      <h1 className="text-2xl font-bold mb-6">Dashboard Admin</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <StatCard label="Total Postingan" value={stats.totalPosts} />
        <StatCard label="Total Repository" value={stats.totalRepositories} />
        <StatCard label="Super Admin" value={stats.totalUsers.SUPERADMIN} />
        <StatCard label="Admin" value={stats.totalUsers.ADMIN} />
        <StatCard label="Dosen" value={stats.totalUsers.DOSEN} />
        <StatCard label="Mahasiswa" value={stats.totalUsers.MAHASISWA} />
      </div>
    </AdminLayout>
  )
}

function StatCard({ label, value }: { label: string, value: number }) {
  return (
    <div className="bg-white rounded shadow p-4 text-center">
      <p className="text-gray-500">{label}</p>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  )
}
