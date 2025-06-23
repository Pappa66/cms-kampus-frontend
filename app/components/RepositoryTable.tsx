'use client';

import React, { useState } from 'react';
import RepositoryEditModal from './RepositoryEditModal';

type RepoItem = {
  id: number;
  title: string;
  author: string;
  abstract: string;
  fileUrl: string;
};

type Props = {
  data: RepoItem[];
  onReload: () => void;
};

export default function RepositoryTable({ data, onReload }: Props) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : '';
  const [editRepo, setEditRepo] = useState<RepoItem | null>(null);

  const handleDelete = async (id: number) => {
    if (!confirm('Yakin hapus data ini?')) return;
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/repository/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (res.ok) {
      alert('Berhasil dihapus');
      onReload();
    } else {
      alert('Gagal menghapus');
    }
  };

  return (
    <>
      <div className="overflow-x-auto mt-4">
        <table className="w-full table-auto border border-gray-300 bg-white">
          <thead>
            <tr className="bg-gray-200 text-left">
              <th className="px-4 py-2 border">Judul</th>
              <th className="px-4 py-2 border">Penulis</th>
              <th className="px-4 py-2 border">Abstrak</th>
              <th className="px-4 py-2 border">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50">
                <td className="px-4 py-2 border">{item.title}</td>
                <td className="px-4 py-2 border">{item.author}</td>
                <td className="px-4 py-2 border">{item.abstract}</td>
                <td className="px-4 py-2 border space-x-2">
                  <a
                    href={`${process.env.NEXT_PUBLIC_API_URL}/api/repository/${item.id}/download`}
                    className="text-blue-600 underline"
                  >
                    Download
                  </a>
                  <button
                    onClick={() => setEditRepo(item)}
                    className="text-yellow-600 hover:underline"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="text-red-600 hover:underline"
                  >
                    Hapus
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <RepositoryEditModal
        visible={!!editRepo}
        onClose={() => setEditRepo(null)}
        repo={editRepo}
        onUpdated={onReload}
      />
    </>
  );
}
