import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  PlusIcon,
  MagnifyingGlassIcon,
  DocumentArrowDownIcon,
  TrashIcon,
  PencilIcon,
  StarIcon,
  CalendarIcon,
  XMarkIcon,
  FunnelIcon,
  LinkIcon,
  ArrowUpTrayIcon,
  DocumentTextIcon,
} from '@heroicons/react/24/outline';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { cn } from '@/utils/helpers';
import toast from 'react-hot-toast';
import {
  recruitmentService,
  Candidate,
  TechStack,
  CandidateStatus,
  techStackLabels,
  statusConfig,
  CreateCandidateData,
} from '@/services/recruitment.service';

export default function RecruitmentPage() {
  const queryClient = useQueryClient();
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingCandidate, setEditingCandidate] = useState<Candidate | null>(null);
  const [filters, setFilters] = useState({
    search: '',
    techStack: [] as TechStack[],
    status: '' as CandidateStatus | '',
  });
  const [showFilters, setShowFilters] = useState(false);

  const { data: candidates, isLoading } = useQuery({
    queryKey: ['candidates', filters],
    queryFn: () => recruitmentService.getCandidates({
      search: filters.search || undefined,
      techStack: filters.techStack.length > 0 ? filters.techStack : undefined,
      status: filters.status || undefined,
    }),
  });

  const { data: stats } = useQuery({
    queryKey: ['recruitment-stats'],
    queryFn: recruitmentService.getStats,
  });

  const deleteMutation = useMutation({
    mutationFn: recruitmentService.deleteCandidate,
    onSuccess: () => {
      toast.success('Candidate deleted');
      queryClient.invalidateQueries({ queryKey: ['candidates'] });
      queryClient.invalidateQueries({ queryKey: ['recruitment-stats'] });
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Failed to delete'),
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: CandidateStatus }) =>
      recruitmentService.updateCandidateStatus(id, status),
    onSuccess: () => {
      toast.success('Status updated');
      queryClient.invalidateQueries({ queryKey: ['candidates'] });
      queryClient.invalidateQueries({ queryKey: ['recruitment-stats'] });
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Failed to update status'),
  });

  const handleTechStackFilter = (stack: TechStack) => {
    setFilters(prev => ({
      ...prev,
      techStack: prev.techStack.includes(stack)
        ? prev.techStack.filter(s => s !== stack)
        : [...prev.techStack, stack],
    }));
  };

  const clearFilters = () => {
    setFilters({ search: '', techStack: [], status: '' });
  };

  // Group tech stacks by category for filter display
  const techStackGroups = {
    'Frontend': ['REACT', 'ANGULAR', 'VUE', 'NEXTJS'] as TechStack[],
    'Backend': ['NODE', 'EXPRESS', 'NESTJS', 'PYTHON', 'DJANGO', 'FASTAPI', 'JAVA', 'SPRING', 'DOTNET', 'PHP', 'LARAVEL', 'RUBY', 'RAILS', 'GO', 'RUST'] as TechStack[],
    'Mobile': ['FLUTTER', 'REACT_NATIVE', 'ANDROID', 'IOS', 'SWIFT', 'KOTLIN'] as TechStack[],
    'DevOps': ['DEVOPS', 'AWS', 'AZURE', 'GCP', 'DOCKER', 'KUBERNETES'] as TechStack[],
    'QA': ['QA', 'AUTOMATION', 'MANUAL_TESTING'] as TechStack[],
    'Design': ['UI_UX', 'GRAPHIC_DESIGN', 'FIGMA', 'PHOTOSHOP'] as TechStack[],
    'Other': ['AI_ML', 'DATA_SCIENCE', 'BLOCKCHAIN', 'OTHER'] as TechStack[],
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Recruitment</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Manage candidates and CVs by tech stack
          </p>
        </div>
        <Button onClick={() => setShowAddModal(true)}>
          <PlusIcon className="w-4 h-4 mr-2" />
          Add Candidate
        </Button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
          <Card>
            <CardContent className="pt-6">
              <p className="text-xs text-gray-500 dark:text-gray-400">Total</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-xs text-gray-500 dark:text-gray-400">New</p>
              <p className="text-2xl font-bold text-blue-600">{stats.byStatus?.NEW || 0}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-xs text-gray-500 dark:text-gray-400">In Process</p>
              <p className="text-2xl font-bold text-yellow-600">
                {(stats.byStatus?.SCREENING || 0) + (stats.byStatus?.INTERVIEW || 0) + (stats.byStatus?.TECHNICAL || 0) + (stats.byStatus?.HR_ROUND || 0)}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-xs text-gray-500 dark:text-gray-400">Hired</p>
              <p className="text-2xl font-bold text-green-600">{stats.byStatus?.HIRED || 0}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-xs text-gray-500 dark:text-gray-400">Rejected</p>
              <p className="text-2xl font-bold text-red-600">{stats.byStatus?.REJECTED || 0}</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Search and Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4">
            {/* Search Bar */}
            <div className="flex gap-4">
              <div className="relative flex-1">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={filters.search}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                  placeholder="Search by name, email, or position..."
                  className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700"
                />
              </div>
              <select
                value={filters.status}
                onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value as CandidateStatus | '' }))}
                className="rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2"
              >
                <option value="">All Status</option>
                {Object.entries(statusConfig).map(([value, { label }]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className={cn(filters.techStack.length > 0 && 'border-redstone-500 text-redstone-600')}
              >
                <FunnelIcon className="w-4 h-4 mr-2" />
                Tech Stack {filters.techStack.length > 0 && `(${filters.techStack.length})`}
              </Button>
              {(filters.search || filters.status || filters.techStack.length > 0) && (
                <Button variant="ghost" onClick={clearFilters}>
                  <XMarkIcon className="w-4 h-4 mr-1" />
                  Clear
                </Button>
              )}
            </div>

            {/* Tech Stack Filter Panel */}
            {showFilters && (
              <div className="border dark:border-gray-700 rounded-lg p-4 space-y-4">
                {Object.entries(techStackGroups).map(([group, stacks]) => (
                  <div key={group}>
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">{group}</p>
                    <div className="flex flex-wrap gap-2">
                      {stacks.map((stack) => (
                        <button
                          key={stack}
                          onClick={() => handleTechStackFilter(stack)}
                          className={cn(
                            'px-3 py-1 rounded-full text-xs font-medium transition-colors',
                            filters.techStack.includes(stack)
                              ? 'bg-redstone-100 text-redstone-700 dark:bg-redstone-500/20 dark:text-redstone-400'
                              : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                          )}
                        >
                          {techStackLabels[stack]}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Candidates List */}
      <Card>
        <CardHeader>
          <CardTitle>
            Candidates {candidates && `(${candidates.length})`}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-gray-500">Loading candidates...</div>
          ) : !candidates?.length ? (
            <div className="text-center py-8 text-gray-500">
              No candidates found. {filters.search || filters.techStack.length > 0 || filters.status
                ? 'Try adjusting your filters.'
                : 'Add your first candidate!'}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-xs text-gray-500 dark:text-gray-400 border-b dark:border-gray-700">
                    <th className="pb-3 font-medium">Candidate</th>
                    <th className="pb-3 font-medium">Tech Stack</th>
                    <th className="pb-3 font-medium">Experience</th>
                    <th className="pb-3 font-medium">Expected CTC</th>
                    <th className="pb-3 font-medium">Status</th>
                    <th className="pb-3 font-medium">Rating</th>
                    <th className="pb-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {candidates.map((candidate) => (
                    <tr key={candidate.id} className="border-b dark:border-gray-700 last:border-0">
                      <td className="py-3">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">{candidate.name}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{candidate.email}</p>
                          {candidate.appliedFor && (
                            <p className="text-xs text-redstone-600 dark:text-redstone-400">{candidate.appliedFor}</p>
                          )}
                        </div>
                      </td>
                      <td className="py-3">
                        <div className="flex flex-wrap gap-1 max-w-[200px]">
                          {candidate.techStack.slice(0, 3).map((stack) => (
                            <span
                              key={stack}
                              className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs rounded"
                            >
                              {techStackLabels[stack]}
                            </span>
                          ))}
                          {candidate.techStack.length > 3 && (
                            <span className="text-xs text-gray-500">+{candidate.techStack.length - 3}</span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 text-gray-600 dark:text-gray-400">
                        {candidate.experience ? `${candidate.experience} yrs` : '-'}
                      </td>
                      <td className="py-3 text-gray-600 dark:text-gray-400">
                        {candidate.expectedCtc
                          ? new Intl.NumberFormat('en-PK').format(Number(candidate.expectedCtc))
                          : '-'}
                      </td>
                      <td className="py-3">
                        <select
                          value={candidate.status}
                          onChange={(e) => updateStatusMutation.mutate({ id: candidate.id, status: e.target.value as CandidateStatus })}
                          className={cn(
                            'text-xs rounded-full px-2 py-1 border-0 font-medium cursor-pointer',
                            statusConfig[candidate.status]?.color
                          )}
                        >
                          {Object.entries(statusConfig).map(([value, { label }]) => (
                            <option key={value} value={value}>{label}</option>
                          ))}
                        </select>
                      </td>
                      <td className="py-3">
                        {candidate.rating ? (
                          <div className="flex items-center gap-1 text-yellow-500">
                            <StarIcon className="w-4 h-4 fill-current" />
                            <span className="text-sm font-medium">{candidate.rating}</span>
                          </div>
                        ) : (
                          <span className="text-gray-400 text-sm">-</span>
                        )}
                      </td>
                      <td className="py-3">
                        <div className="flex items-center gap-2">
                          {(candidate.cvFilePath || candidate.cvUrl) && (
                            <a
                              href={candidate.cvFilePath
                                ? recruitmentService.getCVDownloadUrl(candidate.id)
                                : candidate.cvUrl!}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-800"
                              title={candidate.cvFileName || "View CV"}
                            >
                              <DocumentArrowDownIcon className="w-4 h-4" />
                            </a>
                          )}
                          {candidate.linkedInUrl && (
                            <a
                              href={candidate.linkedInUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-800"
                              title="LinkedIn"
                            >
                              <LinkIcon className="w-4 h-4" />
                            </a>
                          )}
                          <button
                            onClick={() => setEditingCandidate(candidate)}
                            className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                          >
                            <PencilIcon className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm('Delete this candidate?')) {
                                deleteMutation.mutate(candidate.id);
                              }
                            }}
                            className="text-red-500 hover:text-red-700"
                          >
                            <TrashIcon className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Candidate Modal */}
      {(showAddModal || editingCandidate) && (
        <CandidateModal
          candidate={editingCandidate}
          onClose={() => {
            setShowAddModal(false);
            setEditingCandidate(null);
          }}
        />
      )}
    </div>
  );
}

// ==================== CANDIDATE MODAL ====================

function CandidateModal({
  candidate,
  onClose,
}: {
  candidate: Candidate | null;
  onClose: () => void;
}) {
  const queryClient = useQueryClient();
  const isEditing = !!candidate;

  const [form, setForm] = useState<CreateCandidateData & { status?: CandidateStatus; rating?: number }>({
    name: candidate?.name || '',
    email: candidate?.email || '',
    phone: candidate?.phone || '',
    techStack: candidate?.techStack || [],
    experience: candidate?.experience || undefined,
    currentCtc: candidate?.currentCtc ? Number(candidate.currentCtc) : undefined,
    expectedCtc: candidate?.expectedCtc ? Number(candidate.expectedCtc) : undefined,
    noticePeriod: candidate?.noticePeriod || undefined,
    cvUrl: candidate?.cvUrl || '',
    portfolioUrl: candidate?.portfolioUrl || '',
    linkedInUrl: candidate?.linkedInUrl || '',
    source: candidate?.source || '',
    notes: candidate?.notes || '',
    appliedFor: candidate?.appliedFor || '',
    status: candidate?.status,
    rating: candidate?.rating || undefined,
  });

  const [cvFile, setCvFile] = useState<File | null>(null);
  const [existingCvName, setExistingCvName] = useState<string | null>(candidate?.cvFileName || null);

  const uploadCvMutation = useMutation({
    mutationFn: ({ candidateId, file }: { candidateId: string; file: File }) =>
      recruitmentService.uploadCV(candidateId, file),
    onSuccess: () => {
      toast.success('CV uploaded successfully');
      queryClient.invalidateQueries({ queryKey: ['candidates'] });
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Failed to upload CV'),
  });

  const createMutation = useMutation({
    mutationFn: recruitmentService.createCandidate,
    onSuccess: async (newCandidate) => {
      toast.success('Candidate added');
      // Upload CV if file was selected
      if (cvFile) {
        await uploadCvMutation.mutateAsync({ candidateId: newCandidate.id, file: cvFile });
      }
      queryClient.invalidateQueries({ queryKey: ['candidates'] });
      queryClient.invalidateQueries({ queryKey: ['recruitment-stats'] });
      onClose();
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Failed to add candidate'),
  });

  const updateMutation = useMutation({
    mutationFn: (data: typeof form) => recruitmentService.updateCandidate(candidate!.id, data),
    onSuccess: async () => {
      toast.success('Candidate updated');
      // Upload CV if new file was selected
      if (cvFile) {
        await uploadCvMutation.mutateAsync({ candidateId: candidate!.id, file: cvFile });
      }
      queryClient.invalidateQueries({ queryKey: ['candidates'] });
      queryClient.invalidateQueries({ queryKey: ['recruitment-stats'] });
      onClose();
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Failed to update candidate'),
  });

  const handleSubmit = () => {
    if (!form.name) {
      toast.error('Name is required');
      return;
    }

    if (isEditing) {
      updateMutation.mutate(form);
    } else {
      createMutation.mutate(form);
    }
  };

  const toggleTechStack = (stack: TechStack) => {
    setForm(prev => ({
      ...prev,
      techStack: prev.techStack?.includes(stack)
        ? prev.techStack.filter(s => s !== stack)
        : [...(prev.techStack || []), stack],
    }));
  };

  const handleCvFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      const allowedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      ];
      if (!allowedTypes.includes(file.type)) {
        toast.error('Invalid file type. Only PDF, DOC, and DOCX are allowed.');
        return;
      }
      // Validate file size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size must be less than 5MB');
        return;
      }
      setCvFile(file);
      setExistingCvName(null);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  // All tech stacks for selection
  const allTechStacks = Object.keys(techStackLabels) as TechStack[];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">
            {isEditing ? 'Edit Candidate' : 'Add Candidate'}
          </h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          {/* Basic Info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Name *
              </label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Email
              </label>
              <input
                type="email"
                value={form.email || ''}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Phone
              </label>
              <input
                type="text"
                value={form.phone || ''}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Applied For
              </label>
              <input
                type="text"
                value={form.appliedFor || ''}
                onChange={(e) => setForm({ ...form, appliedFor: e.target.value })}
                placeholder="e.g., Senior React Developer"
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2"
              />
            </div>
          </div>

          {/* Tech Stack */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Tech Stack
            </label>
            <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto p-2 border dark:border-gray-700 rounded-lg">
              {allTechStacks.map((stack) => (
                <button
                  key={stack}
                  type="button"
                  onClick={() => toggleTechStack(stack)}
                  className={cn(
                    'px-2 py-1 rounded text-xs font-medium transition-colors',
                    form.techStack?.includes(stack)
                      ? 'bg-redstone-100 text-redstone-700 dark:bg-redstone-500/20 dark:text-redstone-400'
                      : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200'
                  )}
                >
                  {techStackLabels[stack]}
                </button>
              ))}
            </div>
          </div>

          {/* Experience & CTC */}
          <div className="grid grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Experience (yrs)
              </label>
              <input
                type="number"
                min="0"
                value={form.experience || ''}
                onChange={(e) => setForm({ ...form, experience: e.target.value ? parseInt(e.target.value) : undefined })}
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Current CTC
              </label>
              <input
                type="number"
                min="0"
                value={form.currentCtc || ''}
                onChange={(e) => setForm({ ...form, currentCtc: e.target.value ? parseFloat(e.target.value) : undefined })}
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Expected CTC
              </label>
              <input
                type="number"
                min="0"
                value={form.expectedCtc || ''}
                onChange={(e) => setForm({ ...form, expectedCtc: e.target.value ? parseFloat(e.target.value) : undefined })}
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Notice (days)
              </label>
              <input
                type="number"
                min="0"
                value={form.noticePeriod || ''}
                onChange={(e) => setForm({ ...form, noticePeriod: e.target.value ? parseInt(e.target.value) : undefined })}
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2"
              />
            </div>
          </div>

          {/* CV Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              CV / Resume (PDF, DOC, DOCX)
            </label>
            <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4">
              <input
                type="file"
                onChange={handleCvFileChange}
                accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                className="hidden"
                id="cv-upload"
              />
              {cvFile ? (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-redstone-100 dark:bg-redstone-900/30 flex items-center justify-center">
                      <DocumentTextIcon className="w-5 h-5 text-redstone-600 dark:text-redstone-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{cvFile.name}</p>
                      <p className="text-xs text-gray-500">{formatFileSize(cvFile.size)}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setCvFile(null)}
                    className="text-gray-500 hover:text-red-500"
                  >
                    <XMarkIcon className="w-5 h-5" />
                  </button>
                </div>
              ) : existingCvName ? (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                      <DocumentTextIcon className="w-5 h-5 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{existingCvName}</p>
                      <p className="text-xs text-green-600">CV already uploaded</p>
                    </div>
                  </div>
                  <label
                    htmlFor="cv-upload"
                    className="text-sm text-redstone-600 hover:text-redstone-700 cursor-pointer"
                  >
                    Replace
                  </label>
                </div>
              ) : (
                <label
                  htmlFor="cv-upload"
                  className="cursor-pointer text-center block"
                >
                  <ArrowUpTrayIcon className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Click to upload CV
                  </p>
                  <p className="text-xs text-gray-500 mt-1">PDF, DOC, DOCX (max 5MB)</p>
                </label>
              )}
            </div>
          </div>

          {/* URLs */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Portfolio URL
              </label>
              <input
                type="url"
                value={form.portfolioUrl || ''}
                onChange={(e) => setForm({ ...form, portfolioUrl: e.target.value })}
                placeholder="https://..."
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                LinkedIn URL
              </label>
              <input
                type="url"
                value={form.linkedInUrl || ''}
                onChange={(e) => setForm({ ...form, linkedInUrl: e.target.value })}
                placeholder="https://linkedin.com/in/..."
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2"
              />
            </div>
          </div>

          {/* Source & Rating */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Source
              </label>
              <input
                type="text"
                value={form.source || ''}
                onChange={(e) => setForm({ ...form, source: e.target.value })}
                placeholder="e.g., LinkedIn, Referral, Job Portal"
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2"
              />
            </div>
            {isEditing && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Rating (1-5)
                </label>
                <input
                  type="number"
                  min="1"
                  max="5"
                  value={form.rating || ''}
                  onChange={(e) => setForm({ ...form, rating: e.target.value ? parseInt(e.target.value) : undefined })}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2"
                />
              </div>
            )}
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Notes
            </label>
            <textarea
              value={form.notes || ''}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              rows={3}
              className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2"
              placeholder="Additional notes about the candidate..."
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-6">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={createMutation.isPending || updateMutation.isPending || uploadCvMutation.isPending}
          >
            {(createMutation.isPending || updateMutation.isPending || uploadCvMutation.isPending)
              ? 'Saving...'
              : isEditing ? 'Update' : 'Add'} Candidate
          </Button>
        </div>
      </div>
    </div>
  );
}
