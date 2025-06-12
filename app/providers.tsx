'use client';

import { ThemeProvider } from './contexts/ThemeContext';
import { SessionProvider } from 'next-auth/react';
import { Toaster } from 'sonner';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SessionProvider>
        <ThemeProvider>{children}</ThemeProvider>
      </SessionProvider>
      <Toaster />
    </>
  );
} 