import Link from 'next/link';
import { Book } from 'lucide-react';

interface RepoItem {
  id: string;
  title: string;
  author: string;
  year: number;
  studyProgram: string;
}

async function getPublishedRepos(): Promise<RepoItem[]> {
    try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/repository-items`, {
            next: { revalidate: 60 } // Cache selama 1 menit
        });
        if (!res.ok) return [];
        return res.json();
    } catch (error) {
        console.error("Fetch Error:", error);
        return [];
    }
}

export default async function RepositoryListPage() {
  const items = await getPublishedRepos();

  return (
    <div className="bg-gray-50">
      <div className="container py-12">
        <h1 className="text-4xl font-bold text-center mb-8 text-brand-blue-dark">Repositori Karya Ilmiah</h1>
        
        {items.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((item) => (
              <Link href={`/repository/${item.id}`} key={item.id} className="block p-6 bg-white rounded-lg border shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all">
                <div className="flex items-start gap-4">
                  <div className="bg-blue-100 p-3 rounded-full"><Book className="h-6 w-6 text-brand-blue" /></div>
                  <div>
                    <h2 className="text-lg font-bold text-text">{item.title}</h2>
                    <p className="text-sm text-text-light mt-2">{item.author} • {item.year}</p>
                    <p className="mt-1 text-sm font-semibold text-brand-blue">{item.studyProgram}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-center text-text-light mt-16">Saat ini tidak ada karya ilmiah yang dipublikasikan.</p>
        )}
      </div>
    </div>
  );
}