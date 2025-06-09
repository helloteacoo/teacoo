import type { AppProps } from 'next/app'
import { I18nextProvider } from 'react-i18next';
import i18n from '../i18n';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase';
import Head from 'next/head';

// 全局樣式
import '@/styles/globals.css'
// AG Grid 樣式
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
// 自定義樣式
import '../styles/agGridCustom.css';

// 不需要認證的頁面路徑
const publicPaths = ['/', '/register', '/LoginPage'];

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setAuthChecked(true);
      const currentPath = router.pathname;
      
      if (!user && !publicPaths.includes(currentPath)) {
        router.push('/LoginPage');
      }
    });

    return () => unsubscribe();
  }, [router]);

  if (!authChecked) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <Head>
        <link rel="icon" href="/favicon.ico" />
        <title>Teacoo</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <I18nextProvider i18n={i18n}>
        <Component {...pageProps} />
      </I18nextProvider>
    </>
  );
}