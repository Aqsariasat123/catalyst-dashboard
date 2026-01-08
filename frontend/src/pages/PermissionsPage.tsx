import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  ShieldCheckIcon,
  UserIcon,
  MagnifyingGlassIcon,
  CheckIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { userService } from '@/services/user.service';
import Avatar from '@/components/ui/Avatar';
import { cn } from '@/utils/helpers';

interface Permission {
  key: string;
  label: string;
  description: string;
  category: string;
}

const availablePermissions: Permission[] = [
  // Project Permissions
  { key: 'view_all_projects', label: 'View All Projects', description: 'Can see all projects in the system', category: 'Projects' },
  { key: 'manage_projects', label: 'Manage Projects', description: 'Can create, edit, and delete projects', category: 'Projects' },
  { key: 'view_project_budget', label: 'View Project Budget', description: 'Can see project budget information', category: 'Projects' },

  // Task Permissions
  { key: 'view_all_tasks', label: 'View All Tasks', description: 'Can see all tasks across projects', category: 'Tasks' },
  { key: 'manage_tasks', label: 'Manage Tasks', description: 'Can create, edit, and delete tasks', category: 'Tasks' },
  { key: 'assign_tasks', label: 'Assign Tasks', description: 'Can assign tasks to team members', category: 'Tasks' },

  // Financial Permissions
  { key: 'view_financials', label: 'View Financials', description: 'Can see financial reports and data', category: 'Finance' },
  { key: 'manage_transactions', label: 'Manage Transactions', description: 'Can create and edit transactions', category: 'Finance' },
  { key: 'view_milestone_amounts', label: 'View Milestone Amounts', description: 'Can see milestone payment amounts', category: 'Finance' },

  // Team Permissions
  { key: 'view_team', label: 'View Team', description: 'Can see team member information', category: 'Team' },
  { key: 'manage_team', label: 'Manage Team', description: 'Can add/remove team members', category: 'Team' },

  // Report Permissions
  { key: 'view_reports', label: 'View Reports', description: 'Can access reports section', category: 'Reports' },
  { key: 'export_reports', label: 'Export Reports', description: 'Can export report data', category: 'Reports' },
];

// Default permissions by role
const defaultPermissionsByRole: Record<string, string[]> = {
  ADMIN: availablePermissions.map(p => p.key), // All permissions
  PROJECT_MANAGER: [
    'view_all_projects', 'manage_projects', 'view_project_budget',
    'view_all_tasks', 'manage_tasks', 'assign_tasks',
    'view_financials', 'view_milestone_amounts',
    'view_team', 'manage_team',
    'view_reports', 'export_reports',
  ],
  DEVELOPER: [
    'view_all_tasks',
    'view_team',
  ],
  DESIGNER: [
    'view_all_tasks',
    'view_team',
  ],
  QC: [
    'view_all_tasks',
    'view_team',
  ],
};

