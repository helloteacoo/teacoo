'use client';

import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider } from '@/lib/contexts/auth';
import { useState, useEffect } from 'react';

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
      </ThemeProvider>
    </AuthProvider>
  );
}

// 動態導入 Toaster
import('sonner').then(({ Toaster }) => {
  if (typeof document !== 'undefined') {
    const toasterContainer = document.getElementById('toaster');
    if (toasterContainer) {
      const toasterElement = document.createElement('div');
      toasterContainer.appendChild(toasterElement);
      // @ts-ignore
      ReactDOM.createPortal(<Toaster />, toasterElement);
    }
  }
}); 