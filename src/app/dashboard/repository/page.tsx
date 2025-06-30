import Link from 'next/link';
import { Book } from 'lucide-react';

// Definisikan tipe data yang diharapkan dari API
interface RepoItem {
  id: string;
  title: string;
  author: string;
  year: number;
  studyProgram: string;
}

// Fungsi untuk mengambil data dari backend
async function getPublishedRepos(): Promise<RepoItem[]> {
    try {
        const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/repository-items`;
        const res = await fetch(apiUrl, {
            next: { revalidate: 60 } // Cache data ini selama 1 menit
        });

        if (!res.ok) {
            console.error(`Error fetching repository items: ${res.status} ${res.statusText}`);
            return [];
        }
        
        const data = await res.json();
        return Array.isArray(data) ? data : [];
    } catch (error) {
        console.error("Fetch Error in getPublishedRepos:", error);
        return [];
    }
}

export default async function RepositoryListPage() {
  const items = await getPublishedRepos();

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-800">Repositori Karya Ilmiah</h1>
            <p className="mt-2 text-lg text-gray-600">Jelajahi koleksi skripsi dan penelitian dari civitas akademika STISIP Syamsul Ulum.</p>
        </div>
        
        {items.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((item) => (
              <Link href={`/repository/${item.id}`} key={item.id} className="block p-6 bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                <div className="flex items-start gap-4">
                  <div className="bg-blue-100 p-3 rounded-full">
                    <Book className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-gray-900 line-clamp-2">{item.title}</h2>
                    <p className="text-sm text-gray-500 mt-2">{item.author} • {item.year}</p>
                    <p className="mt-1 text-sm font-semibold text-blue-700">{item.studyProgram}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center text-gray-500 mt-16">
            <h3 className="text-xl font-semibold">Belum Ada Karya Ilmiah</h3>
            <p className="mt-2">Saat ini tidak ada karya ilmiah yang dipublikasikan. Silakan kembali lagi nanti.</p>
          </div>
        )}
      </div>
    </div>
  );
}
