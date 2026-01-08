import { prisma } from '../config/database.js';
import { Decimal } from '@prisma/client/runtime/library';
import { transactionService } from './transaction.service.js';

// PKR conversion rates (approximate - should be configurable in production)
const CURRENCY_TO_PKR: Record<string, number> = {
  USD: 280,
  EUR: 305,
  GBP: 355,
  AUD: 185,
  CAD: 205,
  PKR: 1,
};

const USD_TO_PKR = 280; // Keep for backward compatibility

// Working hours calculation: Mon-Fri = 8h × 5 = 40h, Sat = 4h, Weekly = 44h, Monthly = 44 × 4 = 176h
const WORKING_HOURS_PER_MONTH = 176;

interface ProjectFinancials {
  project: {
    id: string;
    name: string;
    status: string;
    budget: number | null;
    currency: string;
    platformFeePercent: number | null;
    platformFeeAmount: number | null;
    payableAmount: number | null;
    payableAmountPKR: number | null;
    workingBudget: number | null;
    workingBudgetPKR: number | null;
    exchangeRate: number | null;
  };
  client: {
    id: string;
    name: string;
    clientType: string;
  };
  costBreakdown: {
    totalCost: number;
    totalCostPKR: number;
    developerCost: number;
    qcCost: number;
    pmCost: number;
    designerCost: number;
    totalHours: number;
    budgetConsumedPercent: number;
    remainingBudget: number;
    isOverBudget: boolean;
  };
  taskCosts: {
    id: string;
    title: string;
    status: string;
    assignee: {
      id: string;
      name: string;
      role: string;
      monthlySalary: number | null;
      hourlyRate: number;
    } | null;
    estimatedHours: number | null;
    actualHours: number;
    estimatedCost: number;
    actualCost: number;
    costVariance: number;
    isOverBudget: boolean;
  }[];
  roleBreakdown: {
    role: string;
    members: {
      id: string;
      name: string;
      monthlySalary: number | null;
      hourlyRate: number;
      hoursWorked: number;
      cost: number;
    }[];
    totalHours: number;
    totalCost: number;
  }[];
  milestones: {
    total: number;
    released: number;
    pending: number;
    totalAmount: number;
    releasedAmount: number;
    pendingAmount: number;
  };
}

interface ProjectAccountSummary {
  project: {
    id: string;
    name: string;
    status: string;
    budget: number | null;
    currency: string;
    budgetPKR: number | null;
  };
  client: {
    id: string;
    name: string;
    clientType: string;
  };
  milestones: {
    total: number;
    released: number;
    pending: number;
    totalAmount: number;
    releasedAmount: number;
    pendingAmount: number;
  };
  developers: {
    id: string;
    name: string;
    role: string;
    userType: string;
    monthlySalary: number | null;
    hourlyRate: number | null;
    hoursWorked: number;
    costPKR: number;
  }[];
  timeTracking: {
    totalHours: number;
    billableHours: number;
    nonBillableHours: number;
    estimatedHours: number;
    efficiency: number; // percentage of estimated vs actual
  };
  costs: {
    totalLaborCost: number;
    estimatedLaborCost: number;
    costVariance: number;
    profitMargin: number | null;
  };
  tasks: {
    total: number;
    completed: number;
    inProgress: number;
    todo: number;
    blocked: number;
  };
}

interface DeveloperAccountSummary {
  id: string;
  name: string;
  email: string;
  role: string;
  userType: string;
  monthlySalary: number | null;
  hourlyRate: number | null;
  projects: {
    id: string;
    name: string;
    hoursWorked: number;
    tasksCompleted: number;
    tasksAssigned: number;
  }[];
  totalHoursWorked: number;
  totalEarnings: number;
  tasksCompleted: number;
  tasksAssigned: number;
  productivity: number; // tasks completed per hour
}

interface AccountsOverview {
  summary: {
    totalRevenue: number;
    totalMilestonesReleased: number;
    totalMilestonesPending: number;
    totalLaborCost: number;
    totalProfit: number;
    profitMargin: number;
    totalHoursTracked: number;
    averageHourlyRate: number;
  };
  projectBreakdown: {
    id: string;
    name: string;
    client: string;
    budget: number | null;
    spent: number;
    milestonesReleased: number;
    totalMilestones: number;
    hoursWorked: number;
    status: string;
  }[];
  developerCosts: {
    id: string;
    name: string;
    monthlySalary: number | null;
    hoursWorked: number;
    cost: number;
    projectsCount: number;
  }[];
  monthlyTrend: {
    month: string;
    revenue: number;
    costs: number;
    profit: number;
    hoursWorked: number;
  }[];
}

