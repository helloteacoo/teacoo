// src/layouts/MainLayout.tsx
import { NavLink, Outlet } from "react-router-dom";
import LanguageSwitcher from "../components/LanguageSwitcher";

export default function MainLayout() {
  const tabs = [
    { to: "/library", label: "我的題庫" },
    { to: "/result", label: "答題結果" },
    { to: "/settings", label: "設定" },
  ];

  return (
    <div className="relative min-h-screen bg-grayBg">
      {/* ✅ 語言切換固定在右上角 */}
      <LanguageSwitcher labelClass="text-white" />
      <nav className="bg-primary">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center">
              <div className="shrink-0">
                <img
                  className="size-8"
                  src="https://tailwindcss.com/plus-assets/img/logos/mark.svg?color=indigo&shade=500"
                  alt="Logo"
                />
              </div>
              <div className="hidden md:block">
                <div className="ml-10 flex items-baseline space-x-4">
                  {tabs.map((tab) => (
                    <NavLink
                      key={tab.to}
                      to={tab.to}
                      className={({ isActive }) =>
                        `rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                          isActive
                          ? "bg-accent text-white"
                          : "text-white hover:bg-accent/80 active:bg-accent"
                        }`
                      }
                    >
                      {tab.label}
                    </NavLink>
                  ))}
                </div>
              </div>
            </div>
            <div className="hidden md:block">
              <div className="ml-4 flex items-center md:ml-6">
                <button
                  type="button"
                  className="relative rounded-full bg-primary p-1 text-white hover:text-white focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-primary"
                >
                  <span className="sr-only">View notifications</span>
                  <svg className="size-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" />
                  </svg>
                </button>
                <div className="relative ml-3">
                  <div>
                    <button
                      type="button"
                      className="relative flex max-w-xs items-center rounded-full bg-primary text-sm focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-primary"
                    >
                      <span className="sr-only">Open user menu</span>
                      <img
                        className="size-8 rounded-full"
                        src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e"
                        alt=""
                      />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <main>
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 text-text">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
