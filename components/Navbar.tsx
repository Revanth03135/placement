'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';

import { useState } from 'react';

export default function Navbar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const links = [
    { href: '/dashboard/add', label: 'Add Event' },
    { href: '/dashboard/students', label: 'Add Students' },
    { href: '/dashboard/records', label: 'Records' },
  ];

  return (
    <nav className="navbar">
      <span className="navbar-brand">Placement OD Manager</span>

      <button className="hamburger-btn" onClick={() => setIsMobileMenuOpen(true)}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="3" y1="12" x2="21" y2="12"></line>
          <line x1="3" y1="6" x2="21" y2="6"></line>
          <line x1="3" y1="18" x2="21" y2="18"></line>
        </svg>
      </button>

      <div className={`sidebar-overlay ${isMobileMenuOpen ? 'open' : ''}`} onClick={() => setIsMobileMenuOpen(false)}></div>

      <div className={`sidebar-wrapper ${isMobileMenuOpen ? 'open' : ''}`}>
        <button className="sidebar-close-btn" onClick={() => setIsMobileMenuOpen(false)}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>

        <ul className="navbar-nav">
          {links.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className={`nav-link ${pathname === link.href ? 'active' : ''}`}
                onClick={() => setIsMobileMenuOpen(false)}
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
            onClick={() => {
              setIsMobileMenuOpen(false);
              signOut({ callbackUrl: '/login' });
            }}
          >
            Sign out
          </button>
        </div>
      </div>
    </nav>
  );
}
