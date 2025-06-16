'use client';

import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider } from '@/lib/contexts/auth';
import { useState, useEffect } from 'react';
import { Toaster } from 'sonner';

export function Providers({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <AuthProvider>
      <ThemeProvider>
        {children}
        <Toaster />
      </ThemeProvider>
    </AuthProvider>
  );
} 