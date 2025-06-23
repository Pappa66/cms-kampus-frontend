import Link from 'next/link'

type Props = {
  posts: {
    id: string
    title: string
    slug: string
    createdAt: string
  }[]
  type?: 'berita' | 'pengumuman'
}

export default function PostList({ posts, type = 'berita' }: Props) {
  return (
    <ul className="space-y-4">
      {posts.map(post => (
        <li key={post.id} className="border-b pb-2">
          <Link href={`/${type}/${post.slug}`}>
            <h2 className="text-lg font-semibold hover:text-blue-600">
              {post.title}
            </h2>
          </Link>
          <p className="text-sm text-gray-500">
            {new Date(post.createdAt).toLocaleString()}
          </p>
        </li>
      ))}
    </ul>
  )
}