export class AccountsService {
  private toNumber(decimal: Decimal | null | undefined): number | null {
    if (decimal === null || decimal === undefined) return null;
    return Number(decimal);
  }

  private convertToPKR(amount: number | null, currency: string): number | null {
    if (amount === null) return null;
    const rate = CURRENCY_TO_PKR[currency] || 1;
    return amount * rate;
  }

  // Calculate hourly rate from monthly salary (176 working hours per month)
  private calculateHourlyRate(monthlySalary: number | null): number {
    if (monthlySalary === null || monthlySalary === 0) return 0;
    return monthlySalary / WORKING_HOURS_PER_MONTH;
  }

  // Calculate platform fee and payable amount
  private calculatePlatformFee(budget: number | null, feePercent: number | null): {
    feeAmount: number | null;
    payableAmount: number | null;
  } {
    if (budget === null) return { feeAmount: null, payableAmount: null };
    const fee = feePercent ? budget * (feePercent / 100) : 0;
    return {
      feeAmount: fee,
      payableAmount: budget - fee,
    };
  }

  async getAccountsOverview(): Promise<AccountsOverview> {
    // Get all projects with their milestones and time data
    const projects = await prisma.project.findMany({
      where: { isActive: true },
      include: {
        client: true,
        milestones: true,
        members: {
          include: {
            user: true,
          },
        },
        tasks: {
          include: {
            timeEntries: true,
          },
        },
      },
    });

    // Get all developers with their salaries
    const developers = await prisma.user.findMany({
      where: {
        role: { in: ['DEVELOPER', 'DESIGNER', 'QC'] },
        isActive: true,
      },
      include: {
        timeEntries: {
          include: {
            task: {
              select: {
                projectId: true,
              },
            },
          },
        },
        projectMembers: true,
      },
    });

    // Calculate totals
    let totalRevenue = 0;
    let totalMilestonesReleased = 0;
    let totalMilestonesPending = 0;
    let totalLaborCost = 0;
    let totalHoursTracked = 0;

    const projectBreakdown = projects.map((project) => {
      // Use paymentStatus to determine released milestones (not milestone status)
      const releasedMilestones = project.milestones.filter((m) => m.paymentStatus === 'RELEASED');
      const releasedAmount = releasedMilestones.reduce(
        (sum, m) => sum + (this.toNumber(m.amount) || 0),
        0
      );

      const projectHours = project.tasks.reduce((sum, task) => {
        return (
          sum +
          task.timeEntries.reduce((s, te) => s + (te.duration || 0), 0) / 3600
        );
      }, 0);

      // Calculate labor cost for this project
      const projectLaborCost = this.calculateProjectLaborCost(project, developers);

      totalRevenue += this.convertToPKR(releasedAmount, project.currency) || 0;
      totalMilestonesReleased += releasedMilestones.length;
      totalMilestonesPending += project.milestones.filter((m) => m.paymentStatus !== 'RELEASED' && m.paymentStatus !== 'CANCELLED').length;
      totalLaborCost += projectLaborCost;
      totalHoursTracked += projectHours;

      const platformFeePercent = this.toNumber(project.platformFeePercent) || 0;
      const feeAmount = releasedAmount * (platformFeePercent / 100);
      const netAmount = releasedAmount - feeAmount;

      return {
        id: project.id,
        name: project.name,
        client: project.client.name,
        currency: project.currency,
        budget: this.convertToPKR(this.toNumber(project.budget), project.currency),
        budgetOriginal: this.toNumber(project.budget),
        spent: projectLaborCost,
        milestonesReleased: releasedMilestones.length,
        totalMilestones: project.milestones.length,
        hoursWorked: Math.round(projectHours * 100) / 100,
        status: project.status,
        platformFeePercent,
        grossAmount: releasedAmount,
        feeAmount: Math.round(feeAmount * 100) / 100,
        netAmount: Math.round(netAmount * 100) / 100,
      };
    });

    // Calculate developer costs
    const developerCosts = developers.map((dev) => {
      const hoursWorked = dev.timeEntries.reduce((sum, te) => sum + (te.duration || 0), 0) / 3600;
      const monthlySalary = this.toNumber(dev.monthlySalary);
      const hourlyRate = this.calculateHourlyRate(monthlySalary);
      const cost = hoursWorked * hourlyRate; // hourlyRate is already in PKR

      return {
        id: dev.id,
        name: `${dev.firstName} ${dev.lastName}`,
        monthlySalary,
        hourlyRate,
        hoursWorked: Math.round(hoursWorked * 100) / 100,
        cost: Math.round(cost),
        projectsCount: dev.projectMembers.length,
      };
    });

    // Get monthly trend (last 6 months)
    const monthlyTrend = await this.getMonthlyTrend();

    const totalProfit = totalRevenue - totalLaborCost;
    const profitMargin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;
    const averageHourlyRate =
      totalHoursTracked > 0 ? totalLaborCost / totalHoursTracked : 0;

    return {
      summary: {
        totalRevenue: Math.round(totalRevenue),
        totalMilestonesReleased,
        totalMilestonesPending,
        totalLaborCost: Math.round(totalLaborCost),
        totalProfit: Math.round(totalProfit),
        profitMargin: Math.round(profitMargin * 100) / 100,
        totalHoursTracked: Math.round(totalHoursTracked * 100) / 100,
        averageHourlyRate: Math.round(averageHourlyRate),
      },
      projectBreakdown,
      developerCosts,
      monthlyTrend,
    };
  }

