import { Response, NextFunction } from 'express';
import { z } from 'zod';
import { qaAttachmentService } from '../services/qaAttachment.service.js';
import { AuthRequest } from '../types/index.js';
import { sendSuccess } from '../utils/helpers.js';
import path from 'path';
import fs from 'fs';

const contextSchema = z.object({
  testCaseId: z.string().uuid().optional(),
  testExecutionId: z.string().uuid().optional(),
  bugId: z.string().uuid().optional(),
}).refine(
  (data) => data.testCaseId || data.testExecutionId || data.bugId,
  { message: 'At least one context (testCaseId, testExecutionId, or bugId) is required' }
);

export class QAAttachmentController {
  async upload(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No file uploaded',
        });
      }

      const context = contextSchema.parse(req.body);
      const attachment = await qaAttachmentService.createFromFile(
        req.file,
        context,
        req.user!.userId
      );

      sendSuccess(res, attachment, 'File uploaded successfully', 201);
    } catch (error) {
      // Clean up uploaded file on error
      if (req.file) {
        const filePath = req.file.path;
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }
      next(error);
    }
  }

  async uploadMultiple(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const files = req.files as Express.Multer.File[];
      if (!files || files.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'No files uploaded',
        });
      }

      const context = contextSchema.parse(req.body);
      const attachments = await Promise.all(
        files.map((file) =>
          qaAttachmentService.createFromFile(file, context, req.user!.userId)
        )
      );

      sendSuccess(res, attachments, 'Files uploaded successfully', 201);
    } catch (error) {
      // Clean up uploaded files on error
      const files = req.files as Express.Multer.File[];
      if (files) {
        for (const file of files) {
          if (fs.existsSync(file.path)) {
            fs.unlinkSync(file.path);
          }
        }
      }
      next(error);
    }
  }

  async findById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const attachment = await qaAttachmentService.findById(req.params.id);
      sendSuccess(res, attachment);
    } catch (error) {
      next(error);
    }
  }

  async getByTestCase(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const attachments = await qaAttachmentService.getByTestCase(req.params.testCaseId);
      sendSuccess(res, attachments);
    } catch (error) {
      next(error);
    }
  }

  async getByExecution(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const attachments = await qaAttachmentService.getByExecution(req.params.executionId);
      sendSuccess(res, attachments);
    } catch (error) {
      next(error);
    }
  }

  async getByBug(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const attachments = await qaAttachmentService.getByBug(req.params.bugId);
      sendSuccess(res, attachments);
    } catch (error) {
      next(error);
    }
  }

  async delete(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await qaAttachmentService.delete(req.params.id, req.user!.userId);
      sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }

  async serve(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const attachment = await qaAttachmentService.findById(req.params.id);
      const filePath = path.join(process.cwd(), attachment.url);

      if (!fs.existsSync(filePath)) {
        return res.status(404).json({
          success: false,
          message: 'File not found',
        });
      }

      res.setHeader('Content-Type', attachment.mimeType);
      res.setHeader('Content-Disposition', `inline; filename="${attachment.originalName}"`);
      fs.createReadStream(filePath).pipe(res);
    } catch (error) {
      next(error);
    }
  }

  async download(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const attachment = await qaAttachmentService.findById(req.params.id);
      const filePath = path.join(process.cwd(), attachment.url);

      if (!fs.existsSync(filePath)) {
        return res.status(404).json({
          success: false,
          message: 'File not found',
        });
      }

      res.setHeader('Content-Type', attachment.mimeType);
      res.setHeader('Content-Disposition', `attachment; filename="${attachment.originalName}"`);
      fs.createReadStream(filePath).pipe(res);
    } catch (error) {
      next(error);
    }
  }
}

export const qaAttachmentController = new QAAttachmentController();
