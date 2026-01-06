import api from './api';

export interface AccountsOverview {
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

export interface ProjectAccountDetails {
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
    efficiency: number;
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

export interface Milestone {
  id: string;
  title: string;
  description: string | null;
  amount: number;
  amountPKR: number | null;
  currency: string;
  status: string;
  dueDate: string | null;
  releasedAt: string | null;
  project: {
    id: string;
    name: string;
    client: {
      name: string;
    };
  };
}

export interface ProjectFinancials {
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

export const accountsService = {
  getOverview: async (): Promise<AccountsOverview> => {
    const response = await api.get('/accounts');
    return response.data;
  },

  getProjectDetails: async (projectId: string): Promise<ProjectAccountDetails> => {
    const response = await api.get(`/accounts/projects/${projectId}`);
    return response.data;
  },

  getDeveloperDetails: async (developerId: string) => {
    const response = await api.get(`/accounts/developers/${developerId}`);
    return response.data;
  },

  getMilestones: async (projectId?: string): Promise<Milestone[]> => {
    const params = projectId ? { projectId } : {};
    const response = await api.get('/accounts/milestones', { params });
    return response.data;
  },

  createMilestone: async (data: {
    projectId: string;
    title: string;
    description?: string;
    amount: number;
    currency?: string;
    dueDate?: string;
  }) => {
    const response = await api.post('/accounts/milestones', data);
    return response.data;
  },

  updateMilestone: async (
    id: string,
    data: {
      title?: string;
      description?: string;
      amount?: number;
      currency?: string;
      status?: string;
      dueDate?: string;
    }
  ) => {
    const response = await api.put(`/accounts/milestones/${id}`, data);
    return response.data;
  },

  deleteMilestone: async (id: string) => {
    await api.delete(`/accounts/milestones/${id}`);
  },

  getTimeBreakdown: async () => {
    const response = await api.get('/accounts/time-breakdown');
    return response.data;
  },

  getProjectFinancials: async (projectId: string): Promise<ProjectFinancials> => {
    const response = await api.get(`/accounts/projects/${projectId}/financials`);
    return response.data;
  },

  updateProjectFinancials: async (
    projectId: string,
    data: {
      platformFeePercent?: number;
      workingBudget?: number;
      exchangeRate?: number;
    }
  ) => {
    const response = await api.put(`/accounts/projects/${projectId}/financials`, data);
    return response.data;
  },
};
