'use client'
import Link from 'next/link'
import { useEffect, useState } from 'react'

type Menu = {
  name: string
  url: string
}

export default function Navbar() {
  const [menus, setMenus] = useState<Menu[]>([])

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/menus`)
      .then(res => res.json())
      .then(setMenus)
  }, [])

  return (
    <nav className="bg-white shadow px-4 py-3 flex justify-between items-center">
      <Link href="/" className="text-xl font-bold text-blue-600">
        CMS Kampus
      </Link>
      <ul className="flex gap-4 text-sm">
        {menus.map(menu => (
          <li key={menu.url}>
            <Link href={menu.url} className="hover:text-blue-600">
              {menu.name}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  )
}
