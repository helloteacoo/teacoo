'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { auth } from '@/lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('light');

  // 從 localStorage 和 Firestore 載入主題設定
  useEffect(() => {
    const loadTheme = async () => {
      // 先從 localStorage 讀取
      const savedTheme = localStorage.getItem('theme') as Theme;
      
      // 如果用戶已登入，從 Firestore 讀取
      const user = auth.currentUser;
      if (user) {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        const userTheme = userDoc.data()?.theme as Theme;
        if (userTheme) {
          setTheme(userTheme);
          localStorage.setItem('theme', userTheme);
          return;
        }
      }
      
      // 如果沒有儲存的主題，使用系統預設
      if (!savedTheme) {
        const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        setTheme(systemTheme);
        localStorage.setItem('theme', systemTheme);
      } else {
        setTheme(savedTheme);
      }
    };

    loadTheme();
  }, []);

  // 監聽登入狀態變化
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        const userTheme = userDoc.data()?.theme as Theme;
        if (userTheme) {
          setTheme(userTheme);
          localStorage.setItem('theme', userTheme);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  // 切換主題
  const toggleTheme = async () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);

    // 如果用戶已登入，儲存到 Firestore
    const user = auth.currentUser;
    if (user) {
      await setDoc(doc(db, 'users', user.uid), {
        theme: newTheme
      }, { merge: true });
    }
  };

  // 更新 HTML 的 class
  useEffect(() => {
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(theme);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
} 