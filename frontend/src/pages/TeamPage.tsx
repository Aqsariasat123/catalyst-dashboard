import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  PlusIcon,
  MagnifyingGlassIcon,
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  PencilSquareIcon,
  TrashIcon,
  XMarkIcon,
  ShieldCheckIcon,
  WrenchScrewdriverIcon,
  PaintBrushIcon,
  ClipboardDocumentCheckIcon,
  FolderIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { userService, CreateUserData } from '@/services/user.service';
import { User, UserRole, UserType } from '@/types';
import { useAuthStore } from '@/stores/authStore';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Badge from '@/components/ui/Badge';
import Avatar from '@/components/ui/Avatar';
import { Card, CardContent } from '@/components/ui/Card';
import { cn } from '@/utils/helpers';

const roleOptions = [
  { value: '', label: 'All Roles' },
  { value: 'ADMIN', label: 'Admin' },
  { value: 'PROJECT_MANAGER', label: 'Project Manager' },
  { value: 'DEVELOPER', label: 'Developer' },
  { value: 'DESIGNER', label: 'Designer' },
  { value: 'QC', label: 'QC Analyst' },
];

const userTypeOptions = [
  { value: '', label: 'All Types' },
  { value: 'INHOUSE', label: 'In-House' },
  { value: 'FREELANCER', label: 'Freelancer' },
];

const roleConfig: Record<string, { icon: React.ElementType; color: string; label: string; description: string }> = {
  ADMIN: {
    icon: ShieldCheckIcon,
    color: 'bg-red-100 dark:bg-red-500/10 text-red-700 dark:text-red-400',
    label: 'Admin',
    description: 'Full access to all features and settings',
  },
  PROJECT_MANAGER: {
    icon: FolderIcon,
    color: 'bg-purple-100 dark:bg-purple-500/10 text-purple-700 dark:text-purple-400',
    label: 'Project Manager',
    description: 'Can create projects, assign tasks, manage team',
  },
  DEVELOPER: {
    icon: WrenchScrewdriverIcon,
    color: 'bg-cyan-100 dark:bg-cyan-500/10 text-cyan-700 dark:text-cyan-400',
    label: 'Developer',
    description: 'Access to assigned tasks and time tracking',
  },
  DESIGNER: {
    icon: PaintBrushIcon,
    color: 'bg-pink-100 dark:bg-pink-500/10 text-pink-700 dark:text-pink-400',
    label: 'Designer',
    description: 'Access to design tasks and assets',
  },
  QC: {
    icon: ClipboardDocumentCheckIcon,
    color: 'bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400',
    label: 'QC Analyst',
    description: 'Review completed tasks, flag bugs, approve work',
  },
};

const initialUserForm: CreateUserData = {
  email: '',
  password: '',
  firstName: '',
  lastName: '',
  role: 'DEVELOPER',
  userType: 'INHOUSE',
  phone: '',
  hourlyRate: undefined,
};

