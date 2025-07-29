'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');

    if (!token) {
      router.replace('/login'); // redirect to login if no token
    } else {
      setIsCheckingAuth(false); // allow access
    }
  }, [router]);

  if (isCheckingAuth) {
    return <div>Checking authentication...</div>; // loading state
  }

  return <>{children}</>;
}
