'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
  const router = useRouter();
  
  useEffect(() => {
    // Login = Register, redirect to login
    router.replace('/login');
  }, [router]);
  
  return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-gray-500">Redirecting to login...</p>
    </div>
  );
}