'use client';

import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider } from '@/lib/contexts/auth';
import { Toaster } from 'sonner';
import '@/app/i18n';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <ThemeProvider>
        {children}
        <Toaster />
      </ThemeProvider>
    </AuthProvider>
  );
}