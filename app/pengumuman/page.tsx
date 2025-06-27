// cms-kampus-frontend/app/pengumuman/page.tsx

import PostList from '../components/PostList'
import Layout from '../components/Layout'

async function getData() {
  // PERBAIKAN: Ubah /api/post menjadi /api/posts
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/posts?type=pengumuman`) // <-- PERUBAHAN DI SINI
  
  if (!res.ok) {
    console.error("Gagal fetch:", res.statusText);
    return []; // Return array kosong supaya tidak crash jika gagal
  }

  return res.json()
}

export default async function PengumumanPage() {
  const posts = await getData()

  return (
    <Layout>
      <h1 className="text-2xl font-bold mb-4">Pengumuman Kampus</h1>
      {/* Pastikan PostList dapat menangani array kosong jika tidak ada posts */}
      <PostList posts={posts} type="pengumuman" />
    </Layout>
  )
}
