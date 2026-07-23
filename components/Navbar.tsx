'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';

export default function Navbar() {
  const pathname = usePathname();
  const { data: session } = useSession();

  const links = [
    { href: '/dashboard/add', label: 'Add Event' },
    { href: '/dashboard/students', label: 'Add Students' },
    { href: '/dashboard/records', label: 'Records' },
  ];

  return (
    <nav className="navbar">
      <span className="navbar-brand">Placement OD Manager</span>

      <ul className="navbar-nav">
        {links.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              className={`nav-link ${pathname === link.href ? 'active' : ''}`}
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>

      <div className="navbar-actions">
        <span className="navbar-user">{session?.user?.name || ''}</span>
        <button
          className="btn-logout"
          onClick={() => signOut({ callbackUrl: '/login' })}
        >
          Sign out
        </button>
      </div>
    </nav>
  );
}
