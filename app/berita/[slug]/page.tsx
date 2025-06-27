    // cms-kampus-frontend/app/berita/[slug]/page.tsx

    import { notFound } from 'next/navigation';
    import Layout from '../../components/Layout';
    import { fetchAPI } from '@/app/lib/api'; // Import fetchAPI

    type Post = {
      id: number;
      title: string;
      content: string;
      createdAt: string;
      fileUrl?: string;
      imageUrl?: string; // Tambahkan imageUrl
      // Tambahkan properti lain yang mungkin dikembalikan oleh API jika perlu
    }

    export default async function BeritaDetailPage({ params }: { params: { slug: string } }) {
      // Pastikan params di-await jika ada potensi async operation pada params itu sendiri
      // Meskipun untuk slug langsung, ini bisa membantu menghilangkan warning Next.js
      const slug = await params.slug; // Tambahkan await di sini

      try {
        const res = await fetchAPI(`/api/posts/${slug}`, 'GET'); // Gunakan fetchAPI
        const post: Post = res.data; // Data ada di properti 'data' dari ApiResponse

        if (!post) {
          notFound();
        }

        return (
          <Layout>
            <div className="p-6 max-w-3xl mx-auto bg-white rounded shadow-md">
              <h1 className="text-3xl font-bold mb-2 text-gray-800">{post.title}</h1>
              <p className="text-sm text-gray-500 mb-4">
                {new Date(post.createdAt).toLocaleString('id-ID', { dateStyle: 'long', timeStyle: 'short' })}
              </p>
              {post.imageUrl && (
                <img
                  src={`${process.env.NEXT_PUBLIC_API_URL}${post.imageUrl}`}
                  alt={post.title}
                  className="w-full h-auto object-cover rounded-md mb-4"
                />
              )}
              <div
                className="prose prose-indigo max-w-none text-gray-700 leading-relaxed"
                dangerouslySetInnerHTML={{ __html: post.content }}
              />
              {post.fileUrl && (
                <a
                  href={`${process.env.NEXT_PUBLIC_API_URL}${post.fileUrl}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center mt-6 px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8 4a3 3 0 00-3 3v4a5 5 0 0010 0V7a1 1 0 112 0v4a7 7 0 11-14 0V7a5 5 0 0110 0v4a3 3 0 11-6 0V7a1 1 0 012 0v4a1 1 0 102 0V7a3 3 0 00-3-3z" clipRule="evenodd" />
                  </svg>
                  Lihat File Terkait
                </a>
              )}
            </div>
          </Layout>
        );
      } catch (error) {
        console.error('Error fetching post detail:', error);
        notFound(); // Atau tampilkan halaman error kustom
      }
    }
    