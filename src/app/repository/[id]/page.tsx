import { notFound } from 'next/navigation';
import { Download, UserCircle, Calendar, Tag, FileText, Bookmark } from 'lucide-react';

interface FileItem { id: string; alias: string; fileUrl: string; }
interface RepoDetail {
  id: string;
  title: string;
  author: string;
  year: number;
  studyProgram: string;
  abstract: string | null;
  keywords: string | null;
  advisor: string | null;
  files: FileItem[];
  publishedAt: string | null;
}

async function getRepoDetail(id: string): Promise<RepoDetail | null> {
    try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/repository-items/${id}`, {
            next: { revalidate: 3600 } // Cache selama 1 jam
        });
        if (!res.ok) return null;
        return res.json();
    } catch (error) {
        return null;
    }
}

export default async function RepositoryDetailPage({ params }: { params: { id: string } }) {
  const item = await getRepoDetail(params.id);

  if (!item) {
    notFound(); // Tampilkan halaman 404 jika item tidak ditemukan
  }

  return (
    <div className="bg-white">
        {/* Header Gambar */}
        <div className="h-48 bg-brand-blue-dark flex items-center justify-center text-center p-4">
            <h1 className="text-3xl font-bold text-white max-w-4xl">{item.title}</h1>
        </div>
        
        <div className="container py-12 grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Konten Utama */}
            <div className="lg:col-span-2">
                <div className="flex items-center gap-4 text-sm text-text-light mb-6">
                    <span>Oleh: {item.author}</span>
                    <span>•</span>
                    <span>Tahun: {item.year}</span>
                    <span>•</span>
                    <span className="font-semibold text-brand-blue">{item.studyProgram}</span>
                </div>
                
                <h2 className="text-2xl font-bold text-text mb-4">Abstrak</h2>
                <div className="prose max-w-none text-text-light">
                    {item.abstract || "Abstrak tidak tersedia."}
                </div>

                <h2 className="text-2xl font-bold text-text mt-10 mb-4">Unduhan</h2>
                <div className="border rounded-lg">
                    {item.files.map((file) => (
                        <a key={file.id} href={`${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '')}${file.fileUrl}`} target="_blank" rel="noopener noreferrer" className="flex justify-between items-center p-4 border-b last:border-b-0 hover:bg-gray-50">
                            <div className="flex items-center gap-3">
                                <FileText className="h-5 w-5 text-brand-blue" />
                                <span>{file.alias}</span>
                            </div>
                            <Download className="h-5 w-5 text-gray-400" />
                        </a>
                    ))}
                </div>
            </div>

            {/* Sidebar */}
            <aside className="space-y-6">
                <div className="p-6 border rounded-lg bg-gray-50">
                    <h3 className="text-lg font-bold mb-4">Detail Dokumen</h3>
                    <ul className="space-y-3 text-sm">
                        <li className="flex gap-3"><UserCircle className="h-5 w-5 text-text-light" /> <div><strong>Penulis:</strong><br/>{item.author}</div></li>
                        <li className="flex gap-3"><UserCircle className="h-5 w-5 text-text-light" /> <div><strong>Pembimbing:</strong><br/>{item.advisor || '-'}</div></li>
                        <li className="flex gap-3"><Calendar className="h-5 w-5 text-text-light" /> <div><strong>Tanggal Terbit:</strong><br/>{item.publishedAt ? new Date(item.publishedAt).toLocaleDateString('id-ID') : '-'}</div></li>
                        <li className="flex gap-3"><Bookmark className="h-5 w-5 text-text-light" /> <div><strong>Program Studi:</strong><br/>{item.studyProgram}</div></li>
                        <li className="flex gap-3"><Tag className="h-5 w-5 text-text-light" /> <div><strong>Kata Kunci:</strong><br/>{item.keywords || '-'}</div></li>
                    </ul>
                </div>
            </aside>
        </div>
    </div>
  );
}
