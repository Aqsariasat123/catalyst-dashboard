import { Prisma } from '@prisma/client';
import { prisma } from '../config/database.js';
import { testCaseService } from './testCase.service.js';
import { testExecutionService } from './testExecution.service.js';
import { bugService } from './bug.service.js';

export type QualityStatus = 'READY' | 'AT_RISK' | 'NOT_READY';

export interface QADashboardData {
  overallStatus: QualityStatus;
  testCases: {
    total: number;
    byStatus: Record<string, number>;
    byPriority: Record<string, number>;
    byType: Record<string, number>;
  };
  executions: {
    total: number;
    byStatus: Record<string, number>;
    passRate: number;
    recentExecutions: any[];
  };
  bugs: {
    total: number;
    open: number;
    criticalHighOpen: number;
    byStatus: Record<string, number>;
    bySeverity: Record<string, number>;
  };
  trends: {
    executions: any[];
    bugs: any[];
  };
  projectStats: any[];
}

export class QADashboardService {
  private calculateOverallStatus(
    passRate: number,
    criticalHighBugs: number,
    openBugs: number
  ): QualityStatus {
    // NOT_READY if:
    // - Pass rate < 70%
    // - Any critical bugs open
    // - More than 5 high severity bugs open
    if (passRate < 70 || criticalHighBugs > 0) {
      return 'NOT_READY';
    }

    // AT_RISK if:
    // - Pass rate between 70-85%
    // - More than 3 bugs open
    if (passRate < 85 || openBugs > 3) {
      return 'AT_RISK';
    }

    return 'READY';
  }

  async getDashboardData(projectId?: string): Promise<QADashboardData> {
    const [testCaseStats, executionStats, bugStats, executionTrend, bugTrend] = await Promise.all([
      testCaseService.getStats(projectId),
      testExecutionService.getStats(projectId),
      bugService.getStats(projectId),
      testExecutionService.getTrend(projectId, 14),
      bugService.getTrend(projectId, 14),
    ]);

    // Get project-wise stats
    const projectStats = await this.getProjectWiseStats();

    const overallStatus = this.calculateOverallStatus(
      executionStats.passRate,
      bugStats.criticalHighOpen,
      bugStats.open
    );

    return {
      overallStatus,
      testCases: testCaseStats,
      executions: executionStats,
      bugs: bugStats,
      trends: {
        executions: executionTrend,
        bugs: bugTrend,
      },
      projectStats,
    };
  }

  async getProjectWiseStats(): Promise<any[]> {
    // Get all active projects with QA data
    const projects = await prisma.project.findMany({
      where: {
        isActive: true,
        OR: [
          { testCases: { some: {} } },
          { bugs: { some: {} } },
        ],
      },
      select: {
        id: true,
        name: true,
        client: {
          select: {
            id: true,
            name: true,
          },
        },
        _count: {
          select: {
            testCases: true,
            bugs: true,
          },
        },
      },
    });

    const projectStats = await Promise.all(
      projects.map(async (project) => {
        // Get execution stats for this project
        const executions = await prisma.testExecution.findMany({
          where: {
            testCase: { projectId: project.id },
          },
          select: { status: true },
        });

        const totalExecutions = executions.length;
        const passCount = executions.filter((e) => e.status === 'PASS').length;
        const failCount = executions.filter((e) => e.status === 'FAIL').length;
        const passRate = totalExecutions > 0 ? Math.round((passCount / totalExecutions) * 100) : 0;

        // Get open bugs count
        const openBugs = await prisma.bug.count({
          where: {
            projectId: project.id,
            status: { notIn: ['CLOSED'] },
          },
        });

        // Get critical bugs count
        const criticalBugs = await prisma.bug.count({
          where: {
            projectId: project.id,
            severity: 'CRITICAL',
            status: { notIn: ['CLOSED'] },
          },
        });

        const status = this.calculateOverallStatus(passRate, criticalBugs, openBugs);

        return {
          id: project.id,
          name: project.name,
          client: project.client,
          testCases: project._count.testCases,
          totalBugs: project._count.bugs,
          openBugs,
          criticalBugs,
          passRate,
          status,
        };
      })
    );

    // Sort by status (NOT_READY first, then AT_RISK, then READY)
    const statusOrder = { NOT_READY: 0, AT_RISK: 1, READY: 2 };
    return projectStats.sort((a, b) => statusOrder[a.status] - statusOrder[b.status]);
  }

