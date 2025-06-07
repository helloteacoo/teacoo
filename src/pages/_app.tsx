import type { AppProps } from 'next/app'
import { I18nextProvider } from 'react-i18next';
import i18n from '../i18n';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase';

// 全局樣式
import '@/styles/globals.css'
// AG Grid 樣式
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
// 自定義樣式
import '../styles/agGridCustom.css';

// 不需要認證的頁面路徑
const publicPaths = ['/', '/register'];

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setAuthChecked(true);
      const isPublicPath = publicPaths.includes(router.pathname);

      if (!user && !isPublicPath) {
        // 如果用戶未登入且不在公開頁面，重定向到登入頁
        router.push('/');
      } else if (user && isPublicPath && router.pathname !== '/register') {
        // 如果用戶已登入且在登入頁，重定向到 LibraryPage
        router.push('/LibraryPage');
      }
    });

    return () => unsubscribe();
  }, [router.pathname]);

  // 在認證狀態檢查完成前不渲染內容
  if (!authChecked) {
    return <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
    </div>;
  }

  return (
    <I18nextProvider i18n={i18n}>
      <Component {...pageProps} />
    </I18nextProvider>
  );
} 