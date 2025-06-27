    // cms-kampus-frontend/app/layout.tsx

    import './globals.css'
    // import Navbar from './components/Navbar' // Hapus baris ini jika ada

    export const metadata = {
      title: 'CMS Kampus',
      description: 'Content Management System for University',
    }

    export default function RootLayout({
      children,
    }: {
      children: React.ReactNode
    }) {
      return (
        <html lang="en">
          <body>
            {/* Hapus <Navbar /> di sini jika sudah ada di components/Layout.tsx */}
            {children}
          </body>
        </html>
      )
    }
    