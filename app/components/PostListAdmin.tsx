import React from 'react'

type Post = {
  id: number
  title: string
  slug: string
  createdAt: string
  type: string
  fileUrl?: string
}

type Props = {
  posts: Post[]
  onDelete: (id: number) => void
}

export default function PostListAdmin({ posts, onDelete }: Props) {
  if (!posts || posts.length === 0) {
    return <p className="text-gray-600">Belum ada data konten.</p>
  }

  return (
    <div className="space-y-4">
      {posts.map((post) => (
        <div key={post.id} className="p-4 border rounded shadow bg-white">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="font-bold text-lg text-blue-700">{post.title}</h2>
              <p className="text-sm text-gray-500">
                {new Date(post.createdAt).toLocaleDateString()} • {post.type}
              </p>
            </div>
            <div className="space-x-2">
              <a
                href={`/berita/${post.slug}`}
                className="px-3 py-1 bg-green-100 text-green-800 rounded text-sm"
              >
                Preview
              </a>
              <button
                onClick={() => onDelete(post.id)}
                className="px-3 py-1 bg-red-100 text-red-700 rounded text-sm"
              >
                Hapus
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
