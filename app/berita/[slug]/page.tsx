// cms-kampus-frontend/app/berita/[slug]/page.tsx

import Layout from '@/app/components/Layout';
import { notFound } from 'next/navigation';
import Link from 'next/link';

interface Post {
  id: number;
  title: string;
  slug: string;
  content: string;
  imageUrl?: string;
  fileUrl?: string;
  type: string;
  createdAt: string;
  updatedAt: string;
}

interface BeritaDetailPageProps {
  params: { slug: string };
}

// Fungsi asinkron untuk mengambil data post
async function getPostBySlug(slug: string): Promise<Post | null> { // Mengembalikan Post atau null
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/posts/${slug}`, {
      cache: 'no-store',
    });

    if (!res.ok) {
      console.error(`Gagal fetch data untuk slug ${slug}: ${res.status} ${res.statusText}`);
      // Jangan langsung panggil notFound() di sini. Kembalikan null.
      return null; 
    }
    
    const result = await res.json();
    if (result.data) {
      return result.data;
    } else {
      console.warn(`Data post untuk slug ${slug} tidak ditemukan di respons.`);
      return null;
    }
  } catch (error: any) {
    console.error(`Error fetching post detail for slug ${slug}:`, error);
    return null; // Kembalikan null jika ada error
  }
}

export default async function BeritaDetailPage({ params }: BeritaDetailPageProps) {
  // Tambahkan await untuk params.slug untuk menghilangkan warning Next.js
  const slug = await params.slug;

  const post = await getPostBySlug(slug);

  if (!post) {
    // Jika post tidak ditemukan atau ada error, tampilkan halaman 404
    notFound(); 
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <article className="bg-white p-6 rounded-lg shadow-lg">
          <h1 className="text-3xl font-bold mb-4 text-gray-800">{post.title}</h1>
          <p className="text-sm text-gray-500 mb-4">
            Dipublikasikan pada: {new Date(post.createdAt).toLocaleDateString('id-ID')}
          </p>

          {post.imageUrl && (
            <img
              src={`${process.env.NEXT_PUBLIC_API_URL}${post.imageUrl}`}
              alt={post.title}
              className="w-full h-64 object-cover rounded-md mb-6"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.onerror = null;
                target.src = "https://placehold.co/600x400/CCCCCC/FFFFFF?text=Gambar+Tidak+Tersedia";
              }}
            />
          )}

          <div
            className="prose max-w-none text-gray-700 leading-relaxed"
            dangerouslySetInnerHTML={{ __html: post.content }}
          ></div>

          {post.fileUrl && (
            <div className="mt-8">
              <a
                href={`${process.env.NEXT_PUBLIC_API_URL}${post.fileUrl}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Unduh Dokumen
                <svg className="ml-2 -mr-1 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                </svg>
              </a>
            </div>
          )}

          <div className="mt-8 pt-4 border-t border-gray-200">
            <Link href="/berita" className="text-blue-600 hover:underline">
              &larr; Kembali ke Berita
            </Link>
          </div>
        </article>
      </div>
    </Layout>
  );
}
