'use client';

import { useState } from 'react';

export default function PostUploadForm({ onSuccess }: { onSuccess: () => void }) {
  const [title, setTitle] = useState('');
  const [type, setType] = useState('berita');
  const [content, setContent] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : '';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData();
    formData.append('title', title);
    formData.append('type', type);
    formData.append('content', content);
    if (file) formData.append('file', file);

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/post`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    setLoading(false);
    if (res.ok) {
      setTitle('');
      setContent('');
      setFile(null);
      onSuccess();
    } else {
      const data = await res.json();
      alert(data.message || 'Gagal mengunggah konten');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-4 rounded shadow mb-6">
      <h2 className="text-lg font-bold mb-4">Upload Konten</h2>

      <input
        type="text"
        className="w-full border p-2 mb-2"
        placeholder="Judul"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
      />

      <select
        className="w-full border p-2 mb-2"
        value={type}
        onChange={(e) => setType(e.target.value)}
      >
        <option value="berita">Berita</option>
        <option value="pengumuman">Pengumuman</option>
        <option value="profil">Profil</option>
      </select>

      <textarea
        className="w-full border p-2 mb-2"
        placeholder="Konten HTML atau teks"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        rows={5}
        required
      />

      <input
        type="file"
        className="w-full border p-2 mb-2"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
      />

      <button
        type="submit"
        className="bg-blue-600 text-white px-4 py-2 rounded"
        disabled={loading}
      >
        {loading ? 'Mengirim...' : 'Kirim'}
      </button>
    </form>
  );
}
