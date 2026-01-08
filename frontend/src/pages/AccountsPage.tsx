import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  BanknotesIcon,
  ChartBarIcon,
  ClockIcon,
  UserGroupIcon,
  FolderIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  CheckCircleIcon,
  CheckIcon,
  PlusIcon,
  XMarkIcon,
  PencilIcon,
  TrashIcon,
  CurrencyDollarIcon,
  CalendarDaysIcon,
  ExclamationTriangleIcon,
  CalculatorIcon,
  CogIcon,
  ArrowUpTrayIcon,
  DocumentTextIcon,
  MagnifyingGlassIcon,
  WalletIcon,
} from '@heroicons/react/24/outline';
import { accountsService, AccountsOverview, Milestone } from '@/services/accounts.service';
import { payrollService, Payroll } from '@/services/hr.service';
import { projectService } from '@/services/project.service';
import { transactionService } from '@/services/transaction.service';
import Button from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { cn } from '@/utils/helpers';
import toast from 'react-hot-toast';

type TabType = 'overview' | 'projects' | 'finance' | 'developers' | 'milestones' | 'time' | 'transactions' | 'salaries';

const tabs = [
  { id: 'overview', label: 'Overview', icon: ChartBarIcon },
  { id: 'projects', label: 'Projects', icon: FolderIcon },
  { id: 'finance', label: 'Project Finance', icon: CalculatorIcon },
  { id: 'developers', label: 'Developer Costs', icon: UserGroupIcon },
  { id: 'milestones', label: 'Milestones', icon: BanknotesIcon },
  { id: 'time', label: 'Time Analysis', icon: ClockIcon },
  { id: 'transactions', label: 'Transactions', icon: DocumentTextIcon },
  { id: 'salaries', label: 'Salary Records', icon: WalletIcon },
];

export default function AccountsPage() {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [showMilestoneModal, setShowMilestoneModal] = useState(false);
  const [editingMilestone, setEditingMilestone] = useState<Milestone | null>(null);

  const queryClient = useQueryClient();

  const { data: overview, isLoading } = useQuery({
    queryKey: ['accounts-overview'],
    queryFn: accountsService.getOverview,
  });

  const { data: milestones } = useQuery({
    queryKey: ['milestones'],
    queryFn: () => accountsService.getMilestones(),
  });

  const { data: projects } = useQuery({
    queryKey: ['projects', { limit: 100 }],
    queryFn: () => projectService.getAll({ limit: 100 }),
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Accounts</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Financial overview, milestones, and cost analysis
          </p>
        </div>
        <Button onClick={() => setShowMilestoneModal(true)}>
          <PlusIcon className="w-4 h-4 mr-2" />
          Add Milestone
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as TabType)}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors',
              activeTab === tab.id
                ? 'bg-redstone-100 dark:bg-redstone-500/10 text-redstone-700 dark:text-redstone-400'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
            )}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {isLoading ? (
        <LoadingSkeleton />
      ) : (
        <>
          {activeTab === 'overview' && <OverviewTab overview={overview} />}
          {activeTab === 'projects' && <ProjectsTab overview={overview} />}
          {activeTab === 'finance' && <ProjectFinanceTab projects={projects?.data || []} />}
          {activeTab === 'developers' && <DevelopersTab overview={overview} />}
          {activeTab === 'milestones' && (
            <MilestonesTab
              milestones={milestones || []}
              onEdit={(m) => {
                setEditingMilestone(m);
                setShowMilestoneModal(true);
              }}
            />
          )}
          {activeTab === 'time' && <TimeAnalysisTab overview={overview} />}
          {activeTab === 'transactions' && <TransactionsTab />}
          {activeTab === 'salaries' && <SalaryRecordsTab />}
        </>
      )}

      {/* Milestone Modal */}
      {showMilestoneModal && (
        <MilestoneModal
          milestone={editingMilestone}
          projects={projects?.data || []}
          onClose={() => {
            setShowMilestoneModal(false);
            setEditingMilestone(null);
          }}
          onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ['milestones'] });
            queryClient.invalidateQueries({ queryKey: ['accounts-overview'] });
            setShowMilestoneModal(false);
            setEditingMilestone(null);
          }}
        />
      )}
    </div>
  );
}