export default function TeamPage() {
  const queryClient = useQueryClient();
  const { user: currentUser } = useAuthStore();
  const isAdmin = currentUser?.role === 'ADMIN';

  const [filters, setFilters] = useState({
    page: 1,
    limit: 20,
    role: undefined as UserRole | undefined,
    userType: undefined as UserType | undefined,
    search: '',
  });
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [userForm, setUserForm] = useState<CreateUserData>(initialUserForm);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['users', filters],
    queryFn: () => userService.getAll(filters),
  });

  const createMutation = useMutation({
    mutationFn: (data: CreateUserData) => userService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['developers'] });
      setShowModal(false);
      setUserForm(initialUserForm);
      toast.success('Team member added successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to add team member');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateUserData> }) =>
      userService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['developers'] });
      setShowModal(false);
      setEditingUser(null);
      setUserForm(initialUserForm);
      toast.success('Team member updated successfully');
    },
    onError: () => {
      toast.error('Failed to update team member');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => userService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['developers'] });
      setDeleteConfirm(null);
      toast.success('Team member removed');
    },
    onError: () => {
      toast.error('Failed to remove team member');
    },
  });

  const handleSubmit = () => {
    if (!userForm.email.trim() || !userForm.firstName.trim() || !userForm.lastName.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }
    if (!editingUser && !userForm.password) {
      toast.error('Password is required for new team members');
      return;
    }

    if (editingUser) {
      const { password, ...updateData } = userForm;
      updateMutation.mutate({ id: editingUser.id, data: password ? userForm : updateData });
    } else {
      createMutation.mutate(userForm);
    }
  };

  const openEditModal = (user: User) => {
    setEditingUser(user);
    setUserForm({
      email: user.email,
      password: '',
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      userType: user.userType,
      phone: user.phone || '',
      hourlyRate: user.hourlyRate,
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingUser(null);
    setUserForm(initialUserForm);
  };

  // Group users by role
  const usersByRole: Partial<Record<UserRole, User[]>> = data?.data.reduce((acc, user) => {
    if (!acc[user.role]) acc[user.role] = [];
    acc[user.role]!.push(user);
    return acc;
  }, {} as Partial<Record<UserRole, User[]>>) || {};

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Team
            <span className="ml-3 inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-redstone-100 dark:bg-redstone-500/10 text-redstone-600 dark:text-redstone-400">
              {data?.meta.total || 0} Members
            </span>
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Manage your team and permissions
          </p>
        </div>
        {isAdmin && (
          <Button onClick={() => setShowModal(true)} className="bg-redstone-600 hover:bg-redstone-700">
            <PlusIcon className="w-4 h-4 mr-2" />
            Add Member
          </Button>
        )}
      </div>

      {/* Role Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {Object.entries(roleConfig).map(([role, config]) => {
          const Icon = config.icon;
          const count = usersByRole[role as UserRole]?.length || 0;
          return (
            <Card key={role} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <div className={cn('p-3 rounded-xl', config.color)}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{count}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{config.label}s</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="py-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                placeholder="Search team members..."
                className="pl-10"
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value, page: 1 })}
              />
            </div>
            <Select
              options={roleOptions}
              value={filters.role || ''}
              onChange={(e) =>
                setFilters({ ...filters, role: (e.target.value as UserRole) || undefined, page: 1 })
              }
              className="w-full sm:w-48"
            />
            <Select
              options={userTypeOptions}
              value={filters.userType || ''}
              onChange={(e) =>
                setFilters({ ...filters, userType: (e.target.value as UserType) || undefined, page: 1 })
              }
              className="w-full sm:w-48"
            />
          </div>
        </CardContent>
      </Card>

      {/* Team Members Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-48 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : data?.data.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <UserIcon className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No team members found
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              {filters.search ? 'Try adjusting your search' : 'Add your first team member'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {data?.data.map((user) => (
            <TeamMemberCard
              key={user.id}
              user={user}
              isAdmin={isAdmin}
              isCurrentUser={user.id === currentUser?.id}
              onEdit={() => openEditModal(user)}
              onDelete={() => setDeleteConfirm(user.id)}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {data && data.meta.totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={filters.page === 1}
            onClick={() => setFilters({ ...filters, page: filters.page - 1 })}
          >
            Previous
          </Button>
          <span className="flex items-center px-4 text-sm text-gray-600 dark:text-gray-400">
            Page {filters.page} of {data.meta.totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={filters.page === data.meta.totalPages}
            onClick={() => setFilters({ ...filters, page: filters.page + 1 })}
          >
            Next
          </Button>
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={closeModal} />
            <div className="relative bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full overflow-hidden">
              {/* Modal Header */}
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-redstone-100 dark:bg-redstone-500/10 flex items-center justify-center">
                      <UserIcon className="w-4 h-4 text-redstone-600 dark:text-redstone-400" />
                    </div>
                    <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                      {editingUser ? 'Edit Member' : 'New Member'}
                    </h3>
                  </div>
                  <button
                    onClick={closeModal}
                    className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    <XMarkIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Modal Body */}
              <div className="px-6 py-5 space-y-4 max-h-[60vh] overflow-y-auto">
                {/* Name Row */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">
                      First Name <span className="text-redstone-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="John"
                      value={userForm.firstName}
                      onChange={(e) => setUserForm({ ...userForm, firstName: e.target.value })}
                      className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-600 focus:border-gray-400 dark:focus:border-gray-500 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">
                      Last Name <span className="text-redstone-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Doe"
                      value={userForm.lastName}
                      onChange={(e) => setUserForm({ ...userForm, lastName: e.target.value })}
                      className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-600 focus:border-gray-400 dark:focus:border-gray-500 transition-all"
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">
                    Email <span className="text-redstone-500">*</span>
                  </label>
                  <input
                    type="email"
                    placeholder="john@example.com"
                    value={userForm.email}
                    onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                    className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-600 focus:border-gray-400 dark:focus:border-gray-500 transition-all"
                  />
                </div>

                {/* Password */}
                <div>
                  <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">
                    {editingUser ? 'New Password' : 'Password'} {!editingUser && <span className="text-redstone-500">*</span>}
                  </label>
                  <input
                    type="password"
                    placeholder={editingUser ? 'Leave blank to keep current' : '••••••••'}
                    value={userForm.password}
                    onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                    className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-600 focus:border-gray-400 dark:focus:border-gray-500 transition-all"
                  />
                </div>

                {/* Role & Type Row */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">
                      Role
                    </label>
                    <select
                      value={userForm.role}
                      onChange={(e) => setUserForm({ ...userForm, role: e.target.value as UserRole })}
                      className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-600 focus:border-gray-400 dark:focus:border-gray-500 transition-all cursor-pointer"
                    >
                      <option value="ADMIN">Admin</option>
                      <option value="PROJECT_MANAGER">Project Manager</option>
                      <option value="DEVELOPER">Developer</option>
                      <option value="DESIGNER">Designer</option>
                      <option value="QC">QC Analyst</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">
                      Type
                    </label>
                    <select
                      value={userForm.userType}
                      onChange={(e) => setUserForm({ ...userForm, userType: e.target.value as UserType })}
                      className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-600 focus:border-gray-400 dark:focus:border-gray-500 transition-all cursor-pointer"
                    >
                      <option value="INHOUSE">In-House</option>
                      <option value="FREELANCER">Freelancer</option>
                    </select>
                  </div>
                </div>

                {/* Phone & Rate Row */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">
                      Phone
                    </label>
                    <input
                      type="text"
                      placeholder="+1 234 567 8900"
                      value={userForm.phone}
                      onChange={(e) => setUserForm({ ...userForm, phone: e.target.value })}
                      className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-600 focus:border-gray-400 dark:focus:border-gray-500 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">
                      Hourly Rate ($)
                    </label>
                    <input
                      type="number"
                      placeholder="75"
                      value={userForm.hourlyRate || ''}
                      onChange={(e) => setUserForm({ ...userForm, hourlyRate: e.target.value ? Number(e.target.value) : undefined })}
                      className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-600 focus:border-gray-400 dark:focus:border-gray-500 transition-all"
                    />
                  </div>
                </div>

                {/* Role Permissions Info */}
                <div className="p-3 bg-gray-100 dark:bg-gray-900 rounded-lg">
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    <span className="font-medium text-gray-700 dark:text-gray-300">{roleConfig[userForm.role]?.label}:</span>{' '}
                    {roleConfig[userForm.role]?.description}
                  </p>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 flex items-center justify-end gap-2">
                <button
                  onClick={closeModal}
                  className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={createMutation.isPending || updateMutation.isPending}
                  className="px-4 py-2 text-sm font-medium text-white bg-redstone-600 hover:bg-redstone-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {createMutation.isPending || updateMutation.isPending ? (
                    <>
                      <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Saving...
                    </>
                  ) : editingUser ? (
                    'Update Member'
                  ) : (
                    <>
                      <PlusIcon className="w-4 h-4" />
                      Add Member
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={() => setDeleteConfirm(null)} />
            <div className="relative bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-sm w-full overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
                <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                  Remove Team Member
                </h3>
              </div>
              <div className="px-6 py-5">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Are you sure you want to remove this team member? Their tasks will be unassigned.
                </p>
              </div>
              <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 flex items-center justify-end gap-2">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => deleteMutation.mutate(deleteConfirm)}
                  disabled={deleteMutation.isPending}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {deleteMutation.isPending ? 'Removing...' : 'Remove'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function TeamMemberCard({
  user,
  isAdmin,
  isCurrentUser,
  onEdit,
  onDelete,
}: {
  user: User;
  isAdmin: boolean;
  isCurrentUser: boolean;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const config = roleConfig[user.role];

  return (
    <Card className="hover:shadow-md transition-all duration-200 hover:border-gray-300 dark:hover:border-gray-600">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <Avatar
              firstName={user.firstName}
              lastName={user.lastName}
              avatar={user.avatar}
              size="lg"
            />
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">
                {user.firstName} {user.lastName}
                {isCurrentUser && (
                  <span className="ml-2 text-xs text-redstone-600 dark:text-redstone-400">(You)</span>
                )}
              </h3>
              <Badge className={config?.color || 'bg-gray-100 text-gray-700'} size="sm">
                {config?.label || user.role}
              </Badge>
            </div>
          </div>
        </div>

        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
            <EnvelopeIcon className="w-4 h-4" />
            <span className="truncate">{user.email}</span>
          </div>
          {user.phone && (
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
              <PhoneIcon className="w-4 h-4" />
              <span>{user.phone}</span>
            </div>
          )}
          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
            <span
              className={cn(
                'px-2 py-0.5 rounded text-xs font-medium',
                user.userType === 'INHOUSE'
                  ? 'bg-green-100 dark:bg-green-500/10 text-green-700 dark:text-green-400'
                  : 'bg-orange-100 dark:bg-orange-500/10 text-orange-700 dark:text-orange-400'
              )}
            >
              {user.userType === 'INHOUSE' ? 'In-House' : 'Freelancer'}
            </span>
            {user.hourlyRate && (
              <span className="text-gray-400">${user.hourlyRate}/hr</span>
            )}
          </div>
        </div>

        {isAdmin && !isCurrentUser && (
          <div className="flex items-center justify-end gap-2 mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
            <button
              onClick={onEdit}
              className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              title="Edit"
            >
              <PencilSquareIcon className="w-4 h-4" />
            </button>
            <button
              onClick={onDelete}
              className="p-1.5 text-gray-400 hover:text-red-600"
              title="Delete"
            >
              <TrashIcon className="w-4 h-4" />
            </button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
