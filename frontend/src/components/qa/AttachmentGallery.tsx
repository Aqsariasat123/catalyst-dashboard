import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { PhotoIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { QAAttachment } from '@/types/qa.types';
import { qaAttachmentService } from '@/services/qaAttachment.service';
import AttachmentPreview, { AttachmentListItem } from './AttachmentPreview';
import AttachmentViewer from './AttachmentViewer';
import { cn } from '@/utils/helpers';

interface AttachmentGalleryProps {
  attachments: QAAttachment[];
  onDelete?: (attachment: QAAttachment) => void;
  viewMode?: 'grid' | 'list';
  editable?: boolean;
  className?: string;
  emptyMessage?: string;
}

export default function AttachmentGallery({
  attachments,
  onDelete,
  viewMode = 'grid',
  editable = false,
  className,
  emptyMessage = 'No attachments',
}: AttachmentGalleryProps) {
  const queryClient = useQueryClient();
  const [viewerAttachment, setViewerAttachment] = useState<QAAttachment | null>(null);
  const [viewerIndex, setViewerIndex] = useState(0);
  const [deleteConfirm, setDeleteConfirm] = useState<QAAttachment | null>(null);

  // Get only viewable attachments (images and videos)
  const viewableAttachments = attachments.filter(
    (a) => qaAttachmentService.isImage(a) || qaAttachmentService.isVideo(a)
  );

  const deleteMutation = useMutation({
    mutationFn: (id: string) => qaAttachmentService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bugs'] });
      queryClient.invalidateQueries({ queryKey: ['testCases'] });
      queryClient.invalidateQueries({ queryKey: ['testExecutions'] });
      toast.success('Attachment deleted');
      setDeleteConfirm(null);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete attachment');
    },
  });

  const handleView = (attachment: QAAttachment) => {
    const index = viewableAttachments.findIndex((a) => a.id === attachment.id);
    if (index !== -1) {
      setViewerIndex(index);
      setViewerAttachment(attachment);
    }
  };

  const handleViewerNavigate = (direction: 'prev' | 'next') => {
    const newIndex =
      direction === 'prev'
        ? (viewerIndex - 1 + viewableAttachments.length) % viewableAttachments.length
        : (viewerIndex + 1) % viewableAttachments.length;
    setViewerIndex(newIndex);
    setViewerAttachment(viewableAttachments[newIndex]);
  };

  const handleDelete = (attachment: QAAttachment) => {
    if (onDelete) {
      onDelete(attachment);
    } else {
      setDeleteConfirm(attachment);
    }
  };

  const confirmDelete = () => {
    if (deleteConfirm) {
      deleteMutation.mutate(deleteConfirm.id);
    }
  };

  if (attachments.length === 0) {
    return (
      <div className={cn('text-center py-8', className)}>
        <PhotoIcon className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
        <p className="text-sm text-gray-500 dark:text-gray-400">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className={className}>
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-2">
          {attachments.map((attachment) => (
            <AttachmentPreview
              key={attachment.id}
              attachment={attachment}
              onView={() => handleView(attachment)}
              onDelete={editable ? () => handleDelete(attachment) : undefined}
              showActions
              size="md"
            />
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {attachments.map((attachment) => (
            <AttachmentListItem
              key={attachment.id}
              attachment={attachment}
              onView={() => handleView(attachment)}
              onDelete={editable ? () => handleDelete(attachment) : undefined}
              showActions
            />
          ))}
        </div>
      )}

      {/* Attachment Viewer Modal */}
      {viewerAttachment && (
        <AttachmentViewer
          attachment={viewerAttachment}
          onClose={() => setViewerAttachment(null)}
          onPrev={viewableAttachments.length > 1 ? () => handleViewerNavigate('prev') : undefined}
          onNext={viewableAttachments.length > 1 ? () => handleViewerNavigate('next') : undefined}
          currentIndex={viewerIndex + 1}
          totalCount={viewableAttachments.length}
        />
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-[70] overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <div
              className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm"
              onClick={() => setDeleteConfirm(null)}
            />
            <div className="relative bg-white dark:bg-black rounded-xl shadow-2xl max-w-md w-full p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Delete Attachment
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-6">
                Are you sure you want to delete "{deleteConfirm.originalName}"? This action cannot be
                undone.
              </p>
              <div className="flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setDeleteConfirm(null)}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={confirmDelete}
                  disabled={deleteMutation.isPending}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
