'use client';
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronRight, Home } from 'lucide-react';

export default function Breadcrumbs() {
  const pathname = usePathname();
  const pathSegments = pathname.split('/').filter(segment => segment);

  return (
    <nav className="flex items-center gap-2 text-sm text-gray-500">
      <Link href="/dashboard" className="hover:text-brand-blue flex items-center gap-1.5">
        <Home size={14} />
        Dashboard
      </Link>
      {pathSegments.slice(1).map((segment, index) => {
        const href = `/${pathSegments.slice(0, index + 2).join('/')}`;
        const isLast = index === pathSegments.length - 2;
        const name = segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' ');

        return (
          <React.Fragment key={href}>
            <ChevronRight size={16} />
            <Link
              href={href}
              className={isLast ? "font-semibold text-gray-800" : "hover:text-brand-blue"}
            >
              {name}
            </Link>
          </React.Fragment>
        );
      })}
    </nav>
  );
}
