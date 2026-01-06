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
  PlusIcon,
  XMarkIcon,
  PencilIcon,
  TrashIcon,
  CurrencyDollarIcon,
  CalendarDaysIcon,
  ExclamationTriangleIcon,
  CalculatorIcon,
  CogIcon,
} from '@heroicons/react/24/outline';
import { accountsService, AccountsOverview, Milestone } from '@/services/accounts.service';
import { projectService } from '@/services/project.service';
import Button from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { cn } from '@/utils/helpers';
import toast from 'react-hot-toast';

type TabType = 'overview' | 'projects' | 'finance' | 'developers' | 'milestones' | 'time';

const tabs = [
  { id: 'overview', label: 'Overview', icon: ChartBarIcon },
  { id: 'projects', label: 'Projects', icon: FolderIcon },
  { id: 'finance', label: 'Project Finance', icon: CalculatorIcon },
  { id: 'developers', label: 'Developer Costs', icon: UserGroupIcon },
  { id: 'milestones', label: 'Milestones', icon: BanknotesIcon },
  { id: 'time', label: 'Time Analysis', icon: ClockIcon },
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
  if (!overview) return null;

  const { projectBreakdown } = overview;

  return (
    <div className="space-y-6">
      {/* Project Financial Summary Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Project Financial Summary</CardTitle>
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
                  <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                    Status
                  </th>
                  <th className="text-right py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                    Budget (PKR)
                  </th>
                  <th className="text-right py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                    Spent (PKR)
                  </th>
                  <th className="text-center py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                    Milestones
                  </th>
                  <th className="text-right py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                    Hours
                  </th>
                </tr>
              </thead>
              <tbody>
                {projectBreakdown.map((project) => {
                  const budgetUsed = project.budget
                    ? Math.round((project.spent / project.budget) * 100)
                    : 0;
                  return (
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
                      <td className="py-3 px-4 text-right text-gray-900 dark:text-white">
                        {project.budget ? formatPKR(project.budget) : '-'}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex flex-col items-end">
                          <span className="text-gray-900 dark:text-white">
                            {formatPKR(project.spent)}
                          </span>
                          {project.budget && (
                            <span
                              className={cn(
                                'text-xs',
                                budgetUsed > 100
                                  ? 'text-red-500'
                                  : budgetUsed > 80
                                  ? 'text-amber-500'
                                  : 'text-gray-400'
                              )}
                            >
                              {budgetUsed}% of budget
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                          {project.milestonesReleased}
                        </span>
                        <span className="text-gray-400">/{project.totalMilestones}</span>
                      </td>
                      <td className="py-3 px-4 text-right text-gray-600 dark:text-gray-400">
                        {project.hoursWorked}h
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

  const released = milestones.filter((m) => m.status === 'RELEASED');
  const pending = milestones.filter((m) => m.status !== 'RELEASED' && m.status !== 'CANCELLED');
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
                          <option value="PENDING">Pending</option>
                          <option value="IN_PROGRESS">In Progress</option>
                          <option value="RELEASED">Released</option>
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
                className="px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-600 min-w-[300px]"
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
            <div className="text-center p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
              <p className="text-xs text-gray-500 uppercase">Developers</p>
              <p className="text-lg font-bold text-gray-900 dark:text-white">
                PKR {costBreakdown.developerCost.toLocaleString()}
              </p>
            </div>
            <div className="text-center p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
              <p className="text-xs text-gray-500 uppercase">Designers</p>
              <p className="text-lg font-bold text-gray-900 dark:text-white">
                PKR {costBreakdown.designerCost.toLocaleString()}
              </p>
            </div>
            <div className="text-center p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
              <p className="text-xs text-gray-500 uppercase">QC</p>
              <p className="text-lg font-bold text-gray-900 dark:text-white">
                PKR {costBreakdown.qcCost.toLocaleString()}
              </p>
            </div>
            <div className="text-center p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
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
                  <tr className="bg-gray-50 dark:bg-gray-900">
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
            <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
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
      <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 rounded-t-2xl">
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
              className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-600"
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
              className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-600"
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
              className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-600"
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
      <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-lg">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 rounded-t-2xl">
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
              className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-600"
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
              className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-600"
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
              className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-600 resize-none"
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
                className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-600"
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
                className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-600"
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
              className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-600"
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
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 hover:shadow-md transition-all duration-200">
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
    PENDING: 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300',
    IN_PROGRESS: 'bg-cyan-100 dark:bg-cyan-500/10 text-cyan-700 dark:text-cyan-400',
    RELEASED: 'bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400',
    CANCELLED: 'bg-red-100 dark:bg-red-500/10 text-red-700 dark:text-red-400',
  };
  return badges[status] || 'bg-gray-100 text-gray-700';
}
