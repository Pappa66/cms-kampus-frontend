import PostList from '../components/PostList'
import Layout from '../components/Layout'

async function getData() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/post?type=pengumuman`)
  
  if (!res.ok) {
    console.error("Gagal fetch:", res.statusText);
    return[];  
  }

  return res.json()
}

export default async function PengumumanPage() {
  const posts = await getData()

  return (
    <Layout>
      <h1 className="text-2xl font-bold mb-4">Pengumuman Kampus</h1>
      <PostList posts={posts} type="pengumuman" />
    </Layout>
  )
}
