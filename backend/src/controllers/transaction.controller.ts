import { Request, Response } from 'express';
import { transactionService } from '../services/transaction.service.js';
import { TransactionType } from '@prisma/client';

class TransactionController {
  // Create a new transaction manually
  async create(req: Request, res: Response) {
    try {
      const { date, description, type, amount, currency, gst, platform, projectName, clientName, notes } = req.body;

      if (!description || amount === undefined || !currency || !type) {
        return res.status(400).json({
          success: false,
          message: 'Description, type, amount, and currency are required',
        });
      }

      const transaction = await transactionService.create({
        date: date ? new Date(date) : new Date(),
        description,
        type: type as TransactionType,
        amount: parseFloat(amount),
        currency,
        gst: gst ? parseFloat(gst) : null,
        platform,
        projectName,
        clientName,
        notes,
      });

      res.json({
        success: true,
        message: 'Transaction created successfully',
        data: transaction,
      });
    } catch (error) {
      console.error('Error creating transaction:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create transaction',
      });
    }
  }

  // Import transactions from CSV
  async importCSV(req: Request, res: Response) {
    try {
      const { csvContent } = req.body;

      if (!csvContent) {
        return res.status(400).json({
          success: false,
          message: 'CSV content is required',
        });
      }

      const result = await transactionService.importFromCSV(csvContent);

      res.json({
        success: true,
        message: `Imported ${result.imported} transactions, skipped ${result.skipped} duplicates`,
        data: result,
      });
    } catch (error) {
      console.error('Error importing CSV:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to import transactions',
      });
    }
  }

  // Get all transactions with filters
  async findAll(req: Request, res: Response) {
    try {
      const {
        page,
        limit,
        type,
        currency,
        projectName,
        startDate,
        endDate,
        search,
      } = req.query;

      const result = await transactionService.findAll({
        page: page ? parseInt(page as string) : undefined,
        limit: limit ? parseInt(limit as string) : undefined,
        type: type as TransactionType,
        currency: currency as string,
        projectName: projectName as string,
        startDate: startDate as string,
        endDate: endDate as string,
        search: search as string,
      });

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      console.error('Error fetching transactions:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch transactions',
      });
    }
  }

  // Get transaction by ID
  async findById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const transaction = await transactionService.findById(id);

      if (!transaction) {
        return res.status(404).json({
          success: false,
          message: 'Transaction not found',
        });
      }

      res.json({
        success: true,
        data: transaction,
      });
    } catch (error) {
      console.error('Error fetching transaction:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch transaction',
      });
    }
  }

  // Update transaction
  async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const transaction = await transactionService.update(id, req.body);

      res.json({
        success: true,
        message: 'Transaction updated successfully',
        data: transaction,
      });
    } catch (error) {
      console.error('Error updating transaction:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update transaction',
      });
    }
  }

  // Delete transaction
  async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await transactionService.delete(id);

      res.json({
        success: true,
        message: 'Transaction deleted successfully',
      });
    } catch (error) {
      console.error('Error deleting transaction:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete transaction',
      });
    }
  }

  // Get transaction summary
  async getSummary(req: Request, res: Response) {
    try {
      const { startDate, endDate } = req.query;

      const summary = await transactionService.getSummary({
        startDate: startDate as string,
        endDate: endDate as string,
      });

      res.json({
        success: true,
        data: summary,
      });
    } catch (error) {
      console.error('Error fetching summary:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch summary',
      });
    }
  }

  // Get projects from transactions
  async getProjects(req: Request, res: Response) {
    try {
      const projects = await transactionService.getProjects();

      res.json({
        success: true,
        data: projects,
      });
    } catch (error) {
      console.error('Error fetching projects:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch projects',
      });
    }
  }

  // Create project from transaction
  async createProjectFromTransaction(req: Request, res: Response) {
    try {
      const { projectName, clientName } = req.body;

      if (!projectName) {
        return res.status(400).json({
          success: false,
          message: 'Project name is required',
        });
      }

      const project = await transactionService.createProjectFromTransaction(projectName, clientName);

      res.json({
        success: true,
        message: 'Project created successfully from transactions',
        data: project,
      });
    } catch (error) {
      console.error('Error creating project:', error);
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to create project',
      });
    }
  }
}

export const transactionController = new TransactionController();
