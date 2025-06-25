    // cms-kampus-frontend/app/components/Navbar.tsx

    'use client';

    import Link from 'next/link';
    import { usePathname, useRouter } from 'next/navigation';
    import React, { useState, useEffect } from 'react';

    const Navbar: React.FC = () => {
      const pathname = usePathname();
      const router = useRouter();
      const [isMenuOpen, setIsMenuOpen] = useState(false);
      const [isLoggedIn, setIsLoggedIn] = useState(false); // State untuk status login

      useEffect(() => {
        const token = localStorage.getItem('token');
        setIsLoggedIn(!!token); // Set isLoggedIn berdasarkan keberadaan token
      }, []); // Cek sekali saat komponen di-mount

      const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('userRole'); // Hapus juga role saat logout
        setIsLoggedIn(false);
        router.push('/login-admin');
      };

      return (
        <nav className="bg-white border-gray-200 px-4 lg:px-6 py-2.5 shadow-md">
          <div className="flex flex-wrap justify-between items-center mx-auto max-w-screen-xl">
            <Link href="/" className="flex items-center">
              <span className="self-center text-xl font-semibold whitespace-nowrap text-blue-800">CMS Kampus</span>
            </Link>
            <div className="flex items-center md:order-2">
              {isLoggedIn ? (
                <button
                  onClick={handleLogout}
                  className="text-gray-800 hover:bg-gray-50 focus:ring-4 focus:ring-gray-300 font-medium rounded-lg text-sm px-4 lg:px-5 py-2 lg:py-2.5 mr-2 focus:outline-none"
                >
                  Logout
                </button>
              ) : (
                <Link href="/login-admin" className="text-gray-800 hover:bg-gray-50 focus:ring-4 focus:ring-gray-300 font-medium rounded-lg text-sm px-4 lg:px-5 py-2 lg:py-2.5 mr-2 focus:outline-none">
                  Login Admin
                </Link>
              )}

              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                type="button"
                className="inline-flex items-center p-2 ml-1 text-sm text-gray-500 rounded-lg md:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200"
                aria-controls="mobile-menu-2"
                aria-expanded={isMenuOpen}
              >
                <span className="sr-only">Open main menu</span>
                <svg
                  className="w-6 h-6"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fillRule="evenodd"
                    d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                    clipRule="evenodd"
                  ></path>
                </svg>
                <svg
                  className="hidden w-6 h-6"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fillRule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  ></path>
                </svg>
              </button>
            </div>
            <div
              className={`${isMenuOpen ? 'block' : 'hidden'} justify-between items-center w-full md:flex md:w-auto md:order-1`}
              id="mobile-menu-2"
            >
              <ul className="flex flex-col mt-4 font-medium md:flex-row md:space-x-8 md:mt-0">
                <li>
                  <Link
                    href="/"
                    className={`block py-2 pr-4 pl-3 rounded md:bg-transparent md:p-0 ${
                      pathname === '/' ? 'text-blue-700' : 'text-gray-700 hover:text-blue-700'
                    }`}
                    aria-current={pathname === '/' ? 'page' : undefined}
                  >
                    Home
                  </Link>
                </li>
                <li>
                  <Link
                    href="/berita"
                    className={`block py-2 pr-4 pl-3 rounded md:bg-transparent md:p-0 ${
                      pathname === '/berita' ? 'text-blue-700' : 'text-gray-700 hover:text-blue-700'
                    }`}
                  >
                    Berita
                  </Link>
                </li>
                <li>
                  <Link
                    href="/pengumuman"
                    className={`block py-2 pr-4 pl-3 rounded md:bg-transparent md:p-0 ${
                      pathname === '/pengumuman' ? 'text-blue-700' : 'text-gray-700 hover:text-blue-700'
                    }`}
                  >
                    Pengumuman
                  </Link>
                </li>
                <li>
                  <Link
                    href="/profil"
                    className={`block py-2 pr-4 pl-3 rounded md:bg-transparent md:p-0 ${
                      pathname === '/profil' ? 'text-blue-700' : 'text-gray-700 hover:text-blue-700'
                    }`}
                  >
                    Profil
                  </Link>
                </li>
                <li>
                  <Link
                    href="/repository"
                    className={`block py-2 pr-4 pl-3 rounded md:bg-transparent md:p-0 ${
                      pathname === '/repository' ? 'text-blue-700' : 'text-gray-700 hover:text-blue-700'
                    }`}
                  >
                    Repository
                  </Link>
                </li>
                <li>
                  <Link
                    href="/kontak"
                    className={`block py-2 pr-4 pl-3 rounded md:bg-transparent md:p-0 ${
                      pathname === '/kontak' ? 'text-blue-700' : 'text-gray-700 hover:text-blue-700'
                    }`}
                  >
                    Kontak
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </nav>
      );
    };

    export default Navbar;
    