import { NavLink, useLocation } from 'react-router-dom';
import { Fragment, useState, useEffect } from 'react';
import { Menu, Transition, Popover } from '@headlessui/react';
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
import { notificationService, Notification } from '@/services/notification.service';
import { formatDistanceToNow } from 'date-fns';

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

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const [notifs, count] = await Promise.all([
          notificationService.getNotifications(),
          notificationService.getUnreadCount()
        ]);
        setNotifications(notifs);
        setUnreadCount(count);
      } catch (error) {
        console.error('Failed to fetch notifications:', error);
      }
    };

    if (user) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const handleMarkAsRead = async (id: string) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  };

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
              <img
                src={theme === 'dark' ? '/assets/logo-dark.png' : '/assets/logo-light.png'}
                alt="Redstone Catalyst"
                className="w-10 h-10 object-contain"
              />
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

          <Popover className="relative">
            {({ open }) => (
              <>
                <Popover.Button
                  className={cn(
                    "relative p-2 rounded-lg bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 transition-all duration-200 focus:outline-none",
                    open && "ring-2 ring-redstone-500 bg-gray-300 dark:bg-gray-700"
                  )}
                  title="Notifications"
                >
                  <BellIcon className={cn(
                    "w-5 h-5 text-gray-600 dark:text-gray-400 transition-transform duration-200",
                    open && "scale-110 text-redstone-500"
                  )} />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-2 h-2 bg-redstone-500 rounded-full animate-pulse" />
                  )}
                </Popover.Button>
                <Transition
                  as={Fragment}
                  enter="transition ease-out duration-300"
                  enterFrom="opacity-0 scale-95 -translate-y-2"
                  enterTo="opacity-100 scale-100 translate-y-0"
                  leave="transition ease-in duration-200"
                  leaveFrom="opacity-100 scale-100 translate-y-0"
                  leaveTo="opacity-0 scale-95 -translate-y-2"
                >
                  <Popover.Panel className="absolute left-0 z-50 mt-2 w-80 origin-top-left rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-2xl focus:outline-none overflow-hidden backdrop-blur-sm">
                    <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-900 dark:to-black flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <BellIcon className="w-4 h-4 text-redstone-500" />
                        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                          Notifications
                        </h3>
                        {unreadCount > 0 && (
                          <span className="px-1.5 py-0.5 text-xs font-medium bg-redstone-500 text-white rounded-full">
                            {unreadCount}
                          </span>
                        )}
                      </div>
                      {unreadCount > 0 && (
                        <button
                          onClick={handleMarkAllAsRead}
                          className="text-xs text-redstone-500 hover:text-redstone-600 font-medium hover:underline transition-all"
                        >
                          Mark all read
                        </button>
                      )}
                    </div>
                    <div className="max-h-80 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="px-4 py-10 text-center">
                          <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                            <BellIcon className="w-8 h-8 text-gray-300 dark:text-gray-600" />
                          </div>
                          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">No notifications yet</p>
                          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">We'll notify you when something arrives</p>
                        </div>
                      ) : (
                        notifications.map((notification, index) => (
                          <div
                            key={notification.id}
                            onClick={() => !notification.isRead && handleMarkAsRead(notification.id)}
                            className={cn(
                              'px-4 py-3 border-b border-gray-100 dark:border-gray-800 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-all duration-200',
                              !notification.isRead && 'bg-redstone-50 dark:bg-redstone-500/10 hover:bg-redstone-100 dark:hover:bg-redstone-500/20'
                            )}
                            style={{ animationDelay: `${index * 50}ms` }}
                          >
                            <div className="flex items-start gap-3">
                              {!notification.isRead && (
                                <span className="w-2 h-2 mt-1.5 bg-redstone-500 rounded-full flex-shrink-0 animate-pulse" />
                              )}
                              <div className={cn(!notification.isRead ? '' : 'ml-5')}>
                                <p className="text-sm font-medium text-gray-900 dark:text-white">
                                  {notification.title}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-2">
                                  {notification.message}
                                </p>
                                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                                  {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </Popover.Panel>
                </Transition>
              </>
            )}
          </Popover>
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