  async getProjectAccountDetails(projectId: string): Promise<ProjectAccountSummary> {
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        client: true,
        milestones: true,
        members: {
          include: {
            user: true,
          },
        },
        tasks: {
          include: {
            timeEntries: {
              include: {
                user: true,
              },
            },
            assignee: true,
          },
        },
      },
    });

    if (!project) {
      throw new Error('Project not found');
    }

    // Calculate milestone stats using paymentStatus
    const releasedMilestones = project.milestones.filter((m) => m.paymentStatus === 'RELEASED');
    const pendingMilestones = project.milestones.filter(
      (m) => m.paymentStatus !== 'RELEASED' && m.paymentStatus !== 'CANCELLED'
    );

    const milestones = {
      total: project.milestones.length,
      released: releasedMilestones.length,
      pending: pendingMilestones.length,
      totalAmount: project.milestones.reduce(
        (sum, m) => sum + (this.toNumber(m.amount) || 0),
        0
      ),
      releasedAmount: releasedMilestones.reduce(
        (sum, m) => sum + (this.toNumber(m.amount) || 0),
        0
      ),
      pendingAmount: pendingMilestones.reduce(
        (sum, m) => sum + (this.toNumber(m.amount) || 0),
        0
      ),
    };

    // Calculate developer stats
    const developerTimeMap = new Map<string, number>();
    project.tasks.forEach((task) => {
      task.timeEntries.forEach((te) => {
        const current = developerTimeMap.get(te.userId) || 0;
        developerTimeMap.set(te.userId, current + (te.duration || 0));
      });
    });

    const developers = project.members.map((member) => {
      const hoursWorked = (developerTimeMap.get(member.user.id) || 0) / 3600;
      const monthlySalary = this.toNumber(member.user.monthlySalary);
      const hourlyRate = this.calculateHourlyRate(monthlySalary);
      const costPKR = hoursWorked * hourlyRate; // hourlyRate is already in PKR

      return {
        id: member.user.id,
        name: `${member.user.firstName} ${member.user.lastName}`,
        role: member.role,
        userType: member.user.userType,
        monthlySalary,
        hourlyRate,
        hoursWorked: Math.round(hoursWorked * 100) / 100,
        costPKR: Math.round(costPKR),
      };
    });

    // Calculate time tracking stats
    let totalSeconds = 0;
    let billableSeconds = 0;
    let estimatedHours = 0;

    project.tasks.forEach((task) => {
      estimatedHours += this.toNumber(task.estimatedHours) || 0;
      task.timeEntries.forEach((te) => {
        totalSeconds += te.duration || 0;
        if (te.isBillable) {
          billableSeconds += te.duration || 0;
        }
      });
    });

    const totalHours = totalSeconds / 3600;
    const billableHours = billableSeconds / 3600;
    const efficiency =
      estimatedHours > 0 ? (estimatedHours / totalHours) * 100 : 100;

    // Calculate costs
    const totalLaborCost = developers.reduce((sum, d) => sum + d.costPKR, 0);
    const estimatedLaborCost = estimatedHours * (this.getAverageHourlyRate(developers) * USD_TO_PKR);
    const budgetPKR = this.convertToPKR(this.toNumber(project.budget), project.currency);
    const profitMargin =
      milestones.releasedAmount > 0
        ? ((this.convertToPKR(milestones.releasedAmount, project.currency) || 0 - totalLaborCost) /
            (this.convertToPKR(milestones.releasedAmount, project.currency) || 1)) *
          100
        : null;

    // Calculate task stats
    const taskStats = {
      total: project.tasks.length,
      completed: project.tasks.filter((t) => t.status === 'COMPLETED').length,
      inProgress: project.tasks.filter((t) => t.status === 'IN_PROGRESS').length,
      todo: project.tasks.filter((t) => t.status === 'TODO').length,
      blocked: project.tasks.filter((t) => t.status === 'BLOCKED').length,
    };

    return {
      project: {
        id: project.id,
        name: project.name,
        status: project.status,
        budget: this.toNumber(project.budget),
        currency: project.currency,
        budgetPKR,
      },
      client: {
        id: project.client.id,
        name: project.client.name,
        clientType: project.client.clientType,
      },
      milestones,
      developers,
      timeTracking: {
        totalHours: Math.round(totalHours * 100) / 100,
        billableHours: Math.round(billableHours * 100) / 100,
        nonBillableHours: Math.round((totalHours - billableHours) * 100) / 100,
        estimatedHours,
        efficiency: Math.round(efficiency * 100) / 100,
      },
      costs: {
        totalLaborCost: Math.round(totalLaborCost),
        estimatedLaborCost: Math.round(estimatedLaborCost),
        costVariance: Math.round(totalLaborCost - estimatedLaborCost),
        profitMargin: profitMargin ? Math.round(profitMargin * 100) / 100 : null,
      },
      tasks: taskStats,
    };
  }

  async getProjectFinancials(projectId: string): Promise<ProjectFinancials> {
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        client: true,
        milestones: true,
        members: {
          include: {
            user: true,
          },
        },
        tasks: {
          include: {
            timeEntries: {
              include: {
                user: true,
              },
            },
            assignee: true,
          },
        },
      },
    });

    if (!project) {
      throw new Error('Project not found');
    }

    // Get exchange rate (custom or default)
    const exchangeRate = this.toNumber(project.exchangeRate) || CURRENCY_TO_PKR[project.currency] || 280;
    const budget = this.toNumber(project.budget);
    const platformFeePercent = this.toNumber(project.platformFeePercent);
    const workingBudget = this.toNumber(project.workingBudget);

    // Calculate platform fee and payable amount
    const { feeAmount, payableAmount } = this.calculatePlatformFee(budget, platformFeePercent);
    const payableAmountPKR = payableAmount !== null ? payableAmount * exchangeRate : null;
    const workingBudgetPKR = workingBudget !== null ? workingBudget * exchangeRate : null;

    // Calculate task costs
    const taskCosts = project.tasks.map((task) => {
      const actualSeconds = task.timeEntries.reduce((sum, te) => sum + (te.duration || 0), 0);
      const actualHours = actualSeconds / 3600;

      let assigneeInfo = null;
      let hourlyRate = 0;
      if (task.assignee) {
        const monthlySalary = this.toNumber(task.assignee.monthlySalary);
        hourlyRate = this.calculateHourlyRate(monthlySalary);
        assigneeInfo = {
          id: task.assignee.id,
          name: `${task.assignee.firstName} ${task.assignee.lastName}`,
          role: task.assignee.role,
          monthlySalary,
          hourlyRate,
        };
      }

      const estimatedHours = this.toNumber(task.estimatedHours);
      const estimatedCost = estimatedHours !== null ? estimatedHours * hourlyRate : 0;
      const actualCost = actualHours * hourlyRate;
      const costVariance = actualCost - estimatedCost;
      const isOverBudget = estimatedHours !== null && actualHours > estimatedHours;

      return {
        id: task.id,
        title: task.title,
        status: task.status,
        assignee: assigneeInfo,
        estimatedHours,
        actualHours: Math.round(actualHours * 100) / 100,
        estimatedCost: Math.round(estimatedCost),
        actualCost: Math.round(actualCost),
        costVariance: Math.round(costVariance),
        isOverBudget,
      };
    });

    // Calculate role breakdown
    const roleMap = new Map<string, {
      members: Map<string, { id: string; name: string; monthlySalary: number | null; hourlyRate: number; hoursWorked: number; cost: number }>;
      totalHours: number;
      totalCost: number;
    }>();

    // Initialize roles
    ['DEVELOPER', 'DESIGNER', 'QC', 'PROJECT_MANAGER'].forEach((role) => {
      roleMap.set(role, { members: new Map(), totalHours: 0, totalCost: 0 });
    });

    // Process time entries
    project.tasks.forEach((task) => {
      task.timeEntries.forEach((te) => {
        const user = te.user;
        const role = user.role;
        const hours = (te.duration || 0) / 3600;
        const monthlySalary = this.toNumber(user.monthlySalary);
        const hourlyRate = this.calculateHourlyRate(monthlySalary);
        const cost = hours * hourlyRate;

        let roleData = roleMap.get(role);
        if (!roleData) {
          roleData = { members: new Map(), totalHours: 0, totalCost: 0 };
          roleMap.set(role, roleData);
        }

        const existingMember = roleData.members.get(user.id);
        if (existingMember) {
          existingMember.hoursWorked += hours;
          existingMember.cost += cost;
        } else {
          roleData.members.set(user.id, {
            id: user.id,
            name: `${user.firstName} ${user.lastName}`,
            monthlySalary,
            hourlyRate,
            hoursWorked: hours,
            cost,
          });
        }
        roleData.totalHours += hours;
        roleData.totalCost += cost;
      });
    });

    const roleBreakdown = Array.from(roleMap.entries())
      .filter(([_, data]) => data.members.size > 0)
      .map(([role, data]) => ({
        role,
        members: Array.from(data.members.values()).map((m) => ({
          ...m,
          hoursWorked: Math.round(m.hoursWorked * 100) / 100,
          cost: Math.round(m.cost),
        })),
        totalHours: Math.round(data.totalHours * 100) / 100,
        totalCost: Math.round(data.totalCost),
      }));

    // Calculate cost breakdown
    const developerCost = roleMap.get('DEVELOPER')?.totalCost || 0;
    const qcCost = roleMap.get('QC')?.totalCost || 0;
    const pmCost = roleMap.get('PROJECT_MANAGER')?.totalCost || 0;
    const designerCost = roleMap.get('DESIGNER')?.totalCost || 0;
    const totalCost = developerCost + qcCost + pmCost + designerCost;
    const totalHours = taskCosts.reduce((sum, t) => sum + t.actualHours, 0);

    // Working budget is the reference for consumption
    const referenceBudget = workingBudgetPKR || payableAmountPKR || (budget !== null ? budget * exchangeRate : null);
    const budgetConsumedPercent = referenceBudget && referenceBudget > 0 ? (totalCost / referenceBudget) * 100 : 0;
    const remainingBudget = referenceBudget !== null ? referenceBudget - totalCost : 0;
    const isOverBudget = referenceBudget !== null && totalCost > referenceBudget;

    // Calculate milestone stats using paymentStatus
    const releasedMilestones = project.milestones.filter((m) => m.paymentStatus === 'RELEASED');
    const pendingMilestones = project.milestones.filter(
      (m) => m.paymentStatus !== 'RELEASED' && m.paymentStatus !== 'CANCELLED'
    );

    return {
      project: {
        id: project.id,
        name: project.name,
        status: project.status,
        budget,
        currency: project.currency,
        platformFeePercent,
        platformFeeAmount: feeAmount !== null ? Math.round(feeAmount * 100) / 100 : null,
        payableAmount: payableAmount !== null ? Math.round(payableAmount * 100) / 100 : null,
        payableAmountPKR: payableAmountPKR !== null ? Math.round(payableAmountPKR) : null,
        workingBudget,
        workingBudgetPKR: workingBudgetPKR !== null ? Math.round(workingBudgetPKR) : null,
        exchangeRate,
      },
      client: {
        id: project.client.id,
        name: project.client.name,
        clientType: project.client.clientType,
      },
      costBreakdown: {
        totalCost: Math.round(totalCost),
        totalCostPKR: Math.round(totalCost),
        developerCost: Math.round(developerCost),
        qcCost: Math.round(qcCost),
        pmCost: Math.round(pmCost),
        designerCost: Math.round(designerCost),
        totalHours: Math.round(totalHours * 100) / 100,
        budgetConsumedPercent: Math.round(budgetConsumedPercent * 100) / 100,
        remainingBudget: Math.round(remainingBudget),
        isOverBudget,
      },
      taskCosts,
      roleBreakdown,
      milestones: {
        total: project.milestones.length,
        released: releasedMilestones.length,
        pending: pendingMilestones.length,
        totalAmount: project.milestones.reduce(
          (sum, m) => sum + (this.toNumber(m.amount) || 0),
          0
        ),
        releasedAmount: releasedMilestones.reduce(
          (sum, m) => sum + (this.toNumber(m.amount) || 0),
          0
        ),
        pendingAmount: pendingMilestones.reduce(
          (sum, m) => sum + (this.toNumber(m.amount) || 0),
          0
        ),
      },
    };
  }

  async updateProjectFinancials(projectId: string, data: {
    platformFeePercent?: number;
    workingBudget?: number;
    exchangeRate?: number;
  }) {
    return prisma.project.update({
      where: { id: projectId },
      data: {
        platformFeePercent: data.platformFeePercent,
        workingBudget: data.workingBudget,
        exchangeRate: data.exchangeRate,
      },
    });
  }

  async getDeveloperAccountDetails(developerId: string): Promise<DeveloperAccountSummary> {
    const developer = await prisma.user.findUnique({
      where: { id: developerId },
      include: {
        timeEntries: {
          include: {
            task: {
              include: {
                project: true,
              },
            },
          },
        },
        assignedTasks: {
          include: {
            project: true,
          },
        },
        projectMembers: {
          include: {
            project: true,
          },
        },
      },
    });

    if (!developer) {
      throw new Error('Developer not found');
    }

    // Group time by project
    const projectTimeMap = new Map<
      string,
      { project: any; hoursWorked: number; tasksCompleted: number; tasksAssigned: number }
    >();

    developer.timeEntries.forEach((te) => {
      const projectId = te.task.project.id;
      const current = projectTimeMap.get(projectId) || {
        project: te.task.project,
        hoursWorked: 0,
        tasksCompleted: 0,
        tasksAssigned: 0,
      };
      current.hoursWorked += (te.duration || 0) / 3600;
      projectTimeMap.set(projectId, current);
    });

    // Add task counts per project
    developer.assignedTasks.forEach((task) => {
      const projectId = task.project.id;
      const current = projectTimeMap.get(projectId) || {
        project: task.project,
        hoursWorked: 0,
        tasksCompleted: 0,
        tasksAssigned: 0,
      };
      current.tasksAssigned += 1;
      if (task.status === 'COMPLETED') {
        current.tasksCompleted += 1;
      }
      projectTimeMap.set(projectId, current);
    });

    const projects = Array.from(projectTimeMap.values()).map((p) => ({
      id: p.project.id,
      name: p.project.name,
      hoursWorked: Math.round(p.hoursWorked * 100) / 100,
      tasksCompleted: p.tasksCompleted,
      tasksAssigned: p.tasksAssigned,
    }));

    const totalHoursWorked =
      developer.timeEntries.reduce((sum, te) => sum + (te.duration || 0), 0) / 3600;
    const monthlySalary = this.toNumber(developer.monthlySalary);
    const hourlyRate = this.calculateHourlyRate(monthlySalary);
    const totalEarnings = totalHoursWorked * hourlyRate; // hourlyRate is already in PKR

    const tasksCompleted = developer.assignedTasks.filter(
      (t) => t.status === 'COMPLETED'
    ).length;
    const tasksAssigned = developer.assignedTasks.length;

    const productivity =
      totalHoursWorked > 0 ? tasksCompleted / totalHoursWorked : 0;

    return {
      id: developer.id,
      name: `${developer.firstName} ${developer.lastName}`,
      email: developer.email,
      role: developer.role,
      userType: developer.userType,
      monthlySalary,
      hourlyRate,
      projects,
      totalHoursWorked: Math.round(totalHoursWorked * 100) / 100,
      totalEarnings: Math.round(totalEarnings),
      tasksCompleted,
      tasksAssigned,
      productivity: Math.round(productivity * 100) / 100,
    };
  }

  async getMilestones(projectId?: string) {
    const where = projectId ? { projectId } : {};

    const milestones = await prisma.milestone.findMany({
      where,
      include: {
        project: {
          select: {
            id: true,
            name: true,
            client: {
              select: {
                name: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return milestones.map((m) => ({
      id: m.id,
      title: m.title,
      description: m.description,
      amount: this.toNumber(m.amount),
      amountPKR: this.convertToPKR(this.toNumber(m.amount), m.currency),
      currency: m.currency,
      status: m.status,
      paymentStatus: m.paymentStatus,
      dueDate: m.dueDate,
      releasedAt: m.releasedAt,
      project: m.project,
    }));
  }

  async createMilestone(data: {
    projectId: string;
    title: string;
    description?: string;
    amount: number;
    currency?: string;
    dueDate?: Date;
  }) {
    return prisma.milestone.create({
      data: {
        projectId: data.projectId,
        title: data.title,
        description: data.description,
        amount: data.amount,
        currency: data.currency || 'USD',
        dueDate: data.dueDate,
      },
      include: {
        project: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }

  async updateMilestone(
    id: string,
    data: {
      projectId?: string;
      title?: string;
      description?: string;
      amount?: number;
      currency?: string;
      status?: string;
      dueDate?: string | Date;
    }
  ) {
    // Build update data with proper type conversions
    const updateData: any = {};

    // Only include fields that are provided
    if (data.projectId !== undefined) updateData.projectId = data.projectId;
    if (data.title !== undefined) updateData.title = data.title;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.amount !== undefined) updateData.amount = data.amount;
    if (data.currency !== undefined) updateData.currency = data.currency;

    // Map status values to valid MilestoneStatus enum values
    if (data.status !== undefined) {
      // Map frontend status to valid enum values
      // Schema values: NOT_STARTED, IN_PROGRESS, COMPLETED, CANCELLED
      const statusMap: Record<string, string> = {
        'RELEASED': 'COMPLETED',
        'Released': 'COMPLETED',
        'released': 'COMPLETED',
        'PENDING': 'NOT_STARTED',
        'Pending': 'NOT_STARTED',
        'pending': 'NOT_STARTED',
      };
      updateData.status = statusMap[data.status] || data.status;
    }

    // Convert dueDate string to proper DateTime
    if (data.dueDate !== undefined) {
      if (typeof data.dueDate === 'string') {
        // Handle date string like "2026-01-28"
        updateData.dueDate = new Date(data.dueDate + 'T00:00:00.000Z');
      } else {
        updateData.dueDate = data.dueDate;
      }
    }

    // Get the current milestone to check status change
    const currentMilestone = await prisma.milestone.findUnique({
      where: { id },
      include: {
        project: {
          include: {
            client: true,
          },
        },
      },
    });

    // If status is being set to COMPLETED, set releasedAt
    if (updateData.status === 'COMPLETED') {
      updateData.releasedAt = new Date();
    }

    const updatedMilestone = await prisma.milestone.update({
      where: { id },
      data: updateData,
      include: {
        project: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    // If status changed to COMPLETED, create a transaction
    if (updateData.status === 'COMPLETED' && currentMilestone && currentMilestone.status !== 'COMPLETED') {
      try {
        const platformFeePercent = this.toNumber(currentMilestone.project.platformFeePercent) || 0;
        await transactionService.createFromMilestoneRelease({
          id: updatedMilestone.id,
          title: updatedMilestone.title,
          amount: this.toNumber(updatedMilestone.amount) || 0,
          currency: updatedMilestone.currency,
          projectId: updatedMilestone.project.id,
          projectName: updatedMilestone.project.name,
          clientName: currentMilestone.project.client?.name,
          platformFeePercent,
        });
      } catch (error) {
        console.error('Error creating transaction from milestone release:', error);
        // Don't throw - milestone update should still succeed
      }
    }

    return updatedMilestone;
  }

  async deleteMilestone(id: string) {
    return prisma.milestone.delete({
      where: { id },
    });
  }

  async getTimeBreakdownByProject() {
    const projects = await prisma.project.findMany({
      where: { isActive: true },
      include: {
        tasks: {
          include: {
            timeEntries: {
              include: {
                user: {
                  select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    return projects.map((project) => {
      const taskBreakdown = project.tasks.map((task) => {
        const totalSeconds = task.timeEntries.reduce(
          (sum, te) => sum + (te.duration || 0),
          0
        );

        const byUser = new Map<string, { user: any; seconds: number }>();
        task.timeEntries.forEach((te) => {
          const current = byUser.get(te.userId) || { user: te.user, seconds: 0 };
          current.seconds += te.duration || 0;
          byUser.set(te.userId, current);
        });

        return {
          id: task.id,
          title: task.title,
          status: task.status,
          estimatedHours: this.toNumber(task.estimatedHours),
          totalHours: Math.round((totalSeconds / 3600) * 100) / 100,
          byUser: Array.from(byUser.values()).map((u) => ({
            ...u.user,
            hours: Math.round((u.seconds / 3600) * 100) / 100,
          })),
        };
      });

      const totalProjectHours = taskBreakdown.reduce(
        (sum, t) => sum + t.totalHours,
        0
      );

      return {
        id: project.id,
        name: project.name,
        totalHours: Math.round(totalProjectHours * 100) / 100,
        tasks: taskBreakdown,
      };
    });
  }

  private calculateProjectLaborCost(project: any, developers: any[]): number {
    let totalCost = 0;

    project.tasks.forEach((task: any) => {
      task.timeEntries.forEach((te: any) => {
        const dev = developers.find((d) => d.id === te.userId);
        if (dev) {
          const monthlySalary = this.toNumber(dev.monthlySalary);
          const hourlyRate = this.calculateHourlyRate(monthlySalary);
          const hours = (te.duration || 0) / 3600;
          totalCost += hours * hourlyRate; // hourlyRate is already in PKR
        }
      });
    });

    return totalCost;
  }

  private getAverageHourlyRate(developers: any[]): number {
    const rates = developers
      .map((d) => this.calculateHourlyRate(this.toNumber(d.monthlySalary)))
      .filter((r) => r > 0);
    if (rates.length === 0) return 0;
    return rates.reduce((sum, r) => sum + r, 0) / rates.length;
  }

  private async getMonthlyTrend() {
    const now = new Date();
    const months: { month: string; revenue: number; costs: number; profit: number; hoursWorked: number }[] = [];

    for (let i = 5; i >= 0; i--) {
      const startOfMonth = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
      const monthLabel = startOfMonth.toLocaleString('default', {
        month: 'short',
        year: 'numeric',
      });

      // Get released milestones for this month (using paymentStatus)
      const milestones = await prisma.milestone.findMany({
        where: {
          paymentStatus: 'RELEASED',
          releasedAt: {
            gte: startOfMonth,
            lte: endOfMonth,
          },
        },
        include: {
          project: true,
        },
      });

      const revenue = milestones.reduce((sum, m) => {
        const amount = this.toNumber(m.amount) || 0;
        return sum + (this.convertToPKR(amount, m.currency) || 0);
      }, 0);

      // Get time entries for this month
      const timeEntries = await prisma.timeEntry.findMany({
        where: {
          startTime: {
            gte: startOfMonth,
            lte: endOfMonth,
          },
        },
        include: {
          user: true,
        },
      });

      let costs = 0;
      let hoursWorked = 0;
      timeEntries.forEach((te) => {
        const hours = (te.duration || 0) / 3600;
        const monthlySalary = this.toNumber(te.user.monthlySalary);
        const hourlyRate = this.calculateHourlyRate(monthlySalary);
        hoursWorked += hours;
        costs += hours * hourlyRate; // hourlyRate is already in PKR
      });

      months.push({
        month: monthLabel,
        revenue: Math.round(revenue),
        costs: Math.round(costs),
        profit: Math.round(revenue - costs),
        hoursWorked: Math.round(hoursWorked * 100) / 100,
      });
    }

    return months;
  }
}

export const accountsService = new AccountsService();
