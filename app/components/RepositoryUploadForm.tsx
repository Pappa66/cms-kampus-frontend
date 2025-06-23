'use client';

import { useState } from 'react';

export default function RepositoryUploadForm({ onUploadSuccess }: { onUploadSuccess: () => void }) {
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [abstract, setAbstract] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return alert('File belum dipilih.');

    const token = localStorage.getItem('token');
    if (!token) return alert('Unauthorized.');

    const formData = new FormData();
    formData.append('title', title);
    formData.append('author', author);
    formData.append('abstract', abstract);
    formData.append('file', file);

    setLoading(true);
    setMsg('');

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/repository`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    const data = await res.json();
    if (res.ok) {
      setMsg('Upload berhasil!');
      setTitle('');
      setAuthor('');
      setAbstract('');
      setFile(null);
      onUploadSuccess();
    } else {
      setMsg(data.message || 'Gagal upload');
    }

    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-4 rounded shadow mb-8">
      <h2 className="text-lg font-bold mb-4">Upload Repository</h2>

      {msg && <p className="text-sm mb-2">{msg}</p>}

      <div className="mb-2">
        <label className="block mb-1">Judul</label>
        <input type="text" className="w-full border px-3 py-2 rounded" required value={title} onChange={(e) => setTitle(e.target.value)} />
      </div>
      <div className="mb-2">
        <label className="block mb-1">Penulis</label>
        <input type="text" className="w-full border px-3 py-2 rounded" required value={author} onChange={(e) => setAuthor(e.target.value)} />
      </div>
      <div className="mb-2">
        <label className="block mb-1">Abstrak</label>
        <textarea className="w-full border px-3 py-2 rounded" required value={abstract} onChange={(e) => setAbstract(e.target.value)} />
      </div>
      <div className="mb-4">
        <label className="block mb-1">File</label>
        <input type="file" className="w-full" onChange={(e) => setFile(e.target.files?.[0] || null)} />
      </div>

      <button type="submit" disabled={loading} className="bg-indigo-600 text-white px-4 py-2 rounded">
        {loading ? 'Uploading...' : 'Upload'}
      </button>
    </form>
  );
}
