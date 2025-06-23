'use client'
import React from 'react'
import Navbar from './Navbar'

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <Navbar />
      <main className="flex-1 p-4 max-w-4xl mx-auto">{children}</main>
      <footer className="text-center py-4 text-sm text-gray-500 border-t">
        &copy; {new Date().getFullYear()} Kampus XYZ
      </footer>
    </div>
  )
}
