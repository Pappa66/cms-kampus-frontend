    // cms-kampus-frontend/app/kontak/page.tsx

    import Layout from '../components/Layout';
    import Link from 'next/link';

    export default function KontakPage() {
      return (
        <Layout>
          <div className="container mx-auto px-4 py-8">
            <h1 className="text-2xl font-bold mb-6 text-gray-800">Hubungi Kami</h1>
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <p className="text-lg text-gray-700 mb-4">
                Jika Anda memiliki pertanyaan, saran, atau membutuhkan bantuan, jangan ragu untuk menghubungi kami melalui informasi di bawah ini:
              </p>

              <div className="mb-6">
                <h2 className="text-xl font-semibold mb-2 text-gray-800">Alamat Kami</h2>
                <p className="text-gray-700">Jl. Contoh Universitas No. 123</p>
                <p className="text-gray-700">Kota Pendidikan, Kode Pos 40000</p>
                <p className="text-gray-700">Negara Indonesia</p>
              </div>

              <div className="mb-6">
                <h2 className="text-xl font-semibold mb-2 text-gray-800">Informasi Kontak</h2>
                <p className="text-gray-700">Email: <a href="mailto:info@kampus.ac.id" className="text-blue-600 hover:underline">info@kampus.ac.id</a></p>
                <p className="text-gray-700">Telepon: <a href="tel:+62123456789" className="text-blue-600 hover:underline">+62 123 4567 89</a></p>
              </div>

              <div className="mb-6">
                <h2 className="text-xl font-semibold mb-2 text-gray-800">Jam Operasional</h2>
                <p className="text-gray-700">Senin - Jumat: 08.00 - 16.00 WIB</p>
                <p className="text-gray-700">Sabtu, Minggu, dan Hari Libur Nasional: Tutup</p>
              </div>

              <p className="text-gray-700">
                Kami berkomitmen untuk memberikan tanggapan secepatnya.
              </p>

              <div className="mt-8">
                <Link href="/" className="text-blue-600 hover:underline">
                  &larr; Kembali ke Beranda
                </Link>
              </div>
            </div>
          </div>
        </Layout>
      );
    }
    