function OverviewTab({ overview }: { overview?: AccountsOverview }) {
  if (!overview) return null;

  const { summary, monthlyTrend } = overview;
  const maxRevenue = Math.max(...monthlyTrend.map((m) => m.revenue), 1);

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryCard
          title="Total Revenue"
          value={formatPKR(summary.totalRevenue)}
          icon={BanknotesIcon}
          color="emerald"
          trend={summary.profitMargin > 0 ? 'up' : 'down'}
          trendValue={`${summary.profitMargin}% margin`}
        />
        <SummaryCard
          title="Labor Cost"
          value={formatPKR(summary.totalLaborCost)}
          icon={UserGroupIcon}
          color="amber"
        />
        <SummaryCard
          title="Net Profit"
          value={formatPKR(summary.totalProfit)}
          icon={ArrowTrendingUpIcon}
          color={summary.totalProfit >= 0 ? 'emerald' : 'red'}
        />
        <SummaryCard
          title="Hours Tracked"
          value={`${summary.totalHoursTracked}h`}
          icon={ClockIcon}
          color="cyan"
        />
      </div>

      {/* Milestones Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-base">Milestones Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Released</span>
                <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                  {summary.totalMilestonesReleased}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Pending</span>
                <span className="text-lg font-bold text-amber-600 dark:text-amber-400">
                  {summary.totalMilestonesPending}
                </span>
              </div>
              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Avg. Hourly Rate
                  </span>
                  <span className="text-lg font-bold text-gray-900 dark:text-white">
                    {formatPKR(summary.averageHourlyRate)}/hr
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Monthly Trend Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Monthly Trend (Last 6 Months)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end justify-between gap-2 h-48">
              {monthlyTrend.map((month) => (
                <div key={month.month} className="flex-1 flex flex-col items-center gap-2">
                  <div
                    className="w-full bg-gray-100 dark:bg-gray-700 rounded-t-lg relative"
                    style={{ height: '140px' }}
                  >
                    <div
                      className="absolute bottom-0 w-full bg-gradient-to-t from-emerald-600 to-emerald-400 rounded-t-lg transition-all"
                      style={{ height: `${(month.revenue / maxRevenue) * 100}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-500 dark:text-gray-400">{month.month}</span>
                  <span className="text-xs font-medium text-gray-900 dark:text-white">
                    {formatPKRShort(month.revenue)}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Profit/Loss Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Profit/Loss by Month</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                    Month
                  </th>
                  <th className="text-right py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                    Revenue
                  </th>
                  <th className="text-right py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                    Costs
                  </th>
                  <th className="text-right py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                    Profit
                  </th>
                  <th className="text-right py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                    Hours
                  </th>
                </tr>
              </thead>
              <tbody>
                {monthlyTrend.map((month) => (
                  <tr
                    key={month.month}
                    className="border-b border-gray-100 dark:border-gray-700/50"
                  >
                    <td className="py-3 px-4 font-medium text-gray-900 dark:text-white">
                      {month.month}
                    </td>
                    <td className="py-3 px-4 text-right text-emerald-600 dark:text-emerald-400">
                      {formatPKR(month.revenue)}
                    </td>
                    <td className="py-3 px-4 text-right text-amber-600 dark:text-amber-400">
                      {formatPKR(month.costs)}
                    </td>
                    <td
                      className={cn(
                        'py-3 px-4 text-right font-medium',
                        month.profit >= 0
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : 'text-red-600 dark:text-red-400'
                      )}
                    >
                      {month.profit >= 0 ? '+' : ''}
                      {formatPKR(month.profit)}
                    </td>
                    <td className="py-3 px-4 text-right text-gray-600 dark:text-gray-400">
                      {month.hoursWorked}h
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function ProjectsTab({ overview }: { overview?: AccountsOverview }) {
  const [editingFee, setEditingFee] = useState<string | null>(null);
  const [feeValue, setFeeValue] = useState('');
  const queryClient = useQueryClient();

  const updateFeeMutation = useMutation({
    mutationFn: ({ projectId, platformFeePercent }: { projectId: string; platformFeePercent: number }) =>
      accountsService.updateProjectFinancials(projectId, { platformFeePercent }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts-overview'] });
      toast.success('Platform fee updated');
      setEditingFee(null);
    },
    onError: () => {
      toast.error('Failed to update platform fee');
    },
  });

  if (!overview) return null;

  const { projectBreakdown } = overview;

  const handleFeeEdit = (projectId: string, currentFee: number) => {
    setEditingFee(projectId);
    setFeeValue(currentFee.toString());
  };

  const handleFeeSave = (projectId: string) => {
    const fee = parseFloat(feeValue) || 0;
    if (fee < 0 || fee > 100) {
      toast.error('Fee must be between 0 and 100%');
      return;
    }
    updateFeeMutation.mutate({ projectId, platformFeePercent: fee });
  };

  const formatCurrency = (amount: number, currency: string) => {
    const symbols: Record<string, string> = { USD: '$', GBP: '£', EUR: '€', AUD: 'A$', PKR: 'Rs', CAD: 'C$' };
    return `${symbols[currency] || currency}${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  return (
    <div className="space-y-6">
      {/* Project Financial Summary Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Project Financial Summary</CardTitle>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Set platform fee % for each project. When milestones are released, transactions will auto-deduct the fee.
          </p>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                    Project
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                    Client
                  </th>
                  <th className="text-center py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                    Fee %
                  </th>
                  <th className="text-right py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                    Gross
                  </th>
                  <th className="text-right py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                    Fee Deducted
                  </th>
                  <th className="text-right py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                    Net Received
                  </th>
                  <th className="text-center py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                    Milestones
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {projectBreakdown.map((project) => (
                  <tr
                    key={project.id}
                    className="border-b border-gray-100 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                  >
                    <td className="py-3 px-4">
                      <span className="font-medium text-gray-900 dark:text-white">
                        {project.name}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-600 dark:text-gray-400">
                      {project.client}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {editingFee === project.id ? (
                        <div className="flex items-center justify-center gap-1">
                          <input
                            type="number"
                            min="0"
                            max="100"
                            step="0.1"
                            value={feeValue}
                            onChange={(e) => setFeeValue(e.target.value)}
                            className="w-16 px-2 py-1 text-center text-sm bg-white dark:bg-black border border-gray-300 dark:border-gray-600 rounded"
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleFeeSave(project.id);
                              if (e.key === 'Escape') setEditingFee(null);
                            }}
                            autoFocus
                          />
                          <span className="text-gray-400">%</span>
                          <button
                            onClick={() => handleFeeSave(project.id)}
                            className="p-1 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 rounded"
                          >
                            <CheckIcon className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setEditingFee(null)}
                            className="p-1 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                          >
                            <XMarkIcon className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleFeeEdit(project.id, project.platformFeePercent)}
                          className="inline-flex items-center gap-1 px-2 py-1 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                        >
                          {project.platformFeePercent}%
                          <PencilIcon className="w-3 h-3 text-gray-400" />
                        </button>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right text-gray-900 dark:text-white font-medium">
                      {project.grossAmount > 0 ? formatCurrency(project.grossAmount, project.currency) : '-'}
                    </td>
                    <td className="py-3 px-4 text-right text-red-600 dark:text-red-400">
                      {project.feeAmount > 0 ? `-${formatCurrency(project.feeAmount, project.currency)}` : '-'}
                    </td>
                    <td className="py-3 px-4 text-right text-emerald-600 dark:text-emerald-400 font-medium">
                      {project.netAmount > 0 ? formatCurrency(project.netAmount, project.currency) : '-'}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                        {project.milestonesReleased}
                      </span>
                      <span className="text-gray-400">/{project.totalMilestones}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={cn(
                          'px-2 py-1 rounded-md text-xs font-medium',
                          getStatusBadge(project.status)
                        )}
                      >
                        {project.status.replace('_', ' ')}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-xl p-4">
          <div className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Total Gross</div>
          <div className="text-xl font-bold text-gray-900 dark:text-white mt-1">
            ${projectBreakdown.reduce((sum, p) => sum + (p.currency === 'USD' ? p.grossAmount : 0), 0).toLocaleString()}
          </div>
        </div>
        <div className="bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-xl p-4">
          <div className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Total Fees</div>
          <div className="text-xl font-bold text-red-600 dark:text-red-400 mt-1">
            -${projectBreakdown.reduce((sum, p) => sum + (p.currency === 'USD' ? p.feeAmount : 0), 0).toLocaleString()}
          </div>
        </div>
        <div className="bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-xl p-4">
          <div className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Total Net</div>
          <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
            ${projectBreakdown.reduce((sum, p) => sum + (p.currency === 'USD' ? p.netAmount : 0), 0).toLocaleString()}
          </div>
        </div>
        <div className="bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-xl p-4">
          <div className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Avg Fee %</div>
          <div className="text-xl font-bold text-gray-900 dark:text-white mt-1">
            {(projectBreakdown.reduce((sum, p) => sum + p.platformFeePercent, 0) / Math.max(projectBreakdown.length, 1)).toFixed(1)}%
          </div>
        </div>
      </div>
    </div>
  );
}

function DevelopersTab({ overview }: { overview?: AccountsOverview }) {
  if (!overview) return null;

  const { developerCosts } = overview;
  const totalCost = developerCosts.reduce((sum, d) => sum + d.cost, 0);

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryCard
          title="Total Team Cost"
          value={formatPKR(totalCost)}
          icon={BanknotesIcon}
          color="amber"
        />
        <SummaryCard
          title="Team Members"
          value={developerCosts.length}
          icon={UserGroupIcon}
          color="cyan"
        />
        <SummaryCard
          title="Total Hours"
          value={`${developerCosts.reduce((sum, d) => sum + d.hoursWorked, 0).toFixed(0)}h`}
          icon={ClockIcon}
          color="emerald"
        />
        <SummaryCard
          title="Avg Cost/Developer"
          value={formatPKR(totalCost / Math.max(developerCosts.length, 1))}
          icon={CurrencyDollarIcon}
          color="redstone"
        />
      </div>

      {/* Developer Cost Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Developer Cost Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                    Developer
                  </th>
                  <th className="text-right py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                    Monthly Salary (PKR)
                  </th>
                  <th className="text-right py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                    Hours Worked
                  </th>
                  <th className="text-right py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                    Cost (PKR)
                  </th>
                  <th className="text-center py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                    Projects
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                    Cost Share
                  </th>
                </tr>
              </thead>
              <tbody>
                {developerCosts.map((dev) => {
                  const costShare = totalCost > 0 ? (dev.cost / totalCost) * 100 : 0;
                  return (
                    <tr
                      key={dev.id}
                      className="border-b border-gray-100 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-redstone-100 dark:bg-redstone-500/10 flex items-center justify-center">
                            <span className="text-xs font-bold text-redstone-600 dark:text-redstone-400">
                              {dev.name.split(' ').map((n) => n[0]).join('')}
                            </span>
                          </div>
                          <span className="font-medium text-gray-900 dark:text-white">
                            {dev.name}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right text-gray-900 dark:text-white">
                        {dev.monthlySalary ? formatPKR(dev.monthlySalary) : '-'}
                      </td>
                      <td className="py-3 px-4 text-right text-gray-600 dark:text-gray-400">
                        {dev.hoursWorked}h
                      </td>
                      <td className="py-3 px-4 text-right font-medium text-gray-900 dark:text-white">
                        {formatPKR(dev.cost)}
                      </td>
                      <td className="py-3 px-4 text-center text-gray-600 dark:text-gray-400">
                        {dev.projectsCount}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-20 h-2 bg-gray-100 dark:bg-gray-700 rounded-full">
                            <div
                              className="h-full bg-redstone-500 rounded-full"
                              style={{ width: `${costShare}%` }}
                            />
                          </div>
                          <span className="text-xs text-gray-500">{costShare.toFixed(1)}%</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function MilestonesTab({
  milestones,
  onEdit,
}: {
  milestones: Milestone[];
  onEdit: (m: Milestone) => void;
}) {
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: accountsService.deleteMilestone,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['milestones'] });
      queryClient.invalidateQueries({ queryKey: ['accounts-overview'] });
      toast.success('Milestone deleted');
    },
    onError: () => {
      toast.error('Failed to delete milestone');
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      accountsService.updateMilestone(id, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['milestones'] });
      queryClient.invalidateQueries({ queryKey: ['accounts-overview'] });
      toast.success('Milestone status updated');
    },
    onError: () => {
      toast.error('Failed to update milestone');
    },
  });

  const released = milestones.filter((m) => m.status === 'COMPLETED');
  const pending = milestones.filter((m) => m.status !== 'COMPLETED' && m.status !== 'CANCELLED');
  const totalAmount = milestones.reduce((sum, m) => sum + (m.amountPKR || 0), 0);
  const releasedAmount = released.reduce((sum, m) => sum + (m.amountPKR || 0), 0);

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryCard
          title="Total Milestones"
          value={milestones.length}
          icon={BanknotesIcon}
          color="cyan"
        />
        <SummaryCard
          title="Released"
          value={released.length}
          icon={CheckCircleIcon}
          color="emerald"
        />
        <SummaryCard
          title="Pending"
          value={pending.length}
          icon={CalendarDaysIcon}
          color="amber"
        />
        <SummaryCard
          title="Total Value"
          value={formatPKR(totalAmount)}
          icon={CurrencyDollarIcon}
          color="redstone"
        />
      </div>

      {/* Progress Bar */}
      <Card>
        <CardContent className="py-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Release Progress
            </span>
            <span className="text-sm text-gray-500">
              {formatPKR(releasedAmount)} / {formatPKR(totalAmount)}
            </span>
          </div>
          <div className="h-3 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full transition-all"
              style={{ width: `${totalAmount > 0 ? (releasedAmount / totalAmount) * 100 : 0}%` }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Milestones Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">All Milestones</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                    Milestone
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                    Project
                  </th>
                  <th className="text-right py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                    Amount
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                    Status
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                    Due Date
                  </th>
                  <th className="text-right py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {milestones.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-gray-500 dark:text-gray-400">
                      No milestones yet. Click "Add Milestone" to create one.
                    </td>
                  </tr>
                ) : (
                  milestones.map((milestone) => (
                    <tr
                      key={milestone.id}
                      className="border-b border-gray-100 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                    >
                      <td className="py-3 px-4">
                        <div>
                          <span className="font-medium text-gray-900 dark:text-white">
                            {milestone.title}
                          </span>
                          {milestone.description && (
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                              {milestone.description}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div>
                          <span className="text-gray-900 dark:text-white">
                            {milestone.project.name}
                          </span>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {milestone.project.client.name}
                          </p>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div>
                          <span className="font-medium text-gray-900 dark:text-white">
                            {milestone.currency} {milestone.amount?.toLocaleString()}
                          </span>
                          {milestone.amountPKR && (
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              ≈ {formatPKR(milestone.amountPKR)}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <select
                          value={milestone.status}
                          onChange={(e) =>
                            updateStatusMutation.mutate({
                              id: milestone.id,
                              status: e.target.value,
                            })
                          }
                          className={cn(
                            'text-xs font-medium rounded-md px-2 py-1 border-0 cursor-pointer focus:outline-none focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-600',
                            getMilestoneStatusBadge(milestone.status)
                          )}
                        >
                          <option value="NOT_STARTED">Pending</option>
                          <option value="IN_PROGRESS">In Progress</option>
                          <option value="COMPLETED">Released</option>
                          <option value="CANCELLED">Cancelled</option>
                        </select>
                      </td>
                      <td className="py-3 px-4 text-gray-600 dark:text-gray-400">
                        {milestone.dueDate
                          ? new Date(milestone.dueDate).toLocaleDateString()
                          : '-'}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => onEdit(milestone)}
                            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                          >
                            <PencilIcon className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm('Are you sure you want to delete this milestone?')) {
                                deleteMutation.mutate(milestone.id);
                              }
                            }}
                            className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10 text-gray-500 hover:text-red-600 dark:hover:text-red-400"
                          >
                            <TrashIcon className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function TimeAnalysisTab({ overview }: { overview?: AccountsOverview }) {
  if (!overview) return null;

  const { projectBreakdown } = overview;
  const totalHours = projectBreakdown.reduce((sum, p) => sum + p.hoursWorked, 0);

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryCard
          title="Total Hours"
          value={`${totalHours.toFixed(0)}h`}
          icon={ClockIcon}
          color="cyan"
        />
        <SummaryCard
          title="Projects"
          value={projectBreakdown.length}
          icon={FolderIcon}
          color="redstone"
        />
        <SummaryCard
          title="Avg Hours/Project"
          value={`${(totalHours / Math.max(projectBreakdown.length, 1)).toFixed(1)}h`}
          icon={ChartBarIcon}
          color="emerald"
        />
        <SummaryCard
          title="Cost/Hour"
          value={formatPKR(overview.summary.averageHourlyRate)}
          icon={CurrencyDollarIcon}
          color="amber"
        />
      </div>

      {/* Time by Project */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Time Spent by Project</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {projectBreakdown
              .filter((p) => p.hoursWorked > 0)
              .sort((a, b) => b.hoursWorked - a.hoursWorked)
              .map((project) => {
                const percentage = totalHours > 0 ? (project.hoursWorked / totalHours) * 100 : 0;
                return (
                  <div key={project.id} className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-redstone-100 dark:bg-redstone-500/10 flex items-center justify-center flex-shrink-0">
                      <FolderIcon className="w-5 h-5 text-redstone-600 dark:text-redstone-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between mb-1">
                        <span className="font-medium text-gray-900 dark:text-white truncate">
                          {project.name}
                        </span>
                        <span className="text-gray-500 ml-2">{project.hoursWorked}h</span>
                      </div>
                      <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-redstone-500 rounded-full"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                    <span className="text-xs text-gray-500 w-12 text-right">
                      {percentage.toFixed(1)}%
                    </span>
                  </div>
                );
              })}
            {projectBreakdown.filter((p) => p.hoursWorked > 0).length === 0 && (
              <p className="text-center text-gray-500 dark:text-gray-400 py-8">
                No time tracked yet
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function ProjectFinanceTab({ projects }: { projects: any[] }) {
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const queryClient = useQueryClient();

  const { data: financials, isLoading } = useQuery({
    queryKey: ['project-financials', selectedProjectId],
    queryFn: () => accountsService.getProjectFinancials(selectedProjectId),
    enabled: !!selectedProjectId,
  });

  if (!selectedProjectId) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <CalculatorIcon className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                Select a Project
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                Choose a project to view detailed financial breakdown
              </p>
              <select
                value={selectedProjectId}
                onChange={(e) => setSelectedProjectId(e.target.value)}
                className="px-4 py-2.5 bg-gray-50 dark:bg-black border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-600 min-w-[300px]"
              >
                <option value="">Select project...</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  if (!financials) {
    return (
      <div className="text-center py-12 text-gray-500">
        Failed to load financial data
      </div>
    );
  }

  const { project, client, costBreakdown, taskCosts, roleBreakdown, milestones } = financials;

  return (
    <div className="space-y-6">
      {/* Project Selector & Settings */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <select
            value={selectedProjectId}
            onChange={(e) => setSelectedProjectId(e.target.value)}
            className="px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-600"
          >
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            Client: <span className="font-medium text-gray-700 dark:text-gray-300">{client.name}</span>
          </span>
        </div>
        <Button variant="outline" size="sm" onClick={() => setShowSettingsModal(true)}>
          <CogIcon className="w-4 h-4 mr-2" />
          Financial Settings
        </Button>
      </div>

      {/* Budget Overview Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="relative overflow-hidden">
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">Total Budget</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white mt-1">
                  {project.currency} {project.budget?.toLocaleString() || 0}
                </p>
              </div>
              <div className="p-2 rounded-lg bg-cyan-50 dark:bg-cyan-500/10">
                <BanknotesIcon className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
              </div>
            </div>
            {project.platformFeePercent && (
              <p className="text-xs text-gray-400 mt-2">
                Platform fee: {project.platformFeePercent}% ({project.currency} {project.platformFeeAmount?.toLocaleString()})
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">Payable Amount</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white mt-1">
                  {project.currency} {project.payableAmount?.toLocaleString() || project.budget?.toLocaleString() || 0}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  PKR {project.payableAmountPKR?.toLocaleString() || '-'}
                </p>
              </div>
              <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-500/10">
                <CurrencyDollarIcon className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">Working Budget</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white mt-1">
                  PKR {project.workingBudgetPKR?.toLocaleString() || project.payableAmountPKR?.toLocaleString() || '-'}
                </p>
              </div>
              <div className="p-2 rounded-lg bg-amber-50 dark:bg-amber-500/10">
                <CalculatorIcon className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              </div>
            </div>
            <p className="text-xs text-gray-400 mt-2">
              Exchange Rate: {project.exchangeRate || 280} PKR/USD
            </p>
          </CardContent>
        </Card>

        <Card className={cn(costBreakdown.isOverBudget && 'ring-2 ring-red-500')}>
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">Cost Consumed</p>
                <p className={cn(
                  'text-xl font-bold mt-1',
                  costBreakdown.isOverBudget ? 'text-red-600 dark:text-red-400' : 'text-gray-900 dark:text-white'
                )}>
                  PKR {costBreakdown.totalCostPKR?.toLocaleString()}
                </p>
              </div>
              <div className={cn(
                'p-2 rounded-lg',
                costBreakdown.isOverBudget
                  ? 'bg-red-50 dark:bg-red-500/10'
                  : 'bg-redstone-50 dark:bg-redstone-500/10'
              )}>
                {costBreakdown.isOverBudget ? (
                  <ExclamationTriangleIcon className="w-5 h-5 text-red-600 dark:text-red-400" />
                ) : (
                  <ClockIcon className="w-5 h-5 text-redstone-600 dark:text-redstone-400" />
                )}
              </div>
            </div>
            <p className={cn(
              'text-xs mt-2',
              costBreakdown.budgetConsumedPercent > 100
                ? 'text-red-500'
                : costBreakdown.budgetConsumedPercent > 80
                  ? 'text-amber-500'
                  : 'text-gray-400'
            )}>
              {costBreakdown.budgetConsumedPercent.toFixed(1)}% of budget used
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Budget Progress Bar */}
      <Card>
        <CardContent className="py-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Budget Consumption
            </span>
            <span className={cn(
              'text-sm font-medium',
              costBreakdown.isOverBudget ? 'text-red-600' : 'text-gray-500'
            )}>
              {costBreakdown.isOverBudget ? (
                <span className="flex items-center gap-1">
                  <ExclamationTriangleIcon className="w-4 h-4" />
                  Over Budget by PKR {Math.abs(costBreakdown.remainingBudget).toLocaleString()}
                </span>
              ) : (
                `PKR ${costBreakdown.remainingBudget.toLocaleString()} remaining`
              )}
            </span>
          </div>
          <div className="h-4 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
            <div
              className={cn(
                'h-full rounded-full transition-all',
                costBreakdown.budgetConsumedPercent > 100
                  ? 'bg-gradient-to-r from-red-500 to-red-400'
                  : costBreakdown.budgetConsumedPercent > 80
                    ? 'bg-gradient-to-r from-amber-500 to-amber-400'
                    : 'bg-gradient-to-r from-emerald-500 to-emerald-400'
              )}
              style={{ width: `${Math.min(costBreakdown.budgetConsumedPercent, 100)}%` }}
            />
          </div>
          <div className="flex justify-between mt-2 text-xs text-gray-500">
            <span>{costBreakdown.totalHours}h logged</span>
            <span>{costBreakdown.budgetConsumedPercent.toFixed(1)}%</span>
          </div>
        </CardContent>
      </Card>

      {/* Role Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Cost by Role</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="text-center p-3 bg-gray-50 dark:bg-black rounded-lg">
              <p className="text-xs text-gray-500 uppercase">Developers</p>
              <p className="text-lg font-bold text-gray-900 dark:text-white">
                PKR {costBreakdown.developerCost.toLocaleString()}
              </p>
            </div>
            <div className="text-center p-3 bg-gray-50 dark:bg-black rounded-lg">
              <p className="text-xs text-gray-500 uppercase">Designers</p>
              <p className="text-lg font-bold text-gray-900 dark:text-white">
                PKR {costBreakdown.designerCost.toLocaleString()}
              </p>
            </div>
            <div className="text-center p-3 bg-gray-50 dark:bg-black rounded-lg">
              <p className="text-xs text-gray-500 uppercase">QC</p>
              <p className="text-lg font-bold text-gray-900 dark:text-white">
                PKR {costBreakdown.qcCost.toLocaleString()}
              </p>
            </div>
            <div className="text-center p-3 bg-gray-50 dark:bg-black rounded-lg">
              <p className="text-xs text-gray-500 uppercase">PM</p>
              <p className="text-lg font-bold text-gray-900 dark:text-white">
                PKR {costBreakdown.pmCost.toLocaleString()}
              </p>
            </div>
          </div>

          {roleBreakdown.length > 0 && (
            <div className="space-y-4">
              {roleBreakdown.map((role) => (
                <div key={role.role} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-medium text-gray-900 dark:text-white">
                      {role.role.replace('_', ' ')}
                    </span>
                    <span className="text-sm text-gray-500">
                      {role.totalHours}h - PKR {role.totalCost.toLocaleString()}
                    </span>
                  </div>
                  <div className="space-y-2">
                    {role.members.map((member) => (
                      <div key={member.id} className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-redstone-100 dark:bg-redstone-500/10 flex items-center justify-center">
                            <span className="text-xs font-bold text-redstone-600 dark:text-redstone-400">
                              {member.name.split(' ').map((n) => n[0]).join('')}
                            </span>
                          </div>
                          <span className="text-gray-700 dark:text-gray-300">{member.name}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-gray-900 dark:text-white font-medium">
                            PKR {member.cost.toLocaleString()}
                          </span>
                          <span className="text-gray-400 ml-2">({member.hoursWorked}h)</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Task Cost Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Task Cost Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Task</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Assignee</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Est. Hours</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Actual Hours</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Hourly Rate</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Actual Cost</th>
                  <th className="text-center py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Status</th>
                </tr>
              </thead>
              <tbody>
                {taskCosts.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-gray-500 dark:text-gray-400">
                      No tasks in this project
                    </td>
                  </tr>
                ) : (
                  taskCosts.map((task) => (
                    <tr
                      key={task.id}
                      className={cn(
                        'border-b border-gray-100 dark:border-gray-700/50',
                        task.isOverBudget && 'bg-red-50 dark:bg-red-500/5'
                      )}
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          {task.isOverBudget && (
                            <ExclamationTriangleIcon className="w-4 h-4 text-red-500 flex-shrink-0" />
                          )}
                          <span className="font-medium text-gray-900 dark:text-white">
                            {task.title}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-gray-600 dark:text-gray-400">
                        {task.assignee ? (
                          <div>
                            <span>{task.assignee.name}</span>
                            <span className="text-xs text-gray-400 ml-1">({task.assignee.role})</span>
                          </div>
                        ) : (
                          <span className="text-gray-400">Unassigned</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right text-gray-600 dark:text-gray-400">
                        {task.estimatedHours !== null ? `${task.estimatedHours}h` : '-'}
                      </td>
                      <td className={cn(
                        'py-3 px-4 text-right font-medium',
                        task.isOverBudget ? 'text-red-600 dark:text-red-400' : 'text-gray-900 dark:text-white'
                      )}>
                        {task.actualHours}h
                      </td>
                      <td className="py-3 px-4 text-right text-gray-600 dark:text-gray-400">
                        {task.assignee ? `PKR ${Math.round(task.assignee.hourlyRate).toLocaleString()}/h` : '-'}
                      </td>
                      <td className={cn(
                        'py-3 px-4 text-right font-medium',
                        task.isOverBudget ? 'text-red-600 dark:text-red-400' : 'text-gray-900 dark:text-white'
                      )}>
                        PKR {task.actualCost.toLocaleString()}
                        {task.costVariance !== 0 && task.estimatedCost > 0 && (
                          <span className={cn(
                            'text-xs ml-1',
                            task.costVariance > 0 ? 'text-red-500' : 'text-emerald-500'
                          )}>
                            ({task.costVariance > 0 ? '+' : ''}{task.costVariance.toLocaleString()})
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className={cn(
                          'px-2 py-1 rounded-md text-xs font-medium',
                          getStatusBadge(task.status)
                        )}>
                          {task.status.replace('_', ' ')}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
              {taskCosts.length > 0 && (
                <tfoot>
                  <tr className="bg-gray-50 dark:bg-black">
                    <td colSpan={3} className="py-3 px-4 font-medium text-gray-900 dark:text-white">
                      Total
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-gray-900 dark:text-white">
                      {taskCosts.reduce((sum, t) => sum + t.actualHours, 0).toFixed(1)}h
                    </td>
                    <td className="py-3 px-4"></td>
                    <td className="py-3 px-4 text-right font-bold text-gray-900 dark:text-white">
                      PKR {taskCosts.reduce((sum, t) => sum + t.actualCost, 0).toLocaleString()}
                    </td>
                    <td className="py-3 px-4"></td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Milestones Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Milestones</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="p-4 bg-gray-50 dark:bg-black rounded-lg">
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{milestones.total}</p>
              <p className="text-xs text-gray-500 uppercase">Total</p>
            </div>
            <div className="p-4 bg-emerald-50 dark:bg-emerald-500/10 rounded-lg">
              <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{milestones.released}</p>
              <p className="text-xs text-gray-500 uppercase">Released</p>
              <p className="text-sm text-emerald-600 dark:text-emerald-400 mt-1">
                {project.currency} {milestones.releasedAmount.toLocaleString()}
              </p>
            </div>
            <div className="p-4 bg-amber-50 dark:bg-amber-500/10 rounded-lg">
              <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">{milestones.pending}</p>
              <p className="text-xs text-gray-500 uppercase">Pending</p>
              <p className="text-sm text-amber-600 dark:text-amber-400 mt-1">
                {project.currency} {milestones.pendingAmount.toLocaleString()}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Financial Settings Modal */}
      {showSettingsModal && (
        <FinancialSettingsModal
          projectId={selectedProjectId}
          currentSettings={{
            platformFeePercent: project.platformFeePercent,
            workingBudget: project.workingBudget,
            exchangeRate: project.exchangeRate,
          }}
          currency={project.currency}
          onClose={() => setShowSettingsModal(false)}
          onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ['project-financials', selectedProjectId] });
            setShowSettingsModal(false);
          }}
        />
      )}
    </div>
  );
}

function FinancialSettingsModal({
  projectId,
  currentSettings,
  currency,
  onClose,
  onSuccess,
}: {
  projectId: string;
  currentSettings: {
    platformFeePercent: number | null;
    workingBudget: number | null;
    exchangeRate: number | null;
  };
  currency: string;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [formData, setFormData] = useState({
    platformFeePercent: currentSettings.platformFeePercent?.toString() || '',
    workingBudget: currentSettings.workingBudget?.toString() || '',
    exchangeRate: currentSettings.exchangeRate?.toString() || '',
  });

  const updateMutation = useMutation({
    mutationFn: (data: any) => accountsService.updateProjectFinancials(projectId, data),
    onSuccess: () => {
      toast.success('Financial settings updated');
      onSuccess();
    },
    onError: () => {
      toast.error('Failed to update settings');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate({
      platformFeePercent: formData.platformFeePercent ? parseFloat(formData.platformFeePercent) : undefined,
      workingBudget: formData.workingBudget ? parseFloat(formData.workingBudget) : undefined,
      exchangeRate: formData.exchangeRate ? parseFloat(formData.exchangeRate) : undefined,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white dark:bg-black rounded-2xl shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-black rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-redstone-100 dark:bg-redstone-500/10 flex items-center justify-center">
              <CogIcon className="w-5 h-5 text-redstone-600 dark:text-redstone-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Financial Settings
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <XMarkIcon className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
              Platform Fee (%)
            </label>
            <input
              type="number"
              min="0"
              max="100"
              step="0.01"
              value={formData.platformFeePercent}
              onChange={(e) => setFormData({ ...formData, platformFeePercent: e.target.value })}
              className="w-full px-4 py-2.5 bg-gray-50 dark:bg-black border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-600"
              placeholder="e.g., 10 for 10%"
            />
            <p className="text-xs text-gray-400 mt-1">
              Percentage deducted from budget (e.g., Upwork fee)
            </p>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
              Working Budget ({currency})
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={formData.workingBudget}
              onChange={(e) => setFormData({ ...formData, workingBudget: e.target.value })}
              className="w-full px-4 py-2.5 bg-gray-50 dark:bg-black border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-600"
              placeholder="Budget allocated for execution"
            />
            <p className="text-xs text-gray-400 mt-1">
              Leave empty to use payable amount after fee deduction
            </p>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
              Exchange Rate (PKR per {currency})
            </label>
            <input
              type="number"
              min="0"
              step="0.0001"
              value={formData.exchangeRate}
              onChange={(e) => setFormData({ ...formData, exchangeRate: e.target.value })}
              className="w-full px-4 py-2.5 bg-gray-50 dark:bg-black border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-600"
              placeholder="e.g., 280 for USD"
            />
            <p className="text-xs text-gray-400 mt-1">
              Leave empty to use default rate
            </p>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" isLoading={updateMutation.isPending}>
              Save Settings
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

function MilestoneModal({
  milestone,
  projects,
  onClose,
  onSuccess,
}: {
  milestone: Milestone | null;
  projects: any[];
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [formData, setFormData] = useState({
    projectId: milestone?.project.id || '',
    title: milestone?.title || '',
    description: milestone?.description || '',
    amount: milestone?.amount?.toString() || '',
    currency: milestone?.currency || 'USD',
    dueDate: milestone?.dueDate ? milestone.dueDate.split('T')[0] : '',
  });

  const createMutation = useMutation({
    mutationFn: accountsService.createMilestone,
    onSuccess: () => {
      toast.success('Milestone created');
      onSuccess();
    },
    onError: () => {
      toast.error('Failed to create milestone');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      accountsService.updateMilestone(id, data),
    onSuccess: () => {
      toast.success('Milestone updated');
      onSuccess();
    },
    onError: () => {
      toast.error('Failed to update milestone');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      ...formData,
      amount: parseFloat(formData.amount),
      dueDate: formData.dueDate || undefined,
    };

    if (milestone) {
      updateMutation.mutate({ id: milestone.id, data });
    } else {
      createMutation.mutate(data as any);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white dark:bg-black rounded-2xl shadow-xl w-full max-w-lg">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-black rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-redstone-100 dark:bg-redstone-500/10 flex items-center justify-center">
              <BanknotesIcon className="w-5 h-5 text-redstone-600 dark:text-redstone-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {milestone ? 'Edit Milestone' : 'New Milestone'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <XMarkIcon className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
              Project
            </label>
            <select
              required
              value={formData.projectId}
              onChange={(e) => setFormData({ ...formData, projectId: e.target.value })}
              className="w-full px-4 py-2.5 bg-gray-50 dark:bg-black border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-600"
            >
              <option value="">Select project</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
              Title
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-2.5 bg-gray-50 dark:bg-black border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-600"
              placeholder="e.g., Phase 1 Completion"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-2.5 bg-gray-50 dark:bg-black border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-600 resize-none"
              rows={2}
              placeholder="Optional description..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                Amount
              </label>
              <input
                type="number"
                required
                min="0"
                step="0.01"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                className="w-full px-4 py-2.5 bg-gray-50 dark:bg-black border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-600"
                placeholder="1000"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                Currency
              </label>
              <select
                value={formData.currency}
                onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                className="w-full px-4 py-2.5 bg-gray-50 dark:bg-black border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-600"
              >
                <option value="USD">USD</option>
                <option value="PKR">PKR</option>
                <option value="EUR">EUR</option>
                <option value="GBP">GBP</option>
                <option value="AUD">AUD</option>
                <option value="CAD">CAD</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
              Due Date
            </label>
            <input
              type="date"
              value={formData.dueDate}
              onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
              className="w-full px-4 py-2.5 bg-gray-50 dark:bg-black border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-600"
            />
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              isLoading={createMutation.isPending || updateMutation.isPending}
            >
              {milestone ? 'Update' : 'Create'} Milestone
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Date range presets
type DateRangePreset = 'all' | 'today' | 'yesterday' | 'thisWeek' | 'thisMonth' | 'thisYear' | 'custom';

function getDateRange(preset: DateRangePreset): { startDate?: string; endDate?: string } {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  switch (preset) {
    case 'today':
      return { startDate: today.toISOString(), endDate: now.toISOString() };
    case 'yesterday': {
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      return { startDate: yesterday.toISOString(), endDate: today.toISOString() };
    }
    case 'thisWeek': {
      const startOfWeek = new Date(today);
      startOfWeek.setDate(today.getDate() - today.getDay());
      return { startDate: startOfWeek.toISOString(), endDate: now.toISOString() };
    }
    case 'thisMonth': {
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      return { startDate: startOfMonth.toISOString(), endDate: now.toISOString() };
    }
    case 'thisYear': {
      const startOfYear = new Date(today.getFullYear(), 0, 1);
      return { startDate: startOfYear.toISOString(), endDate: now.toISOString() };
    }
    default:
      return {};
  }
}

// Currency symbols and colors
const currencyConfig: Record<string, { symbol: string; color: string }> = {
  USD: { symbol: '$', color: 'emerald' },
  GBP: { symbol: '£', color: 'blue' },
  EUR: { symbol: '€', color: 'indigo' },
  AUD: { symbol: 'A$', color: 'cyan' },
  PKR: { symbol: 'Rs', color: 'amber' },
  CAD: { symbol: 'C$', color: 'red' },
};

function TransactionsTab() {
  const [showImportModal, setShowImportModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<any>(null);
  const [datePreset, setDatePreset] = useState<DateRangePreset>('all');
  const [customDateRange, setCustomDateRange] = useState({ start: '', end: '' });
  const [filters, setFilters] = useState({
    search: '',
    type: '',
    currency: '',
    startDate: '',
    endDate: '',
    page: 1,
  });

  const queryClient = useQueryClient();

  // Update filters when date preset changes
  const handleDatePresetChange = (preset: DateRangePreset) => {
    setDatePreset(preset);
    if (preset === 'custom') {
      return; // Don't update filters, wait for custom date input
    }
    const range = getDateRange(preset);
    setFilters({ ...filters, startDate: range.startDate || '', endDate: range.endDate || '', page: 1 });
  };

  const handleCustomDateApply = () => {
    setFilters({
      ...filters,
      startDate: customDateRange.start ? new Date(customDateRange.start).toISOString() : '',
      endDate: customDateRange.end ? new Date(customDateRange.end + 'T23:59:59').toISOString() : '',
      page: 1,
    });
  };

  const { data: transactionsData, isLoading } = useQuery({
    queryKey: ['transactions', filters],
    queryFn: () => transactionService.getAll({
      ...filters,
      limit: 50,
    }),
  });

  const { data: summary } = useQuery({
    queryKey: ['transaction-summary', filters.startDate, filters.endDate],
    queryFn: () => transactionService.getSummary({
      startDate: filters.startDate || undefined,
      endDate: filters.endDate || undefined,
    }),
  });

  const { data: transactionProjects } = useQuery({
    queryKey: ['transaction-projects'],
    queryFn: () => transactionService.getProjects(),
  });

  const deleteMutation = useMutation({
    mutationFn: transactionService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['transaction-summary'] });
      toast.success('Transaction deleted');
    },
    onError: () => {
      toast.error('Failed to delete transaction');
    },
  });

  const transactions = transactionsData?.data || [];
  const meta = transactionsData?.meta || { total: 0, page: 1, totalPages: 1 };

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      MILESTONE_PAYMENT: 'bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400',
      PROJECT_FEE: 'bg-red-100 dark:bg-red-500/10 text-red-700 dark:text-red-400',
      PREFERRED_FEE: 'bg-orange-100 dark:bg-orange-500/10 text-orange-700 dark:text-orange-400',
      HOURLY_FEE: 'bg-amber-100 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400',
      WITHDRAWAL: 'bg-purple-100 dark:bg-purple-500/10 text-purple-700 dark:text-purple-400',
      CURRENCY_CONVERSION: 'bg-cyan-100 dark:bg-cyan-500/10 text-cyan-700 dark:text-cyan-400',
      LOCK: 'bg-gray-100 dark:bg-gray-500/10 text-gray-700 dark:text-gray-400',
      UNLOCK: 'bg-gray-100 dark:bg-gray-500/10 text-gray-700 dark:text-gray-400',
      MEMBERSHIP: 'bg-blue-100 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400',
      REFUND: 'bg-lime-100 dark:bg-lime-500/10 text-lime-700 dark:text-lime-400',
    };
    return colors[type] || 'bg-gray-100 text-gray-700';
  };

  const formatAmount = (amount: number, currency: string) => {
    const prefix = amount >= 0 ? '+' : '';
    const config = currencyConfig[currency] || { symbol: currency };
    return `${prefix}${config.symbol}${Math.abs(amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  // Calculate totals by currency for display
  const earningsByCurrency = summary?.totalEarnings || {};
  const feesByCurrency = summary?.totalFees || {};
  const withdrawalsByCurrency = summary?.totalWithdrawals || {};

  return (
    <div className="space-y-6">
      {/* Multi-Currency Summary Cards */}
      {summary && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Gross Earnings by Currency */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-500/10">
                  <ArrowTrendingUpIcon className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">Gross Earnings</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {Object.entries(earningsByCurrency).length === 0 ? (
                  <p className="text-sm text-gray-500">No earnings yet</p>
                ) : (
                  Object.entries(earningsByCurrency)
                    .filter(([_, amount]) => amount > 0)
                    .sort((a, b) => b[1] - a[1])
                    .map(([currency, amount]) => {
                      const config = currencyConfig[currency] || { symbol: currency, color: 'gray' };
                      return (
                        <div key={currency} className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">{currency}</span>
                          <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                            {config.symbol}{amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                          </span>
                        </div>
                      );
                    })
                )}
              </div>
            </CardContent>
          </Card>

          {/* Platform Fees by Currency */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-red-50 dark:bg-red-500/10">
                  <ArrowTrendingDownIcon className="w-5 h-5 text-red-600 dark:text-red-400" />
                </div>
                <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">Platform Fees</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {Object.entries(feesByCurrency).length === 0 ? (
                  <p className="text-sm text-gray-500">No fees</p>
                ) : (
                  Object.entries(feesByCurrency)
                    .filter(([_, amount]) => amount > 0)
                    .sort((a, b) => b[1] - a[1])
                    .map(([currency, amount]) => {
                      const config = currencyConfig[currency] || { symbol: currency, color: 'gray' };
                      return (
                        <div key={currency} className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">{currency}</span>
                          <span className="text-lg font-bold text-red-600 dark:text-red-400">
                            -{config.symbol}{amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                          </span>
                        </div>
                      );
                    })
                )}
              </div>
            </CardContent>
          </Card>

          {/* Withdrawals by Currency */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-purple-50 dark:bg-purple-500/10">
                  <BanknotesIcon className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
                <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">Withdrawals</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {Object.entries(withdrawalsByCurrency).length === 0 ? (
                  <p className="text-sm text-gray-500">No withdrawals</p>
                ) : (
                  Object.entries(withdrawalsByCurrency)
                    .filter(([_, amount]) => amount > 0)
                    .sort((a, b) => b[1] - a[1])
                    .map(([currency, amount]) => {
                      const config = currencyConfig[currency] || { symbol: currency, color: 'gray' };
                      return (
                        <div key={currency} className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">{currency}</span>
                          <span className="text-lg font-bold text-purple-600 dark:text-purple-400">
                            {config.symbol}{amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                          </span>
                        </div>
                      );
                    })
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Quick Stats Row */}
      {summary && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-xl p-4">
            <div className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Total Transactions</div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{meta.total}</div>
          </div>
          <div className="bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-xl p-4">
            <div className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Unique Projects</div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{transactionProjects?.length || 0}</div>
          </div>
          <div className="bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-xl p-4">
            <div className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Unique Clients</div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{Object.keys(summary?.byClient || {}).length}</div>
          </div>
          <div className="bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-xl p-4">
            <div className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Transaction Types</div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{Object.keys(summary?.byType || {}).length}</div>
          </div>
        </div>
      )}

      {/* Date Range Presets */}
      <Card>
        <CardContent className="py-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400 mr-2">
              <CalendarDaysIcon className="w-4 h-4 inline mr-1" />
              Period:
            </span>
            {[
              { id: 'all', label: 'All Time' },
              { id: 'today', label: 'Today' },
              { id: 'yesterday', label: 'Yesterday' },
              { id: 'thisWeek', label: 'This Week' },
              { id: 'thisMonth', label: 'This Month' },
              { id: 'thisYear', label: 'This Year' },
              { id: 'custom', label: 'Custom' },
            ].map((preset) => (
              <button
                key={preset.id}
                onClick={() => handleDatePresetChange(preset.id as DateRangePreset)}
                className={cn(
                  'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
                  datePreset === preset.id
                    ? 'bg-redstone-100 dark:bg-redstone-500/10 text-redstone-700 dark:text-redstone-400'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                )}
              >
                {preset.label}
              </button>
            ))}

            {datePreset === 'custom' && (
              <div className="flex items-center gap-2 ml-4">
                <input
                  type="date"
                  value={customDateRange.start}
                  onChange={(e) => setCustomDateRange({ ...customDateRange, start: e.target.value })}
                  className="px-3 py-1.5 bg-gray-50 dark:bg-black border border-gray-200 dark:border-gray-700 rounded-lg text-sm"
                />
                <span className="text-gray-400">to</span>
                <input
                  type="date"
                  value={customDateRange.end}
                  onChange={(e) => setCustomDateRange({ ...customDateRange, end: e.target.value })}
                  className="px-3 py-1.5 bg-gray-50 dark:bg-black border border-gray-200 dark:border-gray-700 rounded-lg text-sm"
                />
                <Button size="sm" onClick={handleCustomDateApply}>Apply</Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Filters & Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <MagnifyingGlassIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search transactions..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value, page: 1 })}
              className="pl-9 pr-4 py-2 bg-gray-50 dark:bg-black border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-600 w-64"
            />
          </div>
          <select
            value={filters.type}
            onChange={(e) => setFilters({ ...filters, type: e.target.value, page: 1 })}
            className="px-3 py-2 bg-gray-50 dark:bg-black border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-600"
          >
            <option value="">All Types</option>
            <option value="MILESTONE_PAYMENT">Payments</option>
            <option value="PROJECT_FEE">Project Fees</option>
            <option value="PREFERRED_FEE">Preferred Fees</option>
            <option value="HOURLY_FEE">Hourly Fees</option>
            <option value="WITHDRAWAL">Withdrawals</option>
            <option value="MEMBERSHIP">Membership</option>
            <option value="REFUND">Refunds</option>
          </select>
          <select
            value={filters.currency}
            onChange={(e) => setFilters({ ...filters, currency: e.target.value, page: 1 })}
            className="px-3 py-2 bg-gray-50 dark:bg-black border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-600"
          >
            <option value="">All Currencies</option>
            <option value="USD">USD ($)</option>
            <option value="GBP">GBP (£)</option>
            <option value="EUR">EUR (€)</option>
            <option value="PKR">PKR (Rs)</option>
            <option value="AUD">AUD (A$)</option>
            <option value="CAD">CAD (C$)</option>
          </select>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setShowCreateModal(true)}>
            <PlusIcon className="w-4 h-4 mr-2" />
            Add Transaction
          </Button>
          <Button onClick={() => setShowImportModal(true)}>
            <ArrowUpTrayIcon className="w-4 h-4 mr-2" />
            Import CSV
          </Button>
        </div>
      </div>

      {/* Transactions Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Transaction History</CardTitle>
            <span className="text-sm text-gray-500">{meta.total} transactions</span>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <LoadingSkeleton />
          ) : transactions.length === 0 ? (
            <div className="text-center py-12">
              <DocumentTextIcon className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No transactions yet
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                Import your Freelancer transaction history to get started
              </p>
              <Button onClick={() => setShowImportModal(true)}>
                <ArrowUpTrayIcon className="w-4 h-4 mr-2" />
                Import CSV
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Date</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Type</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Project / Description</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Client</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Amount</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((t: any) => (
                    <tr
                      key={t.id}
                      className="border-b border-gray-100 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                    >
                      <td className="py-3 px-4 text-gray-600 dark:text-gray-400 whitespace-nowrap">
                        {new Date(t.date).toLocaleDateString('en-GB', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </td>
                      <td className="py-3 px-4">
                        <span className={cn('px-2 py-1 rounded-md text-xs font-medium', getTypeColor(t.type))}>
                          {t.type.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="max-w-xs">
                          {t.projectName ? (
                            <span className="font-medium text-gray-900 dark:text-white">{t.projectName}</span>
                          ) : (
                            <span className="text-gray-500 dark:text-gray-400 text-xs truncate block">
                              {t.description.substring(0, 60)}...
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-gray-600 dark:text-gray-400">
                        {t.clientName || '-'}
                      </td>
                      <td className={cn(
                        'py-3 px-4 text-right font-medium whitespace-nowrap',
                        t.amount >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'
                      )}>
                        {formatAmount(t.amount, t.currency)}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => {
                              setEditingTransaction(t);
                              setShowEditModal(true);
                            }}
                            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                          >
                            <PencilIcon className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm('Delete this transaction?')) {
                                deleteMutation.mutate(t.id);
                              }
                            }}
                            className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10 text-gray-500 hover:text-red-600 dark:hover:text-red-400"
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

          {/* Pagination */}
          {meta.totalPages > 1 && (
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <span className="text-sm text-gray-500">
                Page {meta.page} of {meta.totalPages}
              </span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={meta.page <= 1}
                  onClick={() => setFilters({ ...filters, page: filters.page - 1 })}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={meta.page >= meta.totalPages}
                  onClick={() => setFilters({ ...filters, page: filters.page + 1 })}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Projects from Transactions */}
      {transactionProjects && transactionProjects.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Projects from Transaction History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Project</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Client</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Total Earned</th>
                    <th className="text-center py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Payments</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Period</th>
                  </tr>
                </thead>
                <tbody>
                  {transactionProjects.slice(0, 10).map((p: any, i: number) => (
                    <tr key={i} className="border-b border-gray-100 dark:border-gray-700/50">
                      <td className="py-3 px-4 font-medium text-gray-900 dark:text-white">
                        {p.name}
                      </td>
                      <td className="py-3 px-4 text-gray-600 dark:text-gray-400">
                        {p.client || '-'}
                      </td>
                      <td className="py-3 px-4 text-right font-medium text-emerald-600 dark:text-emerald-400">
                        {p.currency} {p.totalEarned.toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-center text-gray-600 dark:text-gray-400">
                        {p.payments}
                      </td>
                      <td className="py-3 px-4 text-gray-600 dark:text-gray-400 text-xs">
                        {new Date(p.firstPayment).toLocaleDateString()} - {new Date(p.lastPayment).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Import Modal */}
      {showImportModal && (
        <ImportCSVModal
          onClose={() => setShowImportModal(false)}
          onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ['transactions'] });
            queryClient.invalidateQueries({ queryKey: ['transaction-summary'] });
            queryClient.invalidateQueries({ queryKey: ['transaction-projects'] });
            setShowImportModal(false);
          }}
        />
      )}

      {/* Edit Modal */}
      {showEditModal && editingTransaction && (
        <EditTransactionModal
          transaction={editingTransaction}
          onClose={() => {
            setShowEditModal(false);
            setEditingTransaction(null);
          }}
          onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ['transactions'] });
            queryClient.invalidateQueries({ queryKey: ['transaction-summary'] });
            setShowEditModal(false);
            setEditingTransaction(null);
          }}
        />
      )}

      {/* Create Transaction Modal */}
      {showCreateModal && (
        <CreateTransactionModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ['transactions'] });
            queryClient.invalidateQueries({ queryKey: ['transaction-summary'] });
            setShowCreateModal(false);
          }}
        />
      )}
    </div>
  );
}

function CreateTransactionModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    type: 'WITHDRAWAL',
    description: '',
    amount: '',
    currency: 'PKR',
    notes: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.description || !formData.amount) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);
    try {
      // For withdrawals, amount should be negative
      let amount = parseFloat(formData.amount);
      if (formData.type === 'WITHDRAWAL' && amount > 0) {
        amount = -amount;
      }

      await transactionService.create({
        date: formData.date,
        type: formData.type,
        description: formData.description,
        amount,
        currency: formData.currency,
        notes: formData.notes,
      });
      toast.success('Transaction created successfully');
      onSuccess();
    } catch (error) {
      toast.error('Failed to create transaction');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white dark:bg-black rounded-2xl shadow-xl w-full max-w-lg">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-black rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-redstone-100 dark:bg-redstone-500/10 flex items-center justify-center">
              <PlusIcon className="w-5 h-5 text-redstone-600 dark:text-redstone-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Add Transaction
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <XMarkIcon className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                Date
              </label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full px-4 py-2.5 bg-gray-50 dark:bg-black border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-600"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                Type
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full px-4 py-2.5 bg-gray-50 dark:bg-black border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-600"
              >
                <option value="WITHDRAWAL">Withdrawal</option>
                <option value="MILESTONE_PAYMENT">Milestone Payment</option>
                <option value="PROJECT_FEE">Project Fee</option>
                <option value="PREFERRED_FEE">Preferred Fee</option>
                <option value="HOURLY_FEE">Hourly Fee</option>
                <option value="MEMBERSHIP">Membership</option>
                <option value="REFUND">Refund</option>
                <option value="OTHER">Other</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
              Description *
            </label>
            <input
              type="text"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-2.5 bg-gray-50 dark:bg-black border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-600"
              placeholder="e.g., Express withdrawal via Payoneer"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                Amount *
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                className="w-full px-4 py-2.5 bg-gray-50 dark:bg-black border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-600"
                placeholder="e.g., 500000"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                Currency
              </label>
              <select
                value={formData.currency}
                onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                className="w-full px-4 py-2.5 bg-gray-50 dark:bg-black border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-600"
              >
                <option value="PKR">PKR (Pakistani Rupee)</option>
                <option value="USD">USD (US Dollar)</option>
                <option value="GBP">GBP (British Pound)</option>
                <option value="EUR">EUR (Euro)</option>
                <option value="AUD">AUD (Australian Dollar)</option>
                <option value="CAD">CAD (Canadian Dollar)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
              Notes
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-4 py-2.5 bg-gray-50 dark:bg-black border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-600 resize-none"
              rows={2}
              placeholder="Optional notes..."
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" isLoading={isSubmitting}>
              Create Transaction
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ImportCSVModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [csvContent, setCSVContent] = useState('');
  const [isImporting, setIsImporting] = useState(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setCSVContent(event.target?.result as string);
      };
      reader.readAsText(file);
    }
  };

  const handleImport = async () => {
    if (!csvContent) {
      toast.error('Please upload a CSV file');
      return;
    }

    setIsImporting(true);
    try {
      const result = await transactionService.importCSV(csvContent);
      toast.success(result.message);
      onSuccess();
    } catch (error) {
      toast.error('Failed to import transactions');
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white dark:bg-black rounded-2xl shadow-xl w-full max-w-lg">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-black rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-redstone-100 dark:bg-redstone-500/10 flex items-center justify-center">
              <ArrowUpTrayIcon className="w-5 h-5 text-redstone-600 dark:text-redstone-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Import Transaction History
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <XMarkIcon className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Upload Freelancer CSV
            </label>
            <input
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              className="w-full px-4 py-2.5 bg-gray-50 dark:bg-black border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-redstone-50 file:text-redstone-700 hover:file:bg-redstone-100"
            />
          </div>

          {csvContent && (
            <div className="p-3 bg-emerald-50 dark:bg-emerald-500/10 rounded-lg">
              <p className="text-sm text-emerald-700 dark:text-emerald-400">
                File loaded. Ready to import.
              </p>
            </div>
          )}

          <p className="text-xs text-gray-500">
            Export your transaction history from Freelancer.com and upload the CSV file here.
            Duplicate transactions will be automatically skipped.
          </p>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleImport} isLoading={isImporting} disabled={!csvContent}>
              Import Transactions
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function EditTransactionModal({
  transaction,
  onClose,
  onSuccess,
}: {
  transaction: any;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [formData, setFormData] = useState({
    projectName: transaction.projectName || '',
    clientName: transaction.clientName || '',
    notes: transaction.notes || '',
  });

  const updateMutation = useMutation({
    mutationFn: (data: any) => transactionService.update(transaction.id, data),
    onSuccess: () => {
      toast.success('Transaction updated');
      onSuccess();
    },
    onError: () => {
      toast.error('Failed to update transaction');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate(formData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white dark:bg-black rounded-2xl shadow-xl w-full max-w-lg">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-black rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-redstone-100 dark:bg-redstone-500/10 flex items-center justify-center">
              <PencilIcon className="w-5 h-5 text-redstone-600 dark:text-redstone-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Edit Transaction
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <XMarkIcon className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg text-sm">
            <p className="text-gray-600 dark:text-gray-400 mb-1">{transaction.description}</p>
            <p className={cn(
              'font-medium',
              transaction.amount >= 0 ? 'text-emerald-600' : 'text-red-600'
            )}>
              {transaction.currency} {transaction.amount.toLocaleString()}
            </p>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
              Project Name
            </label>
            <input
              type="text"
              value={formData.projectName}
              onChange={(e) => setFormData({ ...formData, projectName: e.target.value })}
              className="w-full px-4 py-2.5 bg-gray-50 dark:bg-black border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-600"
              placeholder="Project name"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
              Client Name
            </label>
            <input
              type="text"
              value={formData.clientName}
              onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
              className="w-full px-4 py-2.5 bg-gray-50 dark:bg-black border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-600"
              placeholder="Client name"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
              Notes
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-4 py-2.5 bg-gray-50 dark:bg-black border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-600 resize-none"
              rows={3}
              placeholder="Add notes..."
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" isLoading={updateMutation.isPending}>
              Save Changes
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Helper Components
function SummaryCard({
  title,
  value,
  icon: Icon,
  color,
  trend,
  trendValue,
}: {
  title: string;
  value: string | number;
  icon: React.ElementType;
  color: 'redstone' | 'cyan' | 'emerald' | 'amber' | 'red';
  trend?: 'up' | 'down';
  trendValue?: string;
}) {
  const colors = {
    redstone: 'bg-redstone-50 dark:bg-redstone-500/10 text-redstone-600 dark:text-redstone-400',
    cyan: 'bg-cyan-50 dark:bg-cyan-500/10 text-cyan-600 dark:text-cyan-400',
    emerald: 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
    amber: 'bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400',
    red: 'bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400',
  };

  return (
    <div className="bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-xl p-4 hover:shadow-md transition-all duration-200">
      <div className="flex items-start justify-between">
        <div className={cn('p-2 rounded-lg', colors[color])}>
          <Icon className="w-5 h-5" />
        </div>
        {trend && (
          <div
            className={cn(
              'flex items-center gap-1 text-xs',
              trend === 'up' ? 'text-emerald-600' : 'text-red-600'
            )}
          >
            {trend === 'up' ? (
              <ArrowTrendingUpIcon className="w-3 h-3" />
            ) : (
              <ArrowTrendingDownIcon className="w-3 h-3" />
            )}
            {trendValue}
          </div>
        )}
      </div>
      <div className="mt-3">
        <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{title}</p>
      </div>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-28 bg-gray-200 dark:bg-gray-700 rounded-xl" />
        ))}
      </div>
      <div className="h-80 bg-gray-200 dark:bg-gray-700 rounded-xl" />
    </div>
  );
}

// Utility functions
function formatPKR(amount: number): string {
  return `PKR ${amount.toLocaleString()}`;
}

function formatPKRShort(amount: number): string {
  if (amount >= 1000000) {
    return `${(amount / 1000000).toFixed(1)}M`;
  }
  if (amount >= 1000) {
    return `${(amount / 1000).toFixed(0)}K`;
  }
  return amount.toString();
}

function getStatusBadge(status: string): string {
  const badges: Record<string, string> = {
    PLANNING: 'bg-amber-100 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400',
    IN_PROGRESS: 'bg-cyan-100 dark:bg-cyan-500/10 text-cyan-700 dark:text-cyan-400',
    ON_HOLD: 'bg-orange-100 dark:bg-orange-500/10 text-orange-700 dark:text-orange-400',
    COMPLETED: 'bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400',
    CANCELLED: 'bg-red-100 dark:bg-red-500/10 text-red-700 dark:text-red-400',
  };
  return badges[status] || 'bg-gray-100 text-gray-700';
}

function getMilestoneStatusBadge(status: string): string {
  const badges: Record<string, string> = {
    NOT_STARTED: 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300',
    PENDING: 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300',
    IN_PROGRESS: 'bg-cyan-100 dark:bg-cyan-500/10 text-cyan-700 dark:text-cyan-400',
    COMPLETED: 'bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400',
    RELEASED: 'bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400',
    CANCELLED: 'bg-red-100 dark:bg-red-500/10 text-red-700 dark:text-red-400',
  };
  return badges[status] || 'bg-gray-100 text-gray-700';
}

// ==================== SALARY RECORDS TAB ====================

function SalaryRecordsTab() {
  const currentDate = new Date();
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());

  const { data: payrollRecords, isLoading } = useQuery({
    queryKey: ['salary-records', selectedMonth, selectedYear],
    queryFn: () => payrollService.getPayrollList(selectedMonth, selectedYear),
  });

  // Get unique years for the dropdown (current year and last 2 years)
  const years = Array.from({ length: 3 }, (_, i) => currentDate.getFullYear() - i);

  const months = [
    { value: 1, label: 'January' },
    { value: 2, label: 'February' },
    { value: 3, label: 'March' },
    { value: 4, label: 'April' },
    { value: 5, label: 'May' },
    { value: 6, label: 'June' },
    { value: 7, label: 'July' },
    { value: 8, label: 'August' },
    { value: 9, label: 'September' },
    { value: 10, label: 'October' },
    { value: 11, label: 'November' },
    { value: 12, label: 'December' },
  ];

  const paidRecords = payrollRecords?.filter((p: Payroll) => p.status === 'PAID') || [];
  const totalPaid = paidRecords.reduce((sum: number, p: Payroll) => sum + Number(p.netSalary), 0);
  const totalEmployeesPaid = paidRecords.length;

  const formatCurrency = (amount: number) => {
    return `Rs ${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const getMonthName = (month: number) => {
    return months.find(m => m.value === month)?.label || '';
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardContent className="py-4">
          <div className="flex flex-wrap items-center gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Month</label>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(Number(e.target.value))}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
              >
                {months.map((month) => (
                  <option key={month.value} value={month.value}>{month.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Year</label>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
              >
                {years.map((year) => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-500/10">
                <BanknotesIcon className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Paid</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{formatCurrency(totalPaid)}</p>
            <p className="text-sm text-gray-500 mt-1">{getMonthName(selectedMonth)} {selectedYear}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-500/10">
                <UserGroupIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">Employees Paid</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{totalEmployeesPaid}</p>
            <p className="text-sm text-gray-500 mt-1">of {payrollRecords?.length || 0} total</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-purple-50 dark:bg-purple-500/10">
                <CalendarDaysIcon className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">Selected Period</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{getMonthName(selectedMonth)}</p>
            <p className="text-sm text-gray-500 mt-1">{selectedYear}</p>
          </CardContent>
        </Card>
      </div>

      {/* Salary Records Table */}
      <Card>
        <CardHeader>
          <CardTitle>Paid Salaries - {getMonthName(selectedMonth)} {selectedYear}</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-redstone-600 mx-auto"></div>
              <p className="text-sm text-gray-500 mt-2">Loading salary records...</p>
            </div>
          ) : paidRecords.length === 0 ? (
            <div className="text-center py-8">
              <WalletIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500 dark:text-gray-400">No salary payments recorded for {getMonthName(selectedMonth)} {selectedYear}</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">Employee</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">Role</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">Base Salary</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">Deductions</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">Net Salary</th>
                    <th className="text-center py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">Present Days</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">Paid On</th>
                  </tr>
                </thead>
                <tbody>
                  {paidRecords.map((record: Payroll) => (
                    <tr key={record.id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-redstone-100 dark:bg-redstone-500/10 flex items-center justify-center">
                            <span className="text-sm font-medium text-redstone-700 dark:text-redstone-400">
                              {record.user?.firstName?.[0]}{record.user?.lastName?.[0]}
                            </span>
                          </div>
                          <span className="font-medium text-gray-900 dark:text-white">
                            {record.user?.firstName} {record.user?.lastName}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {record.user?.role?.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <span className="text-gray-900 dark:text-white">{formatCurrency(Number(record.baseSalary))}</span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <span className="text-red-600 dark:text-red-400">
                          {record.deductions ? `-${formatCurrency(Number(record.deductions))}` : '-'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <span className="font-semibold text-emerald-600 dark:text-emerald-400">{formatCurrency(Number(record.netSalary))}</span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="text-gray-900 dark:text-white">
                          {record.presentDays || 0}/{record.workingDays || 20}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-sm text-gray-600 dark:text-gray-400">{formatDate(record.paidAt)}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-gray-50 dark:bg-gray-800/50">
                    <td colSpan={4} className="py-3 px-4 text-right font-semibold text-gray-700 dark:text-gray-300">
                      Total Paid:
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span className="font-bold text-lg text-emerald-600 dark:text-emerald-400">{formatCurrency(totalPaid)}</span>
                    </td>
                    <td colSpan={2}></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
