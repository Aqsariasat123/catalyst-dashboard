import api from './api';

export interface Transaction {
  id: string;
  date: string;
  description: string;
  type: string;
  amount: number;
  currency: string;
  gst: number | null;
  platform: string;
  projectName: string | null;
  clientName: string | null;
  projectId: string | null;
  milestoneId: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface TransactionSummary {
  totalEarnings: { [currency: string]: number };
  totalFees: { [currency: string]: number };
  totalWithdrawals: { [currency: string]: number };
  byType: { [type: string]: { count: number; total: { [currency: string]: number } } };
  byProject: { [project: string]: { count: number; total: number; currency: string } };
  byClient: { [client: string]: { count: number; total: number } };
}

export interface TransactionProject {
  name: string;
  client: string | null;
  totalEarned: number;
  currency: string;
  payments: number;
  firstPayment: string;
  lastPayment: string;
}

export interface TransactionFilters {
  page?: number;
  limit?: number;
  type?: string;
  currency?: string;
  projectName?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
}

class TransactionService {
  async getAll(filters: TransactionFilters = {}) {
    const params = new URLSearchParams();
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());
    if (filters.type) params.append('type', filters.type);
    if (filters.currency) params.append('currency', filters.currency);
    if (filters.projectName) params.append('projectName', filters.projectName);
    if (filters.startDate) params.append('startDate', filters.startDate);
    if (filters.endDate) params.append('endDate', filters.endDate);
    if (filters.search) params.append('search', filters.search);

    const response = await api.get(`/transactions?${params.toString()}`);
    return response.data.data;
  }

  async getById(id: string) {
    const response = await api.get(`/transactions/${id}`);
    return response.data.data;
  }

  async update(id: string, data: Partial<Transaction>) {
    const response = await api.patch(`/transactions/${id}`, data);
    return response.data.data;
  }

  async delete(id: string) {
    const response = await api.delete(`/transactions/${id}`);
    return response.data;
  }

  async getSummary(filters?: { startDate?: string; endDate?: string }): Promise<TransactionSummary> {
    const params = new URLSearchParams();
    if (filters?.startDate) params.append('startDate', filters.startDate);
    if (filters?.endDate) params.append('endDate', filters.endDate);

    const response = await api.get(`/transactions/summary?${params.toString()}`);
    return response.data.data;
  }

  async getProjects(): Promise<TransactionProject[]> {
    const response = await api.get('/transactions/projects');
    return response.data.data;
  }

  async importCSV(csvContent: string) {
    const response = await api.post('/transactions/import', { csvContent });
    return response.data;
  }

  async createProjectFromTransaction(projectName: string, clientName: string | null) {
    const response = await api.post('/transactions/create-project', { projectName, clientName });
    return response.data.data;
  }

  async create(data: {
    date?: string;
    description: string;
    type: string;
    amount: number;
    currency: string;
    notes?: string;
    projectName?: string;
    clientName?: string;
  }) {
    const response = await api.post('/transactions', data);
    return response.data.data;
  }
}

export const transactionService = new TransactionService();
