'use client';

import { SessionProvider, useSession, signOut } from 'next-auth/react';
import { useEffect } from 'react';

function SessionGuardian({ children }: { children: React.ReactNode }) {
  const { status } = useSession();

  useEffect(() => {
    // If the session expires while the user is active/idle on the dashboard, force logout
    if (status === 'unauthenticated') {
      signOut({ callbackUrl: '/login' });
    }
  }, [status]);

  // Seed students on first dashboard load if they don't exist
  useEffect(() => {
    fetch('/api/seed', { method: 'POST' }).catch(() => {});
  }, []);

  return <>{children}</>;
}

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    // refetchInterval={5 * 60} pings the server every 5 minutes to verify the token is still valid
    <SessionProvider refetchInterval={5 * 60}>
      <SessionGuardian>{children}</SessionGuardian>
    </SessionProvider>
  );
}
