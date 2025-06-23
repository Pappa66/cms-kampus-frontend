
import PostList from '../components/PostList'
import Layout from '../components/Layout'

const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000'

async function getData() {
  try {
    const res = await fetch(`${baseUrl}/api/post?type=berita`, {
      cache: 'no-store',
    })

    if (!res.ok) {
      throw new Error(`Gagal fetch data: ${res.statusText}`)
    }

    return res.json()
  } catch (error) {
    console.error('Error fetch berita:', error)
    return [] // supaya tetap aman saat gagal
  }
}

export default async function BeritaPage() {
  const posts = await getData()

  return (
    <Layout>
      <h1 className="text-2xl font-bold mb-4">Daftar Berita</h1>
      <PostList posts={posts} type="berita" />
    </Layout>
  )
}
