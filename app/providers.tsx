'use client';

import { ThemeProvider } from './contexts/ThemeContext';
import { SessionProvider } from 'next-auth/react';
import { useState, useEffect } from 'react';

export function Providers({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <>
      <SessionProvider>
        <ThemeProvider>{children}</ThemeProvider>
      </SessionProvider>
      {mounted && <div id="toaster" />}
    </>
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