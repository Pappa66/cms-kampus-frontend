import Layout from './components/Layout'

export default function HomePage() {
  return (
    <Layout>
      <div className="text-center py-12 bg-gradient-to-r from-blue-700 to-blue-500 text-white rounded shadow mb-6">
        <h1 className="text-4xl font-bold mb-2">Selamat Datang di CMS Kampus</h1>
        <p className="text-lg">Informasi Terpercaya. Akses Mudah. Untuk Semua Civitas Akademika.</p>
      </div>
      <section className="grid md:grid-cols-3 gap-4">
        <div className="p-4 bg-white rounded shadow">
          <h2 className="font-semibold text-lg">Berita</h2>
          <p className="text-sm text-gray-600">Lihat berita terkini seputar kampus.</p>
        </div>
        <div className="p-4 bg-white rounded shadow">
          <h2 className="font-semibold text-lg">Pengumuman</h2>
          <p className="text-sm text-gray-600">Pengumuman resmi dari pihak kampus.</p>
        </div>
        <div className="p-4 bg-white rounded shadow">
          <h2 className="font-semibold text-lg">Repository</h2>
          <p className="text-sm text-gray-600">Skripsi & jurnal mahasiswa/dosen.</p>
        </div>
      </section>
    </Layout>
  )
}
