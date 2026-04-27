'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getSession } from '@/lib/storage';
import Dashboard from '@/components/Dashboard';

export default function DashboardPage() {
  const router = useRouter();

  useEffect(() => {
    const session = getSession();
    if (!session) {
      router.replace('/login');
    }
  }, [router]);

  const session = typeof window !== 'undefined' ? getSession() : null;
  if (!session) return null;

  return <Dashboard session={session} />;
}
