import { NavLink, Outlet, useLocation } from 'react-router-dom';
import {
  ChartBarIcon,
  BeakerIcon,
  PlayCircleIcon,
  BugAntIcon,
  DocumentChartBarIcon,
} from '@heroicons/react/24/outline';
import { cn } from '@/utils/helpers';

const navItems = [
  { path: '/qa', label: 'Overview', icon: ChartBarIcon, exact: true },
  { path: '/qa/test-cases', label: 'Test Cases', icon: BeakerIcon },
  { path: '/qa/executions', label: 'Executions', icon: PlayCircleIcon },
  { path: '/qa/bugs', label: 'Bugs', icon: BugAntIcon },
  { path: '/qa/reports', label: 'Reports', icon: DocumentChartBarIcon },
];

export default function QALayout() {
  const location = useLocation();

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="border-b border-gray-200 dark:border-gray-800">
        <nav className="-mb-px flex space-x-8 overflow-x-auto">
          {navItems.map((item) => {
            const isActive = item.exact
              ? location.pathname === item.path
              : location.pathname.startsWith(item.path);

            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={cn(
                  'flex items-center gap-2 py-4 px-1 border-b-2 text-sm font-medium whitespace-nowrap transition-colors',
                  isActive
                    ? 'border-redstone-500 text-redstone-600 dark:text-redstone-400'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                )}
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Page Content */}
      <Outlet />
    </div>
  );
}