  async getRecentActivity(limit: number = 20): Promise<any[]> {
    // Get recent test executions
    const recentExecutions = await prisma.testExecution.findMany({
      take: limit,
      orderBy: { executedAt: 'desc' },
      include: {
        testCase: {
          select: {
            id: true,
            title: true,
            project: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        executedBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    // Get recent bug activities
    const recentBugActivities = await prisma.bugActivity.findMany({
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        bug: {
          select: {
            id: true,
            title: true,
            project: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    // Combine and sort by date
    const activities = [
      ...recentExecutions.map((e) => ({
        type: 'execution',
        id: e.id,
        action: `Test ${e.status.toLowerCase()}`,
        entity: e.testCase,
        user: e.executedBy,
        status: e.status,
        timestamp: e.executedAt,
      })),
      ...recentBugActivities.map((a) => ({
        type: 'bug',
        id: a.id,
        action: a.action,
        entity: a.bug,
        user: a.user,
        comment: a.comment,
        timestamp: a.createdAt,
      })),
    ];

    return activities
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limit);
  }

  async getMilestoneStats(milestoneId: string): Promise<any> {
    const milestone = await prisma.milestone.findUnique({
      where: { id: milestoneId },
      select: {
        id: true,
        title: true,
        status: true,
        project: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!milestone) {
      throw new Error('Milestone not found');
    }

    const [testCaseStats, executionStats, bugStats] = await Promise.all([
      prisma.testCase.count({ where: { milestoneId } }),
      testExecutionService.getStats(undefined, milestoneId),
      prisma.bug.groupBy({
        by: ['status'],
        where: { milestoneId },
        _count: true,
      }),
    ]);

    const openBugs = bugStats
      .filter((b) => b.status !== 'CLOSED')
      .reduce((sum, b) => sum + b._count, 0);

    return {
      ...milestone,
      testCases: testCaseStats,
      executions: executionStats,
      bugs: {
        total: bugStats.reduce((sum, b) => sum + b._count, 0),
        open: openBugs,
        byStatus: bugStats.reduce((acc, curr) => ({ ...acc, [curr.status]: curr._count }), {}),
      },
      status: this.calculateOverallStatus(executionStats.passRate, 0, openBugs),
    };
  }

  async getAutomationStats(projectId?: string): Promise<any> {
    const where: Prisma.AutomationRunWhereInput = projectId ? { projectId } : {};

    const [totalRuns, recentRuns, lastRun] = await Promise.all([
      prisma.automationRun.count({ where }),
      prisma.automationRun.findMany({
        where,
        orderBy: { runAt: 'desc' },
        take: 10,
        include: {
          project: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      }),
      prisma.automationRun.findFirst({
        where,
        orderBy: { runAt: 'desc' },
        include: {
          project: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      }),
    ]);

    // Calculate automation coverage
    const totalTestCases = await prisma.testCase.count({
      where: projectId ? { projectId } : {},
    });

    const automatedTestCases = await prisma.testCase.count({
      where: {
        ...(projectId ? { projectId } : {}),
        type: 'AUTOMATION',
      },
    });

    const automationCoverage =
      totalTestCases > 0 ? Math.round((automatedTestCases / totalTestCases) * 100) : 0;

    return {
      totalRuns,
      lastRun,
      recentRuns,
      automationCoverage,
      automatedTestCases,
      manualTestCases: totalTestCases - automatedTestCases,
    };
  }
}

export const qaDashboardService = new QADashboardService();
