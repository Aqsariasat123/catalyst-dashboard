import { Response, NextFunction } from 'express';
import { z } from 'zod';
import { clientService } from '../services/client.service.js';
import { AuthRequest } from '../types/index.js';
import { sendSuccess, getPaginationParams } from '../utils/helpers.js';

const createClientSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().optional(),
  company: z.string().optional(),
  clientType: z.enum(['UPWORK', 'DIRECT']),
  upworkProfile: z.string().url().optional().or(z.literal('')),
  website: z.string().url().optional().or(z.literal('')),
  address: z.string().optional(),
  notes: z.string().optional(),
});

const updateClientSchema = createClientSchema.partial().extend({
  isActive: z.boolean().optional(),
});

export class ClientController {
  async findAll(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const pagination = getPaginationParams(req.query);
      const filters = {
        clientType: req.query.clientType as any,
        search: req.query.search as string,
        isActive: req.query.isActive === 'true' ? true : req.query.isActive === 'false' ? false : undefined,
      };

      const result = await clientService.findAll(pagination, filters);
      sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }

  async findById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const client = await clientService.findById(req.params.id);
      sendSuccess(res, client);
    } catch (error) {
      next(error);
    }
  }

  async getAll(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const clients = await clientService.getAll();
      sendSuccess(res, clients);
    } catch (error) {
      next(error);
    }
  }

  async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const data = createClientSchema.parse(req.body);
      const client = await clientService.create({
        ...data,
        email: data.email || undefined,
        upworkProfile: data.upworkProfile || undefined,
        website: data.website || undefined,
      });
      sendSuccess(res, client, 'Client created successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  async update(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const data = updateClientSchema.parse(req.body);
      const client = await clientService.update(req.params.id, {
        ...data,
        email: data.email || undefined,
        upworkProfile: data.upworkProfile || undefined,
        website: data.website || undefined,
      });
      sendSuccess(res, client, 'Client updated successfully');
    } catch (error) {
      next(error);
    }
  }

  async delete(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await clientService.delete(req.params.id);
      sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }
}

export const clientController = new ClientController();
