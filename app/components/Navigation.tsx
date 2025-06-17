'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/contexts/auth';
import LanguageSwitcher from './LanguageSwitcher';
import { Button } from './ui/button';
import { useTheme } from '../contexts/ThemeContext';
import { SunIcon, MoonIcon, HamburgerMenuIcon, Cross1Icon } from '@radix-ui/react-icons';

const DEFAULT_AVATAR = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23215F97"%3E%3Cpath d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"%3E%3C/path%3E%3C/svg%3E';

export default function Navigation() {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const { user, loading, signOut } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);

  const navItems = [
    { name: '我的題庫', href: '/question' },
    { name: '答題結果', href: '/result' },
    { name: '設定', href: '/settings' }
  ];

  const handleSignOut = async () => {
    try {
      setIsSigningOut(true);
      await signOut();
      router.push('/login');
    } catch (error) {
      console.error('登出時發生錯誤:', error);
      setIsSigningOut(false);
    }
  };

  if (loading) {
    return <div>載入中...</div>;
  }

  return (
    <nav className="sticky top-0 z-30 bg-mainBg shadow-lg dark:bg-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo 和導航區域 */}
          <div className="flex items-center space-x-6">
            {/* Logo */}
            <div className="flex-shrink-0">
              <Link href="/" className="text-xl font-bold text-primary dark:text-white">
                Teacoo
              </Link>
            </div>

            {/* 桌面版導航 */}
            <div className="hidden lg:flex items-center">
              <div className="flex space-x-6">
                {navItems.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`text-base font-semibold transition-colors duration-150 border-b-2 px-1.5 pb-1.5 ${
                      pathname === item.href
                        ? 'text-primary border-primary'
                        : 'text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-primary hover:border-primary'
                    }`}
                  >
                    {item.name}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* 桌面版功能區 */}
          <div className="hidden lg:flex lg:items-center lg:space-x-4">
            <div className="flex-1 flex justify-center">
              <LanguageSwitcher labelClass="text-gray-700 dark:text-gray-300" />
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              title={theme === 'light' ? '切換到深色模式' : '切換到亮色模式'}
              className="text-gray-700 dark:text-gray-300"
            >
              {theme === 'light' ? (
                <SunIcon className="h-5 w-5" />
              ) : (
                <MoonIcon className="h-5 w-5" />
              )}
            </Button>
            {user ? (
              <div className="flex items-center space-x-2">
                <button 
                  className="flex items-center space-x-2 text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors duration-150"
                  title={user.displayName || '使用者'}
                >
                  <div className="relative h-8 w-8 rounded-full overflow-hidden bg-gray-200">
                    <Image
                      src={user.photoURL || DEFAULT_AVATAR}
                      alt={`${user.displayName || '使用者'} 的頭像`}
                      fill
                      sizes="32px"
                      className="object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = DEFAULT_AVATAR;
                      }}
                    />
                  </div>
                </button>
                <Button
                  variant="ghost"
                  onClick={handleSignOut}
                  disabled={isSigningOut}
                  className="text-gray-700 dark:text-gray-300"
                >
                  {isSigningOut ? '登出中...' : '登出'}
                </Button>
              </div>
            ) : (
              <Link href="/login">
                <Button variant="default">登入</Button>
              </Link>
            )}
          </div>

          {/* 手機版選單按鈕 */}
          <div className="lg:hidden flex items-center space-x-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              title={theme === 'light' ? '切換到深色模式' : '切換到亮色模式'}
              className="text-gray-700 dark:text-gray-300"
            >
              {theme === 'light' ? (
                <SunIcon className="h-5 w-5" />
              ) : (
                <MoonIcon className="h-5 w-5" />
              )}
            </Button>
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              {isMenuOpen ? (
                <Cross1Icon className="h-6 w-6" />
              ) : (
                <HamburgerMenuIcon className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* 手機版展開選單 */}
        {isMenuOpen && (
          <div className="lg:hidden pb-4">
            {user && (
              <div className="flex items-center space-x-2 px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                <div className="relative h-8 w-8 rounded-full overflow-hidden bg-gray-200">
                  <Image
                    src={user.photoURL || DEFAULT_AVATAR}
                    alt={`${user.displayName || '使用者'} 的頭像`}
                    fill
                    sizes="32px"
                    className="object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = DEFAULT_AVATAR;
                    }}
                  />
                </div>
                <span className="text-gray-700 dark:text-gray-300">
                  {user.displayName || '使用者'}
                </span>
                <Button
                  variant="ghost"
                  onClick={handleSignOut}
                  disabled={isSigningOut}
                  className="ml-auto text-gray-700 dark:text-gray-300"
                >
                  {isSigningOut ? '登出中...' : '登出'}
                </Button>
              </div>
            )}
            <div className="space-y-1 px-3 pt-3">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`
                    block px-3 py-2 rounded-md text-base font-medium transition-colors duration-150
                    ${pathname === item.href
                      ? 'bg-primary text-white'
                      : 'text-gray-700 dark:text-gray-300 dark:hover:bg-gray-700'}
                  `}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
              {!user && (
                <Link href="/login" className="block px-3 py-2">
                  <Button variant="default" className="w-full">登入</Button>
                </Link>
              )}
              <div className="mt-4 px-3">
                <LanguageSwitcher labelClass="text-gray-700 dark:text-gray-300" />
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
