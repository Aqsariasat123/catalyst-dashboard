import { PrismaClient, TransactionType, Platform, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

interface ParsedTransaction {
  date: Date;
  description: string;
  type: TransactionType;
  amount: number;
  currency: string;
  gst: number | null;
  projectName: string | null;
  clientName: string | null;
  platform: Platform;
}

interface TransactionFilters {
  page?: number;
  limit?: number;
  type?: TransactionType;
  currency?: string;
  projectName?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
}

class TransactionService {
  // Parse a single CSV row
  parseCSVRow(row: string[]): ParsedTransaction | null {
    const [dateStr, description, currency, amountStr, gstStr] = row;

    if (!dateStr || !description) return null;

    // Parse date (format: "06 Jan 2026 23:52")
    const date = this.parseDate(dateStr);
    if (!date) return null;

    // Parse amount (remove + sign, handle negative)
    const amount = parseFloat(amountStr?.replace(/[+,]/g, '') || '0');

    // Parse GST
    const gst = gstStr ? parseFloat(gstStr.replace(/[+,]/g, '')) : null;

    // Determine transaction type
    const type = this.determineTransactionType(description);

    // Extract project and client names
    const { projectName, clientName } = this.extractProjectAndClient(description);

    return {
      date,
      description: description.replace(/&amp;/g, '&'), // Decode HTML entities
      type,
      amount,
      currency: currency || 'USD',
      gst,
      projectName,
      clientName,
      platform: Platform.FREELANCER,
    };
  }

  // Parse date from "06 Jan 2026 23:52" format
  private parseDate(dateStr: string): Date | null {
    try {
      const months: { [key: string]: number } = {
        Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5,
        Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11,
      };

      const parts = dateStr.trim().split(' ');
      if (parts.length < 3) return null;

      const day = parseInt(parts[0]);
      const month = months[parts[1]];
      const year = parseInt(parts[2]);

      let hours = 0, minutes = 0;
      if (parts[3]) {
        const timeParts = parts[3].split(':');
        hours = parseInt(timeParts[0]) || 0;
        minutes = parseInt(timeParts[1]) || 0;
      }

      return new Date(year, month, day, hours, minutes);
    } catch {
      return null;
    }
  }

  // Determine transaction type from description
  private determineTransactionType(description: string): TransactionType {
    const desc = description.toLowerCase();

    // IMPORTANT: Check LOCK and UNLOCK first (before withdrawal) because
    // "Locked due to process Express withdrawal" contains "express withdrawal"
    if (desc.includes('locked due to process')) return TransactionType.LOCK;
    if (desc.includes('removal of [locked')) return TransactionType.UNLOCK;

    // Currency conversion (both credit and debit)
    if (desc.includes('currency conversion')) return TransactionType.CURRENCY_CONVERSION;

    // Actual transactions
    if (desc.includes('done milestone payment')) return TransactionType.MILESTONE_PAYMENT;
    if (desc.includes('transfer from')) return TransactionType.MILESTONE_PAYMENT; // Arbitration transfers count as income
    if (desc.includes('preferred freelancer program project fee')) return TransactionType.PREFERRED_FEE;
    if (desc.includes('hourly project fee')) return TransactionType.HOURLY_FEE;
    if (desc.includes('project fee taken') || desc.includes('offsite payment')) return TransactionType.PROJECT_FEE;
    if (desc.includes('express withdrawal') || desc.includes('payoneer withdrawal')) return TransactionType.WITHDRAWAL;
    if (desc.includes('membership')) return TransactionType.MEMBERSHIP;
    if (desc.includes('exam fee')) return TransactionType.EXAM;
    if (desc.includes('refund')) return TransactionType.REFUND;
    if (desc.includes('arbitration')) return TransactionType.ARBITRATION;

    return TransactionType.OTHER;
  }

  // Extract project name and client name from description
  private extractProjectAndClient(description: string): { projectName: string | null; clientName: string | null } {
    let projectName: string | null = null;
    let clientName: string | null = null;

    // Pattern: "from ClientName for project ProjectName"
    const paymentMatch = description.match(/from\s+([A-Za-z]+\s+[A-Za-z]\.?)\s+for\s+project\s+(.+?)(?:\s+\(|$)/i);
    if (paymentMatch) {
      clientName = paymentMatch[1].trim();
      projectName = paymentMatch[2].trim().replace(/&amp;/g, '&');
    }

    // Pattern for fees: "fee taken (ProjectName)"
    if (!projectName) {
      const feeMatch = description.match(/fee\s+taken\s+\(([^)]+)\)/i);
      if (feeMatch) {
        projectName = feeMatch[1].trim().replace(/&amp;/g, '&');
      }
    }

    // Pattern: "for project ProjectName"
    if (!projectName) {
      const projectMatch = description.match(/for\s+project\s+(.+?)(?:\s+\(|$)/i);
      if (projectMatch) {
        projectName = projectMatch[1].trim().replace(/&amp;/g, '&');
      }
    }

    return { projectName, clientName };
  }

  // Parse entire CSV content
  parseCSV(csvContent: string): ParsedTransaction[] {
    const lines = csvContent.trim().split('\n');
    const transactions: ParsedTransaction[] = [];

    // Skip header row
    for (let i = 1; i < lines.length; i++) {
      const row = this.parseCSVLine(lines[i]);
      const parsed = this.parseCSVRow(row);
      if (parsed) {
        transactions.push(parsed);
      }
    }

    return transactions;
  }

  // Parse a single CSV line handling quoted fields
  private parseCSVLine(line: string): string[] {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];

      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    result.push(current.trim());

    return result;
  }

  // Import transactions from CSV
  async importFromCSV(csvContent: string): Promise<{ imported: number; skipped: number }> {
    const parsed = this.parseCSV(csvContent);
    let imported = 0;
    let skipped = 0;

    // Types to skip (locked funds, unlocked funds, currency conversions)
    const skipTypes: TransactionType[] = [
      TransactionType.LOCK,
      TransactionType.UNLOCK,
      TransactionType.CURRENCY_CONVERSION,
    ];

    for (const transaction of parsed) {
      try {
        // Skip locked, unlock, and currency conversion transactions
        if (skipTypes.includes(transaction.type)) {
          skipped++;
          continue;
        }

        // Check if transaction already exists (same date, description, amount)
        const existing = await prisma.transaction.findFirst({
          where: {
            date: transaction.date,
            description: transaction.description,
            amount: transaction.amount,
          },
        });

        if (existing) {
          skipped++;
          continue;
        }

        await prisma.transaction.create({
          data: {
            date: transaction.date,
            description: transaction.description,
            type: transaction.type,
            amount: transaction.amount,
            currency: transaction.currency,
            gst: transaction.gst,
            projectName: transaction.projectName,
            clientName: transaction.clientName,
            platform: transaction.platform,
          },
        });
        imported++;
      } catch (error) {
        console.error('Error importing transaction:', error);
        skipped++;
      }
    }

    return { imported, skipped };
  }

  // Get all transactions with filters
  async findAll(filters: TransactionFilters) {
    const {
      page = 1,
      limit = 50,
      type,
      currency,
      projectName,
      startDate,
      endDate,
      search,
    } = filters;

    const where: Prisma.TransactionWhereInput = {};

    if (type) where.type = type;
    if (currency) where.currency = currency;
    if (projectName) where.projectName = { contains: projectName, mode: 'insensitive' };

    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = new Date(startDate);
      if (endDate) where.date.lte = new Date(endDate);
    }

    if (search) {
      where.OR = [
        { description: { contains: search, mode: 'insensitive' } },
        { projectName: { contains: search, mode: 'insensitive' } },
        { clientName: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [transactions, total] = await Promise.all([
      prisma.transaction.findMany({
        where,
        orderBy: { date: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.transaction.count({ where }),
    ]);

    return {
      data: transactions,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // Get transaction by ID
  async findById(id: string) {
    return prisma.transaction.findUnique({ where: { id } });
  }

  // Update transaction
  async update(id: string, data: Prisma.TransactionUpdateInput) {
    return prisma.transaction.update({
      where: { id },
      data,
    });
  }

  // Delete transaction
  async delete(id: string) {
    return prisma.transaction.delete({ where: { id } });
  }

  // Create a new transaction manually (for withdrawals, etc.)
  async create(data: {
    date: Date;
    description: string;
    type: TransactionType;
    amount: number;
    currency: string;
    gst?: number | null;
    platform?: Platform;
    projectName?: string | null;
    clientName?: string | null;
    projectId?: string | null;
    milestoneId?: string | null;
    notes?: string | null;
  }) {
    return prisma.transaction.create({
      data: {
        date: data.date,
        description: data.description,
        type: data.type,
        amount: data.amount,
        currency: data.currency,
        gst: data.gst,
        platform: data.platform || Platform.FREELANCER,
        projectName: data.projectName,
        clientName: data.clientName,
        projectId: data.projectId,
        milestoneId: data.milestoneId,
        notes: data.notes,
      },
    });
  }

  // Create transaction from milestone release
  async createFromMilestoneRelease(milestone: {
    id: string;
    title: string;
    amount: number;
    currency: string;
    projectId: string;
    projectName: string;
    clientName?: string;
    platformFeePercent?: number;
  }) {
    // Check if transaction already exists for this milestone
    const existing = await prisma.transaction.findFirst({
      where: { milestoneId: milestone.id, type: TransactionType.MILESTONE_PAYMENT },
    });

    if (existing) {
      return existing;
    }

    const transactions = [];

    // Create the milestone payment transaction (gross amount)
    const paymentTx = await prisma.transaction.create({
      data: {
        date: new Date(),
        description: `Milestone payment: ${milestone.title} for ${milestone.projectName}`,
        type: TransactionType.MILESTONE_PAYMENT,
        amount: milestone.amount,
        currency: milestone.currency,
        platform: Platform.FREELANCER,
        projectName: milestone.projectName,
        clientName: milestone.clientName,
        projectId: milestone.projectId,
        milestoneId: milestone.id,
      },
    });
    transactions.push(paymentTx);

    // If there's a platform fee, create a fee transaction
    if (milestone.platformFeePercent && milestone.platformFeePercent > 0) {
      const feeAmount = milestone.amount * (milestone.platformFeePercent / 100);

      const feeTx = await prisma.transaction.create({
        data: {
          date: new Date(),
          description: `Platform fee (${milestone.platformFeePercent}%) for ${milestone.title} - ${milestone.projectName}`,
          type: TransactionType.PROJECT_FEE,
          amount: -feeAmount, // Negative because it's a deduction
          currency: milestone.currency,
          platform: Platform.FREELANCER,
          projectName: milestone.projectName,
          clientName: milestone.clientName,
          projectId: milestone.projectId,
          milestoneId: milestone.id,
        },
      });
      transactions.push(feeTx);
    }

    return transactions;
  }

  // Get transaction summary/stats
  async getSummary(filters?: { startDate?: string; endDate?: string }) {
    const where: Prisma.TransactionWhereInput = {};

    if (filters?.startDate || filters?.endDate) {
      where.date = {};
      if (filters.startDate) where.date.gte = new Date(filters.startDate);
      if (filters.endDate) where.date.lte = new Date(filters.endDate);
    }

    // Get totals by type and currency
    const transactions = await prisma.transaction.findMany({ where });

    const summary: {
      totalEarnings: { [currency: string]: number };
      totalFees: { [currency: string]: number };
      totalWithdrawals: { [currency: string]: number };
      byType: { [type: string]: { count: number; total: { [currency: string]: number } } };
      byProject: { [project: string]: { count: number; total: number; currency: string } };
      byClient: { [client: string]: { count: number; total: number } };
    } = {
      totalEarnings: {},
      totalFees: {},
      totalWithdrawals: {},
      byType: {},
      byProject: {},
      byClient: {},
    };

    for (const t of transactions) {
      const amount = Number(t.amount);
      const currency = t.currency;
      const type = t.type;

      // Initialize type entry
      if (!summary.byType[type]) {
        summary.byType[type] = { count: 0, total: {} };
      }
      summary.byType[type].count++;
      summary.byType[type].total[currency] = (summary.byType[type].total[currency] || 0) + amount;

      // Categorize by earnings/fees/withdrawals
      if (type === 'MILESTONE_PAYMENT' && amount > 0) {
        summary.totalEarnings[currency] = (summary.totalEarnings[currency] || 0) + amount;
      } else if (['PROJECT_FEE', 'PREFERRED_FEE', 'HOURLY_FEE'].includes(type)) {
        summary.totalFees[currency] = (summary.totalFees[currency] || 0) + Math.abs(amount);
      } else if (type === 'WITHDRAWAL' && amount < 0) {
        summary.totalWithdrawals[currency] = (summary.totalWithdrawals[currency] || 0) + Math.abs(amount);
      }

      // By project (only for payments)
      if (t.projectName && type === 'MILESTONE_PAYMENT' && amount > 0) {
        if (!summary.byProject[t.projectName]) {
          summary.byProject[t.projectName] = { count: 0, total: 0, currency };
        }
        summary.byProject[t.projectName].count++;
        summary.byProject[t.projectName].total += amount;
      }

      // By client
      if (t.clientName && type === 'MILESTONE_PAYMENT' && amount > 0) {
        if (!summary.byClient[t.clientName]) {
          summary.byClient[t.clientName] = { count: 0, total: 0 };
        }
        summary.byClient[t.clientName].count++;
        summary.byClient[t.clientName].total += amount;
      }
    }

    return summary;
  }

  // Get unique projects from transactions
  async getProjects() {
    const transactions = await prisma.transaction.findMany({
      where: {
        projectName: { not: null },
        type: 'MILESTONE_PAYMENT',
      },
      select: {
        projectName: true,
        clientName: true,
        currency: true,
        amount: true,
        date: true,
      },
      orderBy: { date: 'desc' },
    });

    // Group by project
    const projectMap = new Map<string, {
      name: string;
      client: string | null;
      totalEarned: number;
      currency: string;
      payments: number;
      firstPayment: Date;
      lastPayment: Date;
    }>();

    for (const t of transactions) {
      if (!t.projectName) continue;

      const existing = projectMap.get(t.projectName);
      const amount = Number(t.amount);

      if (existing) {
        existing.totalEarned += amount;
        existing.payments++;
        if (t.date < existing.firstPayment) existing.firstPayment = t.date;
        if (t.date > existing.lastPayment) existing.lastPayment = t.date;
      } else {
        projectMap.set(t.projectName, {
          name: t.projectName,
          client: t.clientName,
          totalEarned: amount,
          currency: t.currency,
          payments: 1,
          firstPayment: t.date,
          lastPayment: t.date,
        });
      }
    }

    return Array.from(projectMap.values()).sort((a, b) => b.lastPayment.getTime() - a.lastPayment.getTime());
  }

  // Create project from transaction data
  async createProjectFromTransaction(projectName: string, clientName: string | null) {
    // First, check if client exists or create one
    let client = await prisma.client.findFirst({
      where: { name: { contains: clientName || 'Unknown', mode: 'insensitive' } },
    });

    if (!client) {
      client = await prisma.client.create({
        data: {
          name: clientName || 'Unknown Client',
          clientType: 'FREELANCER',
        },
      });
    }

    // Get transaction data for this project
    const transactions = await prisma.transaction.findMany({
      where: {
        projectName: { equals: projectName, mode: 'insensitive' },
        type: 'MILESTONE_PAYMENT',
      },
      orderBy: { date: 'asc' },
    });

    if (transactions.length === 0) {
      throw new Error('No transactions found for this project');
    }

    // Calculate budget from payments
    const totalBudget = transactions.reduce((sum, t) => sum + Number(t.amount), 0);
    const currency = transactions[0].currency;
    const startDate = transactions[0].date;
    const lastPayment = transactions[transactions.length - 1].date;

    // Create project
    const project = await prisma.project.create({
      data: {
        name: projectName,
        clientId: client.id,
        status: 'COMPLETED',
        startDate,
        endDate: lastPayment,
        budget: totalBudget,
        currency,
      },
    });

    // Create milestones from payments
    for (const t of transactions) {
      await prisma.milestone.create({
        data: {
          projectId: project.id,
          title: `Payment - ${t.date.toLocaleDateString()}`,
          amount: Number(t.amount),
          currency: t.currency,
          status: 'COMPLETED',
          releasedAt: t.date,
          dueDate: t.date,
        },
      });

      // Link transaction to project
      await prisma.transaction.update({
        where: { id: t.id },
        data: { projectId: project.id },
      });
    }

    return project;
  }
}

export const transactionService = new TransactionService();