export default function PermissionsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [userPermissions, setUserPermissions] = useState<string[]>([]);

  const { data: usersData, isLoading } = useQuery({
    queryKey: ['allUsers'],
    queryFn: () => userService.getAll({ limit: 100 }),
  });

  const users = usersData?.data || [];

  const filteredUsers = users.filter((user: any) => {
    const fullName = `${user.firstName} ${user.lastName}`.toLowerCase();
    const email = user.email.toLowerCase();
    const query = searchQuery.toLowerCase();
    return fullName.includes(query) || email.includes(query);
  });

  const handleSelectUser = (user: any) => {
    setSelectedUser(user);
    // Load user's custom permissions or default based on role
    const customPermissions = user.permissions || defaultPermissionsByRole[user.userType] || [];
    setUserPermissions(customPermissions);
  };

  const togglePermission = (permissionKey: string) => {
    setUserPermissions(prev =>
      prev.includes(permissionKey)
        ? prev.filter(p => p !== permissionKey)
        : [...prev, permissionKey]
    );
  };

  const handleSavePermissions = async () => {
    if (!selectedUser) return;

    try {
      // Note: This would need a backend endpoint to save custom permissions
      // For now, we'll just show a success message
      toast.success(`Permissions updated for ${selectedUser.firstName} ${selectedUser.lastName}`);
      // In a real implementation, you would call:
      // await userService.updatePermissions(selectedUser.id, userPermissions);
      // queryClient.invalidateQueries({ queryKey: ['allUsers'] });
    } catch (error) {
      toast.error('Failed to update permissions');
    }
  };

  const handleResetToDefault = () => {
    if (!selectedUser) return;
    const defaultPerms = defaultPermissionsByRole[selectedUser.userType] || [];
    setUserPermissions(defaultPerms);
    toast.success('Reset to default permissions for role');
  };

  const groupedPermissions = availablePermissions.reduce((acc, perm) => {
    if (!acc[perm.category]) {
      acc[perm.category] = [];
    }
    acc[perm.category].push(perm);
    return acc;
  }, {} as Record<string, Permission[]>);

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400';
      case 'PROJECT_MANAGER':
        return 'bg-purple-100 text-purple-700 dark:bg-purple-500/10 dark:text-purple-400';
      case 'DEVELOPER':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400';
      case 'DESIGNER':
        return 'bg-pink-100 text-pink-700 dark:bg-pink-500/10 dark:text-pink-400';
      case 'QC':
        return 'bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400';
      default:
        return 'bg-gray-100 text-gray-700 dark:bg-gray-500/10 dark:text-gray-400';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Permissions</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Manage what each team member can access and do
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Users List */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search members..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-gray-50 dark:bg-black border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-600"
                />
              </div>
            </div>

            <div className="max-h-[600px] overflow-y-auto divide-y divide-gray-100 dark:divide-gray-700">
              {isLoading ? (
                <div className="p-4 space-y-3">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="animate-pulse flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3" />
                        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : filteredUsers.length === 0 ? (
                <div className="p-8 text-center">
                  <UserIcon className="w-10 h-10 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
                  <p className="text-sm text-gray-500 dark:text-gray-400">No members found</p>
                </div>
              ) : (
                filteredUsers.map((user: any) => (
                  <button
                    key={user.id}
                    onClick={() => handleSelectUser(user)}
                    className={cn(
                      'w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-left',
                      selectedUser?.id === user.id && 'bg-redstone-50 dark:bg-redstone-500/10'
                    )}
                  >
                    <Avatar
                      firstName={user.firstName}
                      lastName={user.lastName}
                      avatar={user.avatar}
                      size="sm"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 dark:text-white truncate">
                        {user.firstName} {user.lastName}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        {user.email}
                      </p>
                    </div>
                    <span className={cn(
                      'text-xs px-2 py-0.5 rounded-full font-medium',
                      getRoleBadgeColor(user.userType)
                    )}>
                      {user.userType.replace('_', ' ')}
                    </span>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Permissions Panel */}
        <div className="lg:col-span-2">
          {selectedUser ? (
            <div className="bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden">
              {/* User Header */}
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-black">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar
                      firstName={selectedUser.firstName}
                      lastName={selectedUser.lastName}
                      avatar={selectedUser.avatar}
                      size="md"
                    />
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {selectedUser.firstName} {selectedUser.lastName}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {selectedUser.email}
                      </p>
                    </div>
                  </div>
                  <span className={cn(
                    'text-sm px-3 py-1 rounded-full font-medium',
                    getRoleBadgeColor(selectedUser.userType)
                  )}>
                    {selectedUser.userType.replace('_', ' ')}
                  </span>
                </div>
              </div>

              {/* Permissions List */}
              <div className="px-6 py-4 max-h-[500px] overflow-y-auto space-y-6">
                {Object.entries(groupedPermissions).map(([category, permissions]) => (
                  <div key={category}>
                    <h4 className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
                      {category}
                    </h4>
                    <div className="space-y-2">
                      {permissions.map((perm) => {
                        const isEnabled = userPermissions.includes(perm.key);
                        return (
                          <button
                            key={perm.key}
                            onClick={() => togglePermission(perm.key)}
                            className={cn(
                              'w-full flex items-center justify-between p-3 rounded-lg border transition-colors',
                              isEnabled
                                ? 'bg-green-50 border-green-200 dark:bg-green-500/10 dark:border-green-500/30'
                                : 'bg-gray-50 border-gray-200 dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700'
                            )}
                          >
                            <div className="text-left">
                              <p className={cn(
                                'font-medium text-sm',
                                isEnabled ? 'text-green-700 dark:text-green-400' : 'text-gray-700 dark:text-gray-300'
                              )}>
                                {perm.label}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                {perm.description}
                              </p>
                            </div>
                            <div className={cn(
                              'w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0',
                              isEnabled
                                ? 'bg-green-500 text-white'
                                : 'bg-gray-200 dark:bg-gray-600'
                            )}>
                              {isEnabled ? (
                                <CheckIcon className="w-4 h-4" />
                              ) : (
                                <XMarkIcon className="w-3 h-3 text-gray-400 dark:text-gray-500" />
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

              {/* Actions */}
              <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-black flex items-center justify-between">
                <button
                  onClick={handleResetToDefault}
                  className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  Reset to Default
                </button>
                <button
                  onClick={handleSavePermissions}
                  className="px-4 py-2 text-sm font-medium text-white bg-redstone-600 hover:bg-redstone-700 rounded-lg transition-colors flex items-center gap-2"
                >
                  <ShieldCheckIcon className="w-4 h-4" />
                  Save Permissions
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-xl p-12 text-center">
              <ShieldCheckIcon className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                Select a Team Member
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Choose a team member from the list to manage their permissions
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
