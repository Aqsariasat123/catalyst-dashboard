import { Request, Response } from 'express';
import { accountsService } from '../services/accounts.service.js';

export class AccountsController {
  async getOverview(req: Request, res: Response) {
    try {
      const overview = await accountsService.getAccountsOverview();
      res.json(overview);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  async getProjectDetails(req: Request, res: Response) {
    try {
      const { projectId } = req.params;
      const details = await accountsService.getProjectAccountDetails(projectId);
      res.json(details);
    } catch (error: any) {
      if (error.message === 'Project not found') {
        return res.status(404).json({ message: error.message });
      }
      res.status(500).json({ message: error.message });
    }
  }

  async getProjectFinancials(req: Request, res: Response) {
    try {
      const { projectId } = req.params;
      const financials = await accountsService.getProjectFinancials(projectId);
      res.json(financials);
    } catch (error: any) {
      if (error.message === 'Project not found') {
        return res.status(404).json({ message: error.message });
      }
      res.status(500).json({ message: error.message });
    }
  }

  async updateProjectFinancials(req: Request, res: Response) {
    try {
      const { projectId } = req.params;
      const result = await accountsService.updateProjectFinancials(projectId, req.body);
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  async getDeveloperDetails(req: Request, res: Response) {
    try {
      const { developerId } = req.params;
      const details = await accountsService.getDeveloperAccountDetails(developerId);
      res.json(details);
    } catch (error: any) {
      if (error.message === 'Developer not found') {
        return res.status(404).json({ message: error.message });
      }
      res.status(500).json({ message: error.message });
    }
  }

  async getMilestones(req: Request, res: Response) {
    try {
      const { projectId } = req.query;
      const milestones = await accountsService.getMilestones(projectId as string | undefined);
      res.json(milestones);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  async createMilestone(req: Request, res: Response) {
    try {
      const { projectId, title, description, amount, currency, dueDate } = req.body;

      if (!projectId || !title) {
        return res.status(400).json({ message: 'Project and title are required' });
      }

      const milestone = await accountsService.createMilestone({
        projectId,
        title,
        description,
        amount: typeof amount === 'string' ? parseFloat(amount) : amount,
        currency,
        dueDate: dueDate ? new Date(dueDate) : undefined,
      });
      res.status(201).json(milestone);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  async updateMilestone(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { title, description, amount, currency, status, dueDate } = req.body;

      const milestone = await accountsService.updateMilestone(id, {
        title,
        description,
        amount: amount !== undefined ? (typeof amount === 'string' ? parseFloat(amount) : amount) : undefined,
        currency,
        status,
        dueDate: dueDate ? new Date(dueDate) : undefined,
      });
      res.json(milestone);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  async deleteMilestone(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await accountsService.deleteMilestone(id);
      res.status(204).send();
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  async getTimeBreakdown(req: Request, res: Response) {
    try {
      const breakdown = await accountsService.getTimeBreakdownByProject();
      res.json(breakdown);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }
}

export const accountsController = new AccountsController();
