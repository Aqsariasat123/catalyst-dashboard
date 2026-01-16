import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Bars3Icon } from '@heroicons/react/24/outline';
import Sidebar from './Sidebar';
import AIAssistant from '@/components/AIAssistant';
import { cn } from '@/utils/helpers';

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(() => {
    const saved = localStorage.getItem('sidebar-collapsed');
    return saved ? JSON.parse(saved) : false;
  });

  useEffect(() => {
    localStorage.setItem('sidebar-collapsed', JSON.stringify(isCollapsed));
  }, [isCollapsed]);

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-black">
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        isCollapsed={isCollapsed}
        onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
      />

      <div className={cn(
        'flex-1 flex flex-col min-w-0 transition-all duration-300'
      )}>
        {/* Mobile header - only shows hamburger on mobile */}
        <div className="lg:hidden h-14 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 flex items-center px-4">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            <Bars3Icon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
        </div>

        <main className="flex-1 overflow-x-auto overflow-y-auto p-4 lg:p-6">
          <div className="animate-fade-in min-w-0">
            <Outlet />
          </div>
        </main>
      </div>

      {/* AI Planning Assistant */}
      <AIAssistant />
    </div>
  );
}
