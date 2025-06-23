'use client';

import { useEffect, useState } from 'react';

type RepoItem = {
  id: number;
  title: string;
  author: string;
  abstract: string;
  fakultas: string;
  prodi: string;
};

export default function RepositoryPublicPage() {
  const [data, setData] = useState<RepoItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/repository`);
      const json = await res.json();
      setData(json);
      setLoading(false);
    };
    load();
  }, []);

  return (
    <main className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Repository Kampus</h1>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="space-y-6">
          {data.map((repo) => (
            <div key={repo.id} className="border p-4 rounded shadow-sm bg-white">
              <h2 className="text-lg font-semibold">{repo.title}</h2>
              <p className="text-sm text-gray-600 mb-1">Penulis: {repo.author}</p>
              <p className="text-sm text-gray-600 mb-1">Prodi: {repo.prodi}, Fakultas: {repo.fakultas}</p>
              <p className="mt-2 text-gray-800">{repo.abstract}</p>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
