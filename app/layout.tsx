import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Placement OD Manager - PSG College of Technology',
  description: 'Manage placement drive OD forms for CSE(AI&ML) 4th Year students',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
