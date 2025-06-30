import React from 'react';
import Link from 'next/link';
import clsx from 'clsx';
import { RepositoryItem, UserRole } from '@/types'; // Impor tipe data
import { Download, Edit, Trash2 } from 'lucide-react';

interface RepositoryCardProps {
  item: RepositoryItem;
  role: UserRole;
}

export default function RepositoryCard({ item, role }: RepositoryCardProps) {
  const canDownload = role !== 'public';
  const canEdit = role === 'admin';

  return (
    <div className="flex h-full flex-col rounded-lg border bg-white p-6 shadow-sm transition-all hover:shadow-md">
      <div className="flex-grow">
        <p className="text-sm font-semibold text-brand-blue">{item.studyProgram}</p>
        <h3 className="mt-2 text-lg font-bold text-text">{item.title}</h3>
        <p className="mt-1 text-sm text-text-light">
          {item.author} - {item.year}
        </p>
      </div>
      <div className="mt-6 flex items-center justify-between">
        <Link
          href={canDownload ? item.fileUrl : "/login"}
          target={canDownload ? "_blank" : "_self"}
          rel="noopener noreferrer"
          className={clsx(
            "flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors",
            {
              "bg-brand-blue text-white hover:bg-brand-blue/90": canDownload,
              "bg-gray-200 text-gray-500 cursor-not-allowed": !canDownload,
            }
          )}
          aria-disabled={!canDownload}
        >
          <Download className="h-4 w-4" />
          {canDownload ? "Unduh" : "Login"}
        </Link>

        {canEdit && (
          <div className="flex gap-2">
            <button className="text-sm font-medium text-blue-600 hover:underline p-2 hover:bg-blue-50 rounded-md"><Edit className="h-4 w-4"/></button>
            <button className="text-sm font-medium text-red-600 hover:underline p-2 hover:bg-red-50 rounded-md"><Trash2 className="h-4 w-4" /></button>
          </div>
        )}
      </div>
    </div>
  );
}

