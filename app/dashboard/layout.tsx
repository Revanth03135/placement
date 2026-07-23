import Providers from '@/components/Providers';
import Navbar from '@/components/Navbar';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Providers>
      <div className="dashboard-layout">
        <Navbar />
        <main className="main-content">{children}</main>
      </div>
    </Providers>
  );
}
