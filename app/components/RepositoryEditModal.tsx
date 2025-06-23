'use client';

import { useEffect, useState } from 'react';

export default function RepositoryEditModal({ visible, onClose, repo, onUpdated }: {
  visible: boolean;
  onClose: () => void;
  repo: any;
  onUpdated: () => void;
}) {
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [abstract, setAbstract] = useState('');
  const [loading, setLoading] = useState(false);
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : '';

  useEffect(() => {
    if (repo) {
      setTitle(repo.title);
      setAuthor(repo.author);
      setAbstract(repo.abstract);
    }
  }, [repo]);

  const handleUpdate = async () => {
    setLoading(true);
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/repository/${repo.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ title, author, abstract })
    });

    setLoading(false);
    if (res.ok) {
      alert('Update berhasil!');
      onUpdated();
      onClose();
    } else {
      const data = await res.json();
      alert(data.message || 'Update gagal');
    }
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded shadow w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">Edit Repository</h2>

        <div className="mb-2">
          <label className="block mb-1">Judul</label>
          <input type="text" value={title} onChange={e => setTitle(e.target.value)} className="w-full border px-3 py-2 rounded" />
        </div>

        <div className="mb-2">
          <label className="block mb-1">Penulis</label>
          <input type="text" value={author} onChange={e => setAuthor(e.target.value)} className="w-full border px-3 py-2 rounded" />
        </div>

        <div className="mb-2">
          <label className="block mb-1">Abstrak</label>
          <textarea value={abstract} onChange={e => setAbstract(e.target.value)} className="w-full border px-3 py-2 rounded" />
        </div>

        <div className="flex justify-end space-x-2 mt-4">
          <button onClick={onClose} className="px-4 py-2 bg-gray-300 rounded">Batal</button>
          <button onClick={handleUpdate} disabled={loading} className="px-4 py-2 bg-indigo-600 text-white rounded">
            {loading ? 'Menyimpan...' : 'Simpan'}
          </button>
        </div>
      </div>
    </div>
  );
}
