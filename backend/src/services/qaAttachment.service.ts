import { QAAttachmentType } from '@prisma/client';
import { prisma } from '../config/database.js';
import { AppError } from '../middleware/errorHandler.js';
import fs from 'fs';
import path from 'path';

export interface AttachmentContext {
  testCaseId?: string;
  testExecutionId?: string;
  bugId?: string;
}

export interface CreateAttachmentDTO {
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
  type: QAAttachmentType;
  context: AttachmentContext;
}

export class QAAttachmentService {
  private getAttachmentType(mimeType: string): QAAttachmentType {
    if (mimeType.startsWith('image/')) return 'IMAGE';
    if (mimeType.startsWith('video/')) return 'VIDEO';
    if (mimeType === 'application/pdf' || mimeType.includes('document')) return 'DOCUMENT';
    return 'OTHER';
  }

  async create(data: CreateAttachmentDTO, userId: string): Promise<any> {
    // Validate that at least one context is provided
    if (!data.context.testCaseId && !data.context.testExecutionId && !data.context.bugId) {
      throw new AppError('At least one context (testCaseId, testExecutionId, or bugId) is required', 400);
    }

    // Verify the context entity exists
    if (data.context.testCaseId) {
      const testCase = await prisma.testCase.findUnique({ where: { id: data.context.testCaseId } });
      if (!testCase) throw new AppError('Test case not found', 404);
    }

    if (data.context.testExecutionId) {
      const execution = await prisma.testExecution.findUnique({ where: { id: data.context.testExecutionId } });
      if (!execution) throw new AppError('Test execution not found', 404);
    }

    if (data.context.bugId) {
      const bug = await prisma.bug.findUnique({ where: { id: data.context.bugId } });
      if (!bug) throw new AppError('Bug not found', 404);

      // Log attachment activity for bugs
      await prisma.bugActivity.create({
        data: {
          bugId: data.context.bugId,
          userId,
          action: 'ATTACHMENT_ADDED',
          newValue: data.originalName,
        },
      });
    }

    const attachment = await prisma.qAAttachment.create({
      data: {
        filename: data.filename,
        originalName: data.originalName,
        mimeType: data.mimeType,
        size: data.size,
        url: data.url,
        type: data.type,
        testCaseId: data.context.testCaseId,
        testExecutionId: data.context.testExecutionId,
        bugId: data.context.bugId,
        uploadedById: userId,
      },
      include: {
        uploadedBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    return attachment;
  }

  async createFromFile(
    file: Express.Multer.File,
    context: AttachmentContext,
    userId: string
  ): Promise<any> {
    const type = this.getAttachmentType(file.mimetype);

    return this.create(
      {
        filename: file.filename,
        originalName: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
        url: `/uploads/qa/${file.filename}`,
        type,
        context,
      },
      userId
    );
  }

  async findById(id: string): Promise<any> {
    const attachment = await prisma.qAAttachment.findUnique({
      where: { id },
      include: {
        uploadedBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        testCase: {
          select: {
            id: true,
            title: true,
          },
        },
        testExecution: {
          select: {
            id: true,
            testCase: {
              select: {
                id: true,
                title: true,
              },
            },
          },
        },
        bug: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });

    if (!attachment) {
      throw new AppError('Attachment not found', 404);
    }

    return attachment;
  }

  async getByTestCase(testCaseId: string): Promise<any[]> {
    return prisma.qAAttachment.findMany({
      where: { testCaseId },
      include: {
        uploadedBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getByExecution(testExecutionId: string): Promise<any[]> {
    return prisma.qAAttachment.findMany({
      where: { testExecutionId },
      include: {
        uploadedBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getByBug(bugId: string): Promise<any[]> {
    return prisma.qAAttachment.findMany({
      where: { bugId },
      include: {
        uploadedBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async delete(id: string, userId: string): Promise<{ message: string }> {
    const attachment = await prisma.qAAttachment.findUnique({
      where: { id },
    });

    if (!attachment) {
      throw new AppError('Attachment not found', 404);
    }

    // Delete the physical file
    const filePath = path.join(process.cwd(), attachment.url);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // Log activity if it's a bug attachment
    if (attachment.bugId) {
      await prisma.bugActivity.create({
        data: {
          bugId: attachment.bugId,
          userId,
          action: 'ATTACHMENT_REMOVED',
          oldValue: attachment.originalName,
        },
      });
    }

    await prisma.qAAttachment.delete({
      where: { id },
    });

    return { message: 'Attachment deleted successfully' };
  }

  getPreviewUrl(attachment: { id: string; url: string; mimeType: string }): string {
    // For now, return the direct URL. In production, you might want to
    // generate a signed URL or proxy through an endpoint for security
    return attachment.url;
  }
}

export const qaAttachmentService = new QAAttachmentService();
