import api from './api';
import { ApiResponse } from '@/types';
import { QAAttachment } from '@/types/qa.types';

export interface AttachmentContext {
  testCaseId?: string;
  testExecutionId?: string;
  bugId?: string;
}

export const qaAttachmentService = {
  async upload(file: File, context: AttachmentContext): Promise<QAAttachment> {
    const formData = new FormData();
    formData.append('file', file);

    if (context.testCaseId) formData.append('testCaseId', context.testCaseId);
    if (context.testExecutionId) formData.append('testExecutionId', context.testExecutionId);
    if (context.bugId) formData.append('bugId', context.bugId);

    const response = await api.post<ApiResponse<QAAttachment>>('/qa/attachments/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data.data!;
  },

  async uploadMultiple(files: File[], context: AttachmentContext): Promise<QAAttachment[]> {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append('files', file);
    });

    if (context.testCaseId) formData.append('testCaseId', context.testCaseId);
    if (context.testExecutionId) formData.append('testExecutionId', context.testExecutionId);
    if (context.bugId) formData.append('bugId', context.bugId);

    const response = await api.post<ApiResponse<QAAttachment[]>>('/qa/attachments/upload-multiple', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data.data!;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/qa/attachments/${id}`);
  },

  async getByContext(context: AttachmentContext): Promise<QAAttachment[]> {
    const params = new URLSearchParams();
    if (context.testCaseId) params.append('testCaseId', context.testCaseId);
    if (context.testExecutionId) params.append('testExecutionId', context.testExecutionId);
    if (context.bugId) params.append('bugId', context.bugId);

    const response = await api.get<ApiResponse<QAAttachment[]>>(`/qa/attachments?${params}`);
    return response.data.data!;
  },

  getServeUrl(attachment: QAAttachment): string {
    // attachment.url is like "/uploads/qa/filename.jpg"
    // In development, Vite proxy forwards /uploads to backend
    // In production, this should be the full backend URL
    return attachment.url;
  },

  getPreviewUrl(attachment: QAAttachment): string {
    // If it's an image or video, return the serve URL through static files
    if (attachment.type === 'IMAGE' || attachment.type === 'VIDEO') {
      return this.getServeUrl(attachment);
    }
    // For documents, return a placeholder or icon URL
    return '/icons/document.svg';
  },

  getDownloadUrl(attachment: QAAttachment): string {
    return `${api.defaults.baseURL}/qa/attachments/${attachment.id}/download`;
  },

  isImage(attachment: QAAttachment): boolean {
    return attachment.type === 'IMAGE' || attachment.mimeType.startsWith('image/');
  },

  isVideo(attachment: QAAttachment): boolean {
    return attachment.type === 'VIDEO' || attachment.mimeType.startsWith('video/');
  },

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  },
};
