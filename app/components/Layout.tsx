    // cms-kampus-frontend/app/components/Layout.tsx
    import React from 'react';
    import Navbar from './Navbar'; // Pastikan import Navbar di sini

    interface LayoutProps {
      children: React.ReactNode;
    }

    const Layout: React.FC<LayoutProps> = ({ children }) => {
      return (
        <div>
          <Navbar /> {/* Navbar harus ada di sini */}
          <main className="container mx-auto px-4 py-8">
            {children}
          </main>
          {/* Opsional: Footer */}
          {/* <footer className="bg-gray-800 text-white p-4 text-center mt-8">
            <p>&copy; 2024 CMS Kampus. All rights reserved.</p>
          </footer> */}
        </div>
      );
    };

    export default Layout;
    