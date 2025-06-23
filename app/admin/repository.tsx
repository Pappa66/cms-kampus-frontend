'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AdminLayout from '@/components/AdminLayout';
import RepositoryTable from '@/components/RepositoryTable';
import RepositoryUploadForm from '@/components/RepositoryUploadForm';

export default function RepositoryAdminPage() {
  const router = useRouter();
  const [repositories, setRepositories] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = () => {
    const token = localStorage.getItem('token');
    if (!token) return router.push('/login-admin');

    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/repository`)
      .then(res => res.json())
      .then(data => {
        setRepositories(data.data || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <AdminLayout>
      <h1 className="text-2xl font-bold mb-6">Data Repository Kampus</h1>
      <RepositoryUploadForm onUploadSuccess={fetchData} />
      {loading ? <p>Loading...</p> : <RepositoryTable data={repositories} onReload={fetchData} />}
    </AdminLayout>
  );
}
