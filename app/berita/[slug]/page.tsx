import { notFound } from 'next/navigation'
import Layout from '../../components/Layout'

type Post = {
  title: string
  content: string
  createdAt: string
  fileUrl?: string
}

export default async function BeritaDetailPage({ params }: { params: { slug: string } }) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/post/${params.slug}`, {
    cache: 'no-store',
  })

  if (!res.ok) {
    notFound() // lebih sesuai untuk App Router
  }

  const post: Post = await res.json()

  return (
    <Layout>
      <div className="p-6 max-w-3xl mx-auto bg-white rounded shadow">
        <h1 className="text-2xl font-bold mb-2">{post.title}</h1>
        <p className="text-sm text-gray-500 mb-4">
          {new Date(post.createdAt).toLocaleString()}
        </p>
        <div
          className="prose max-w-none"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />
        {post.fileUrl && (
          <a
            href={`${process.env.NEXT_PUBLIC_API_URL}/${post.fileUrl}`}
            target="_blank"
            rel="noopener noreferrer"
            className="block mt-4 text-blue-600 underline"
          >
            📎 Lihat File Terkait
          </a>
        )}
      </div>
    </Layout>
  )
}
