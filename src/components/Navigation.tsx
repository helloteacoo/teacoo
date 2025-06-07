  'use client';

  import React from 'react';
  import Link from 'next/link';
  import { useRouter } from 'next/router';
  import LanguageSwitcher from './LanguageSwitcher';

  export default function Navigation() {
    const router = useRouter();

    const navItems = [
      { name: '我的題庫', href: '/QuestionPage' },
      { name: '答題結果', href: '/ResultPage' },
      { name: '設定', href: '/SettingsPage' }
    ];

    return (
      <nav className="sticky top-0 z-30 bg-mainBg shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <div className="flex space-x-6">
                {navItems.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`text-base font-semibold transition-colors duration-150 border-b-2 px-1.5 pb-1.5 ${
                      router.pathname === item.href
                        ? 'text-primary border-primary'
                        : 'text-gray-700 border-transparent hover:text-primary hover:border-primary'
                    }`}
                    
                  >
                    {item.name}
                  </Link>
                ))}
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <button className="text-gray-700 hover:text-primary hover:bg-gray-100 rounded-full p-2 transition-colors duration-150">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </button>

              <button className="flex items-center space-x-2 text-gray-700 hover:text-primary hover:bg-gray-100 rounded-full transition-colors duration-150">
                <img
                  src="/default-avatar.png"
                  alt="User avatar"
                  className="h-8 w-8 rounded-full bg-white"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23215F97"%3E%3Cpath d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"%3E%3C/path%3E%3C/svg%3E';
                  }}
                />
              </button>

              <div className="ml-2">
                <LanguageSwitcher labelClass="text-gray-700" />
              </div>
            </div>
          </div>
        </div>
      </nav>
    );
  }
