import { Fragment } from 'react';
import { Menu, Transition } from '@headlessui/react';
import {
  Bars3Icon,
  BellIcon,
  SunIcon,
  MoonIcon,
  ArrowRightOnRectangleIcon,
  UserCircleIcon,
} from '@heroicons/react/24/outline';
import { useAuthStore } from '@/stores/authStore';
import { useThemeStore } from '@/stores/themeStore';
import { cn, getUserRoleLabel } from '@/utils/helpers';

interface HeaderProps {
  onMenuClick: () => void;
}

export default function Header({ onMenuClick }: HeaderProps) {
  const { user, logout } = useAuthStore();
  const { theme, setTheme } = useThemeStore();

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <header className="h-20 bg-white/80 dark:bg-dark-900/50 backdrop-blur-lg border-b border-gray-200 dark:border-dark-800 flex items-center justify-between px-4 lg:px-8 sticky top-0 z-30">
      {/* Left side */}
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2.5 rounded-xl bg-gray-100 dark:bg-dark-800 hover:bg-gray-200 dark:hover:bg-dark-700 transition-colors"
        >
          <Bars3Icon className="w-5 h-5 text-gray-600 dark:text-dark-300" />
        </button>

        {/* Search - Optional */}
        <div className="hidden md:flex items-center">
          <div className="relative">
            <input
              type="text"
              placeholder="Search..."
              className="w-64 px-4 py-2.5 bg-gray-100 dark:bg-dark-800 border border-gray-200 dark:border-dark-700 rounded-xl text-sm text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-dark-500 focus:outline-none focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-600 focus:border-gray-400 dark:focus:border-gray-500 transition-all"
            />
            <kbd className="absolute right-3 top-1/2 -translate-y-1/2 px-2 py-0.5 bg-gray-200 dark:bg-dark-700 rounded text-xs text-gray-500 dark:text-dark-400 font-mono">
              ⌘K
            </kbd>
          </div>
        </div>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-3">
        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2.5 rounded-xl bg-gray-100 dark:bg-dark-800 hover:bg-gray-200 dark:hover:bg-dark-700 transition-all duration-200 hover:scale-105"
        >
          {theme === 'dark' ? (
            <SunIcon className="w-5 h-5 text-yellow-500" />
          ) : (
            <MoonIcon className="w-5 h-5 text-gray-600" />
          )}
        </button>

        {/* Notifications */}
        <button className="relative p-2.5 rounded-xl bg-gray-100 dark:bg-dark-800 hover:bg-gray-200 dark:hover:bg-dark-700 transition-all duration-200 hover:scale-105">
          <BellIcon className="w-5 h-5 text-gray-600 dark:text-dark-300" />
          <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-redstone-500 rounded-full ring-2 ring-white dark:ring-dark-900 animate-pulse" />
        </button>

        {/* User Menu */}
        <Menu as="div" className="relative">
          <Menu.Button className="flex items-center gap-3 p-1.5 pr-4 rounded-xl bg-gray-100 dark:bg-dark-800 hover:bg-gray-200 dark:hover:bg-dark-700 transition-all duration-200">
            {user && (
              <>
                <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-redstone-500 to-redstone-600 flex items-center justify-center text-white font-semibold text-sm shadow-lg shadow-redstone-500/20">
                  {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                </div>
                <div className="hidden md:block text-left">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {user.firstName} {user.lastName}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-dark-400">
                    {getUserRoleLabel(user.role)}
                  </p>
                </div>
              </>
            )}
          </Menu.Button>
          <Transition
            as={Fragment}
            enter="transition ease-out duration-200"
            enterFrom="transform opacity-0 scale-95 translate-y-1"
            enterTo="transform opacity-100 scale-100 translate-y-0"
            leave="transition ease-in duration-150"
            leaveFrom="transform opacity-100 scale-100 translate-y-0"
            leaveTo="transform opacity-0 scale-95 translate-y-1"
          >
            <Menu.Items className="absolute right-0 mt-2 w-56 origin-top-right rounded-xl bg-white dark:bg-dark-800 border border-gray-200 dark:border-dark-700 shadow-xl shadow-black/10 focus:outline-none overflow-hidden">
              {/* User Info Header */}
              <div className="px-4 py-3 border-b border-gray-200 dark:border-dark-700 bg-gray-50 dark:bg-dark-800/50">
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-xs text-gray-500 dark:text-dark-400 truncate">
                  {user?.email}
                </p>
              </div>

              <div className="p-1.5">
                <Menu.Item>
                  {({ active }) => (
                    <a
                      href="/settings"
                      className={cn(
                        'flex items-center gap-3 px-3 py-2.5 text-sm rounded-lg transition-colors',
                        active
                          ? 'bg-gray-100 dark:bg-dark-700 text-gray-900 dark:text-white'
                          : 'text-gray-600 dark:text-dark-300'
                      )}
                    >
                      <UserCircleIcon className="w-4 h-4" />
                      Profile Settings
                    </a>
                  )}
                </Menu.Item>

                <div className="my-1.5 border-t border-gray-200 dark:border-dark-700" />

                <Menu.Item>
                  {({ active }) => (
                    <button
                      onClick={logout}
                      className={cn(
                        'flex items-center gap-3 w-full px-3 py-2.5 text-sm rounded-lg transition-colors',
                        active
                          ? 'bg-redstone-500/10 text-redstone-600 dark:text-redstone-400'
                          : 'text-redstone-600 dark:text-redstone-400'
                      )}
                    >
                      <ArrowRightOnRectangleIcon className="w-4 h-4" />
                      Sign out
                    </button>
                  )}
                </Menu.Item>
              </div>
            </Menu.Items>
          </Transition>
        </Menu>
      </div>
    </header>
  );
}
