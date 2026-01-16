import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import {
  PlusIcon,
  MagnifyingGlassIcon,
  BuildingOffice2Icon,
  EnvelopeIcon,
  PhoneIcon,
  GlobeAltIcon,
  FolderIcon,
  PencilSquareIcon,
  TrashIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { clientService, CreateClientData, ClientFilters } from '@/services/client.service';
import { Client, ClientType } from '@/types';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import { Card, CardContent } from '@/components/ui/Card';
import { cn } from '@/utils/helpers';

const clientTypeOptions = [
  { value: '', label: 'All Types' },
  { value: 'UPWORK', label: 'Upwork' },
  { value: 'DIRECT', label: 'Direct' },
  { value: 'FREELANCER', label: 'Freelancer' },
];

const initialClientForm: CreateClientData = {
  name: '',
  email: '',
  phone: '',
  company: '',
  clientType: 'DIRECT',
  upworkProfile: '',
  website: '',
  address: '',
  notes: '',
};

export default function ClientsPage() {
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState<ClientFilters>({
    page: 1,
    limit: 12,
    search: '',
  });
  const [showModal, setShowModal] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [clientForm, setClientForm] = useState<CreateClientData>(initialClientForm);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['clients', filters],
    queryFn: () => clientService.getAll(filters),
  });

  const createMutation = useMutation({
    mutationFn: (data: CreateClientData) => clientService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      queryClient.invalidateQueries({ queryKey: ['adminDashboard'] });
      setShowModal(false);
      setClientForm(initialClientForm);
      toast.success('Client created successfully');
    },
    onError: () => {
      toast.error('Failed to create client');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateClientData> }) =>
      clientService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      setShowModal(false);
      setEditingClient(null);
      setClientForm(initialClientForm);
      toast.success('Client updated successfully');
    },
    onError: () => {
      toast.error('Failed to update client');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => clientService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      queryClient.invalidateQueries({ queryKey: ['adminDashboard'] });
      setDeleteConfirm(null);
      toast.success('Client deleted successfully');
    },
    onError: () => {
      toast.error('Failed to delete client');
    },
  });

  const handleSubmit = () => {
    if (!clientForm.name.trim()) {
      toast.error('Client name is required');
      return;
    }
    if (editingClient) {
      updateMutation.mutate({ id: editingClient.id, data: clientForm });
    } else {
      createMutation.mutate(clientForm);
    }
  };

  const openEditModal = (client: Client) => {
    setEditingClient(client);
    setClientForm({
      name: client.name,
      email: client.email || '',
      phone: client.phone || '',
      company: client.company || '',
      clientType: client.clientType,
      upworkProfile: client.upworkProfile || '',
      website: client.website || '',
      address: client.address || '',
      notes: client.notes || '',
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingClient(null);
    setClientForm(initialClientForm);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Clients
            <span className="ml-3 inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-redstone-100 dark:bg-redstone-500/10 text-redstone-600 dark:text-redstone-400">
              {data?.meta.total || 0} Total
            </span>
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Manage your client relationships
          </p>
        </div>
        <Button onClick={() => setShowModal(true)} className="bg-redstone-600 hover:bg-redstone-700">
          <PlusIcon className="w-4 h-4 mr-2" />
          Add Client
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="py-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                placeholder="Search clients..."
                className="pl-10"
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value, page: 1 })}
              />
            </div>
            <Select
              options={clientTypeOptions}
              value={filters.clientType || ''}
              onChange={(e) =>
                setFilters({
                  ...filters,
                  clientType: (e.target.value as ClientType) || undefined,
                  page: 1,
                })
              }
              className="w-full sm:w-48"
            />
          </div>
        </CardContent>
      </Card>

      {/* Clients List */}
      <div className="bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden max-w-full">
        <div className="overflow-x-auto w-full">
          {/* Table Header */}
          <div className="hidden md:grid md:grid-cols-12 gap-4 px-6 py-3 bg-gray-50 dark:bg-black border-b border-gray-200 dark:border-gray-700 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider min-w-[900px]">
            <div className="col-span-3">Client</div>
            <div className="col-span-2">Type</div>
            <div className="col-span-3">Contact</div>
            <div className="col-span-2">Website</div>
            <div className="col-span-1 text-center">Projects</div>
            <div className="col-span-1 text-right">Actions</div>
          </div>

        {/* Loading State */}
        {isLoading ? (
          <div className="divide-y divide-gray-100 dark:divide-gray-700">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="px-6 py-4">
                <div className="animate-pulse flex items-center gap-4">
                  <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-lg" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/4" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : data?.data.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <BuildingOffice2Icon className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-base font-medium text-gray-900 dark:text-white mb-1">
              No clients found
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {filters.search ? 'Try adjusting your search' : 'Add your first client to get started'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-gray-700">
            {data?.data.map((client) => (
              <ClientRow
                key={client.id}
                client={client}
                onEdit={() => openEditModal(client)}
                onDelete={() => setDeleteConfirm(client.id)}
              />
            ))}
          </div>
        )}
        </div>
      </div>

      {/* Pagination */}
      {data && data.meta.totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={filters.page === 1}
            onClick={() => setFilters({ ...filters, page: filters.page! - 1 })}
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
            onClick={() => setFilters({ ...filters, page: filters.page! + 1 })}
          >
            Next
          </Button>
        </div>
      )}

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={closeModal} />
            <div className="relative bg-white dark:bg-black rounded-xl shadow-2xl max-w-md w-full overflow-hidden">
              {/* Modal Header */}
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-black">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-redstone-100 dark:bg-redstone-500/10 flex items-center justify-center">
                      <BuildingOffice2Icon className="w-4 h-4 text-redstone-600 dark:text-redstone-400" />
                    </div>
                    <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                      {editingClient ? 'Edit Client' : 'New Client'}
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
                {/* Client Name */}
                <div>
                  <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">
                    Client Name <span className="text-redstone-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Enter client name"
                    value={clientForm.name}
                    onChange={(e) => setClientForm({ ...clientForm, name: e.target.value })}
                    className="w-full px-3 py-2 bg-white dark:bg-black border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-600 focus:border-gray-400 dark:focus:border-gray-500 transition-all"
                  />
                </div>

                {/* Email & Phone Row */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">
                      Email
                    </label>
                    <input
                      type="email"
                      placeholder="client@example.com"
                      value={clientForm.email}
                      onChange={(e) => setClientForm({ ...clientForm, email: e.target.value })}
                      className="w-full px-3 py-2 bg-white dark:bg-black border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-600 focus:border-gray-400 dark:focus:border-gray-500 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">
                      Phone
                    </label>
                    <input
                      type="text"
                      placeholder="+1 234 567 8900"
                      value={clientForm.phone}
                      onChange={(e) => setClientForm({ ...clientForm, phone: e.target.value })}
                      className="w-full px-3 py-2 bg-white dark:bg-black border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-600 focus:border-gray-400 dark:focus:border-gray-500 transition-all"
                    />
                  </div>
                </div>

                {/* Company & Type Row */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">
                      Company
                    </label>
                    <input
                      type="text"
                      placeholder="Company name"
                      value={clientForm.company}
                      onChange={(e) => setClientForm({ ...clientForm, company: e.target.value })}
                      className="w-full px-3 py-2 bg-white dark:bg-black border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-600 focus:border-gray-400 dark:focus:border-gray-500 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">
                      Client Type
                    </label>
                    <select
                      value={clientForm.clientType}
                      onChange={(e) => setClientForm({ ...clientForm, clientType: e.target.value as ClientType })}
                      className="w-full px-3 py-2 bg-white dark:bg-black border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-600 focus:border-gray-400 dark:focus:border-gray-500 transition-all cursor-pointer"
                    >
                      <option value="DIRECT">Direct Client</option>
                      <option value="UPWORK">Upwork Client</option>
                      <option value="FREELANCER">Freelancer</option>
                    </select>
                  </div>
                </div>

                {clientForm.clientType === 'UPWORK' && (
                  <div>
                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">
                      Upwork Profile URL
                    </label>
                    <input
                      type="text"
                      placeholder="https://www.upwork.com/..."
                      value={clientForm.upworkProfile}
                      onChange={(e) => setClientForm({ ...clientForm, upworkProfile: e.target.value })}
                      className="w-full px-3 py-2 bg-white dark:bg-black border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-600 focus:border-gray-400 dark:focus:border-gray-500 transition-all"
                    />
                  </div>
                )}

                {/* Website */}
                <div>
                  <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">
                    Website
                  </label>
                  <input
                    type="text"
                    placeholder="https://example.com"
                    value={clientForm.website}
                    onChange={(e) => setClientForm({ ...clientForm, website: e.target.value })}
                    className="w-full px-3 py-2 bg-white dark:bg-black border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-600 focus:border-gray-400 dark:focus:border-gray-500 transition-all"
                  />
                </div>

                {/* Address */}
                <div>
                  <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">
                    Address
                  </label>
                  <input
                    type="text"
                    placeholder="Full address"
                    value={clientForm.address}
                    onChange={(e) => setClientForm({ ...clientForm, address: e.target.value })}
                    className="w-full px-3 py-2 bg-white dark:bg-black border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-600 focus:border-gray-400 dark:focus:border-gray-500 transition-all"
                  />
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">
                    Notes
                  </label>
                  <textarea
                    placeholder="Additional notes..."
                    value={clientForm.notes}
                    onChange={(e) => setClientForm({ ...clientForm, notes: e.target.value })}
                    rows={2}
                    className="w-full px-3 py-2 bg-white dark:bg-black border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-600 focus:border-gray-400 dark:focus:border-gray-500 transition-all resize-none"
                  />
                </div>
              </div>

              {/* Modal Footer */}
              <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-black flex items-center justify-end gap-2">
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
                  ) : editingClient ? (
                    'Update Client'
                  ) : (
                    <>
                      <PlusIcon className="w-4 h-4" />
                      Add Client
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
            <div className="relative bg-white dark:bg-black rounded-xl shadow-2xl max-w-sm w-full overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-black">
                <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                  Delete Client
                </h3>
              </div>
              <div className="px-6 py-5">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Are you sure you want to delete this client? This will also delete all associated projects and tasks.
                </p>
              </div>
              <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-black flex items-center justify-end gap-2">
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
                  {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

interface ClientRowProps {
  client: Client;
  onEdit: () => void;
  onDelete: () => void;
}

function ClientRow({ client, onEdit, onDelete }: ClientRowProps) {
  const typeConfig: Record<string, { bg: string; text: string }> = {
    UPWORK: { bg: 'bg-green-50 dark:bg-green-500/10', text: 'text-green-700 dark:text-green-400' },
    DIRECT: { bg: 'bg-blue-50 dark:bg-blue-500/10', text: 'text-blue-700 dark:text-blue-400' },
    FREELANCER: { bg: 'bg-purple-50 dark:bg-purple-500/10', text: 'text-purple-700 dark:text-purple-400' },
  };

  const type = typeConfig[client.clientType] || typeConfig.DIRECT;

  return (
    <div className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
      {/* Desktop Row */}
      <div className="hidden md:grid md:grid-cols-12 gap-4 px-6 py-4 items-center min-w-[900px]">
        {/* Client Info */}
        <div className="col-span-3 flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-lg bg-redstone-100 dark:bg-redstone-500/10 flex items-center justify-center flex-shrink-0">
            <BuildingOffice2Icon className="w-5 h-5 text-redstone-600 dark:text-redstone-400" />
          </div>
          <div className="min-w-0">
            <h3 className="font-medium text-gray-900 dark:text-white truncate">
              {client.name}
            </h3>
            {client.company && (
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                {client.company}
              </p>
            )}
          </div>
        </div>

        {/* Type */}
        <div className="col-span-2">
          <span className={cn(
            'inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium',
            type.bg, type.text
          )}>
            {client.clientType}
          </span>
        </div>

        {/* Contact */}
        <div className="col-span-3 min-w-0">
          <div className="space-y-1">
            {client.email && (
              <div className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400">
                <EnvelopeIcon className="w-3.5 h-3.5 flex-shrink-0" />
                <span className="truncate">{client.email}</span>
              </div>
            )}
            {client.phone && (
              <div className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400">
                <PhoneIcon className="w-3.5 h-3.5 flex-shrink-0" />
                <span>{client.phone}</span>
              </div>
            )}
            {!client.email && !client.phone && (
              <span className="text-sm text-gray-400">—</span>
            )}
          </div>
        </div>

        {/* Website */}
        <div className="col-span-2 min-w-0">
          {client.website ? (
            <a
              href={client.website}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400 hover:text-redstone-600 dark:hover:text-redstone-400 truncate"
            >
              <GlobeAltIcon className="w-3.5 h-3.5 flex-shrink-0" />
              <span className="truncate">{client.website.replace(/^https?:\/\//, '')}</span>
            </a>
          ) : (
            <span className="text-sm text-gray-400">—</span>
          )}
        </div>

        {/* Projects Count */}
        <div className="col-span-1 text-center">
          <Link
            to={`/projects?clientId=${client.id}`}
            className="inline-flex items-center gap-1.5 text-sm text-redstone-600 dark:text-redstone-400 hover:underline"
          >
            <FolderIcon className="w-4 h-4" />
            {client._count?.projects || 0}
          </Link>
        </div>

        {/* Actions */}
        <div className="col-span-1 flex items-center justify-end gap-1">
          <button
            onClick={onEdit}
            className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            title="Edit Client"
          >
            <PencilSquareIcon className="w-4 h-4" />
          </button>
          <button
            onClick={onDelete}
            className="p-1.5 text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors"
            title="Delete Client"
          >
            <TrashIcon className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Mobile Card */}
      <div className="md:hidden px-4 py-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-redstone-100 dark:bg-redstone-500/10 flex items-center justify-center flex-shrink-0">
            <BuildingOffice2Icon className="w-5 h-5 text-redstone-600 dark:text-redstone-400" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-medium text-gray-900 dark:text-white truncate">
                {client.name}
              </h3>
              <span className={cn(
                'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium flex-shrink-0',
                type.bg, type.text
              )}>
                {client.clientType}
              </span>
            </div>
            {client.company && (
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                {client.company}
              </p>
            )}
            <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
              {client.email && (
                <span className="flex items-center gap-1 truncate">
                  <EnvelopeIcon className="w-3.5 h-3.5" />
                  {client.email}
                </span>
              )}
              <Link
                to={`/projects?clientId=${client.id}`}
                className="flex items-center gap-1 text-redstone-600 dark:text-redstone-400"
              >
                <FolderIcon className="w-3.5 h-3.5" />
                {client._count?.projects || 0}
              </Link>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={onEdit}
              className="p-1.5 text-gray-400 hover:text-gray-600"
            >
              <PencilSquareIcon className="w-4 h-4" />
            </button>
            <button
              onClick={onDelete}
              className="p-1.5 text-gray-400 hover:text-red-600"
            >
              <TrashIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
