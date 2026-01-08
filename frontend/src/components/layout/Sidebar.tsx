import { NavLink, useLocation } from 'react-router-dom';
import { Fragment } from 'react';
import { Menu, Transition } from '@headlessui/react';
import {
  Squares2X2Icon,
  FolderOpenIcon,
  CheckBadgeIcon,
  ClockIcon,
  UserGroupIcon,
  BuildingStorefrontIcon,
  PresentationChartLineIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  BellIcon,
  SunIcon,
  MoonIcon,
  ArrowRightStartOnRectangleIcon,
  WalletIcon,
  ShieldCheckIcon,
  IdentificationIcon,
  DocumentTextIcon,
} from '@heroicons/react/24/outline';
import { useAuthStore } from '@/stores/authStore';
import { useThemeStore } from '@/stores/themeStore';
import { cn, getUserRoleLabel } from '@/utils/helpers';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export default function Sidebar({ isOpen, onClose, isCollapsed, onToggleCollapse }: SidebarProps) {
  const location = useLocation();
  const { user, logout } = useAuthStore();
  const { theme, setTheme } = useThemeStore();
  const isAdmin = user?.role === 'ADMIN' || user?.role === 'PROJECT_MANAGER';

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  const adminNavItems = [
    { name: 'Dashboard', href: '/dashboard', icon: Squares2X2Icon },
    { name: 'Clients', href: '/clients', icon: BuildingStorefrontIcon },
    { name: 'Projects', href: '/projects', icon: FolderOpenIcon },
    { name: 'Tasks', href: '/tasks', icon: CheckBadgeIcon },
    { name: 'Time Tracking', href: '/time-tracking', icon: ClockIcon },
    { name: 'Team', href: '/team', icon: UserGroupIcon },
    { name: 'HR', href: '/hr', icon: IdentificationIcon },
    { name: 'Recruitment', href: '/recruitment', icon: DocumentTextIcon },
    { name: 'Accounts', href: '/accounts', icon: WalletIcon },
    { name: 'Permissions', href: '/permissions', icon: ShieldCheckIcon },
    { name: 'Reports', href: '/reports', icon: PresentationChartLineIcon },
  ];

  const developerNavItems = [
    { name: 'Dashboard', href: '/dashboard', icon: Squares2X2Icon },
    { name: 'My Tasks', href: '/tasks', icon: CheckBadgeIcon },
    { name: 'Time Tracking', href: '/time-tracking', icon: ClockIcon },
    { name: 'Projects', href: '/projects', icon: FolderOpenIcon },
    { name: 'My Portal', href: '/my-portal', icon: IdentificationIcon },
  ];

  const navItems = isAdmin ? adminNavItems : developerNavItems;

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 bg-gray-100 dark:bg-black border-r border-gray-200 dark:border-gray-800 transform transition-all duration-300 ease-out lg:translate-x-0 lg:static lg:z-0 flex flex-col',
          isOpen ? 'translate-x-0' : '-translate-x-full',
          isCollapsed ? 'w-20' : 'w-72'
        )}
      >
        {/* Logo */}
        <div className={cn(
          'flex items-center h-16 border-b border-gray-200 dark:border-gray-800',
          isCollapsed ? 'px-3 justify-center' : 'px-4 justify-between'
        )}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 flex items-center justify-center flex-shrink-0">
              <svg className="w-10 h-10" viewBox="0 0 40 40" fill="none">
                <path d="M8 32L16 8H22L14 32H8Z" fill="url(#redGradient1)" />
                <path d="M18 32L26 8H32L24 32H18Z" fill="url(#redGradient2)" />
                <defs>
                  <linearGradient id="redGradient1" x1="12" y1="8" x2="12" y2="32" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#ef4444" />
                    <stop offset="1" stopColor="#dc2626" />
                  </linearGradient>
                  <linearGradient id="redGradient2" x1="25" y1="8" x2="25" y2="32" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#ef4444" />
                    <stop offset="1" stopColor="#dc2626" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
            {!isCollapsed && (
              <div>
                <span className="text-lg font-bold text-gray-900 dark:text-white tracking-tight">
                  Redstone Catalyst
                </span>
              </div>
            )}
          </div>

          {/* Collapse button - expanded state */}
          {!isCollapsed && (
            <button
              onClick={onToggleCollapse}
              className="hidden lg:flex items-center justify-center w-8 h-8 rounded-lg bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors"
            >
              <ChevronLeftIcon className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            </button>
          )}
        </div>

        {/* Collapse button - collapsed state (positioned below logo) */}
        {isCollapsed && (
          <div className="hidden lg:flex justify-center py-2 border-b border-gray-200 dark:border-gray-800">
            <button
              onClick={onToggleCollapse}
              className="flex items-center justify-center w-8 h-8 rounded-lg bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors"
            >
              <ChevronRightIcon className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            </button>
          </div>
        )}

        {/* Header Actions - Theme & Notifications */}
        <div className={cn(
          'flex items-center gap-2 py-3 border-b border-gray-200 dark:border-gray-800',
          isCollapsed ? 'px-3 flex-col' : 'px-4'
        )}>
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 transition-all"
            title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {theme === 'dark' ? (
              <SunIcon className="w-5 h-5 text-yellow-500" />
            ) : (
              <MoonIcon className="w-5 h-5 text-gray-600" />
            )}
          </button>

          <button
            className="relative p-2 rounded-lg bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 transition-all"
            title="Notifications"
          >
            <BellIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-redstone-500 rounded-full" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto scrollbar-hide">
          {navItems.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <NavLink
                key={item.name}
                to={item.href}
                onClick={onClose}
                title={isCollapsed ? item.name : undefined}
                className={cn(
                  'group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200',
                  isActive
                    ? 'bg-gradient-to-r from-redstone-600 to-redstone-700 text-white shadow-lg shadow-redstone-500/20'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white',
                  isCollapsed && 'justify-center px-2'
                )}
              >
                <item.icon className={cn(
                  'w-5 h-5 flex-shrink-0 transition-transform duration-200',
                  isActive ? '' : 'group-hover:scale-110'
                )} />
                {!isCollapsed && (
                  <>
                    <span>{item.name}</span>
                    {isActive && (
                      <div className="ml-auto w-1.5 h-1.5 bg-white rounded-full" />
                    )}
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* User Menu */}
        <div className="p-3 border-t border-gray-200 dark:border-gray-800">
          <Menu as="div" className="relative">
            <Menu.Button className={cn(
              'flex items-center gap-3 w-full p-2 rounded-xl bg-gray-200 dark:bg-gray-800/50 hover:bg-gray-300 dark:hover:bg-gray-800 transition-all',
              isCollapsed && 'justify-center'
            )}>
              {user && (
                <>
                  <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-redstone-500 to-redstone-600 flex items-center justify-center text-white font-semibold text-sm shadow-md flex-shrink-0">
                    {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                  </div>
                  {!isCollapsed && (
                    <div className="flex-1 text-left min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {user.firstName} {user.lastName}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        {getUserRoleLabel(user.role)}
                      </p>
                    </div>
                  )}
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
              <Menu.Items className={cn(
                'absolute bottom-full mb-2 w-56 origin-bottom-left rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-xl focus:outline-none overflow-hidden',
                isCollapsed ? 'left-0' : 'left-0'
              )}>
                <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-black">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {user?.firstName} {user?.lastName}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                    {user?.email}
                  </p>
                </div>

                <div className="p-1.5">
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
                        <ArrowRightStartOnRectangleIcon className="w-4 h-4" />
                        Sign out
                      </button>
                    )}
                  </Menu.Item>
                </div>
              </Menu.Items>
            </Transition>
          </Menu>
        </div>
      </aside>
    </>
  );
}
