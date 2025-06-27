// cms-kampus-frontend/app/profil/page.tsx

import Layout from '../components/Layout'

async function getData() {
  // PERBAIKAN: Ubah /api/post menjadi /api/posts
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/posts?type=profil`, { // <-- PERUBAHAN DI SINI
    next: { revalidate: 60 }, // SSR caching 60s
  })

  if (!res.ok) {
    console.error("Gagal fetch:", res.statusText);
    return []; // Return array kosong sebagai fallback
  }

  return res.json()
}

export default async function ProfilPage() {
  const data = await getData()

  return (
    <Layout>
      {/* Perbaiki typo "profilerofil Kamprofileus" menjadi "Profil Kampus" */}
      <h1 className="text-2xl font-bold mb-6">Profil Kampus</h1> 
      {data.length === 0 ? (
        <p className="text-gray-600">Belum ada konten profil yang tersedia.</p>
      ) : (
        data.map((item: any) => (
          <div key={item.id} className="mb-8 bg-white rounded shadow p-4">
            <h2 className="text-xl font-semibold text-blue-700">{item.title}</h2>
            <p className="text-sm text-gray-500 mb-2">
              {new Date(item.createdAt).toLocaleDateString('id-ID', { dateStyle: 'long' })} {/* Format tanggal lebih baik */}
            </p>
            <div
              className="prose max-w-none text-gray-700" // Tambah warna teks default
              dangerouslySetInnerHTML={{ __html: item.content }}
            />
            {item.fileUrl && (
              <a
                href={`${process.env.NEXT_PUBLIC_API_URL}${item.fileUrl}`} // Pastikan URL file lengkap dengan /uploads
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block mt-4 text-blue-600 hover:underline"
              >
                📎 Lihat File Terkait
              </a>
            )}
          </div>
        ))
      )}
    </Layout>
  )
}
