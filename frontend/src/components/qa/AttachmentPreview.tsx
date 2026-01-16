import {
  PhotoIcon,
  VideoCameraIcon,
  DocumentIcon,
  ArrowDownTrayIcon,
  TrashIcon,
  EyeIcon,
} from '@heroicons/react/24/outline';
import { QAAttachment } from '@/types/qa.types';
import { qaAttachmentService } from '@/services/qaAttachment.service';
import { cn } from '@/utils/helpers';

interface AttachmentPreviewProps {
  attachment: QAAttachment;
  onView?: () => void;
  onDelete?: () => void;
  showActions?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeConfig = {
  sm: { container: 'w-16 h-16', icon: 'w-6 h-6' },
  md: { container: 'w-24 h-24', icon: 'w-8 h-8' },
  lg: { container: 'w-32 h-32', icon: 'w-10 h-10' },
};

export default function AttachmentPreview({
  attachment,
  onView,
  onDelete,
  showActions = true,
  size = 'md',
  className,
}: AttachmentPreviewProps) {
  const isImage = qaAttachmentService.isImage(attachment);
  const isVideo = qaAttachmentService.isVideo(attachment);
  const config = sizeConfig[size];

  const renderThumbnail = () => {
    if (isImage) {
      return (
        <img
          src={qaAttachmentService.getServeUrl(attachment)}
          alt={attachment.originalName}
          className="w-full h-full object-cover"
        />
      );
    }

    if (isVideo) {
      return (
        <div className="w-full h-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
          <VideoCameraIcon className={cn(config.icon, 'text-purple-500')} />
        </div>
      );
    }

    // Document or other
    return (
      <div className="w-full h-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
        <DocumentIcon className={cn(config.icon, 'text-gray-500')} />
      </div>
    );
  };

  const getFileTypeLabel = () => {
    if (isImage) return 'Image';
    if (isVideo) return 'Video';
    const ext = attachment.originalName.split('.').pop()?.toUpperCase();
    return ext || 'File';
  };

  return (
    <div
      className={cn(
        'group relative rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700',
        config.container,
        className
      )}
    >
      {renderThumbnail()}

      {/* Overlay with actions */}
      {showActions && (
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
          {(isImage || isVideo) && onView && (
            <button
              type="button"
              onClick={onView}
              className="p-1.5 bg-white/20 rounded-lg hover:bg-white/30 transition-colors"
              title="View"
            >
              <EyeIcon className="w-4 h-4 text-white" />
            </button>
          )}
          <a
            href={qaAttachmentService.getDownloadUrl(attachment)}
            download={attachment.originalName}
            className="p-1.5 bg-white/20 rounded-lg hover:bg-white/30 transition-colors"
            title="Download"
          >
            <ArrowDownTrayIcon className="w-4 h-4 text-white" />
          </a>
          {onDelete && (
            <button
              type="button"
              onClick={onDelete}
              className="p-1.5 bg-white/20 rounded-lg hover:bg-red-500/80 transition-colors"
              title="Delete"
            >
              <TrashIcon className="w-4 h-4 text-white" />
            </button>
          )}
        </div>
      )}

      {/* File type badge */}
      <div className="absolute bottom-1 right-1 px-1.5 py-0.5 bg-black/60 rounded text-[10px] font-medium text-white">
        {getFileTypeLabel()}
      </div>
    </div>
  );
}

// Compact list view variant
export function AttachmentListItem({
  attachment,
  onView,
  onDelete,
  showActions = true,
}: AttachmentPreviewProps) {
  const isImage = qaAttachmentService.isImage(attachment);
  const isVideo = qaAttachmentService.isVideo(attachment);

  const getIcon = () => {
    if (isImage) return <PhotoIcon className="w-5 h-5 text-blue-500" />;
    if (isVideo) return <VideoCameraIcon className="w-5 h-5 text-purple-500" />;
    return <DocumentIcon className="w-5 h-5 text-gray-500" />;
  };

  return (
    <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg group">
      <div className="flex items-center gap-3 overflow-hidden">
        {isImage ? (
          <img
            src={qaAttachmentService.getServeUrl(attachment)}
            alt={attachment.originalName}
            className="w-10 h-10 rounded object-cover"
          />
        ) : (
          <div className="w-10 h-10 rounded bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
            {getIcon()}
          </div>
        )}
        <div className="overflow-hidden">
          <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
            {attachment.originalName}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {qaAttachmentService.formatFileSize(attachment.size)}
          </p>
        </div>
      </div>

      {showActions && (
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {(isImage || isVideo) && onView && (
            <button
              type="button"
              onClick={onView}
              className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              title="View"
            >
              <EyeIcon className="w-4 h-4" />
            </button>
          )}
          <a
            href={qaAttachmentService.getDownloadUrl(attachment)}
            download={attachment.originalName}
            className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            title="Download"
          >
            <ArrowDownTrayIcon className="w-4 h-4" />
          </a>
          {onDelete && (
            <button
              type="button"
              onClick={onDelete}
              className="p-1.5 text-gray-400 hover:text-red-500"
              title="Delete"
            >
              <TrashIcon className="w-4 h-4" />
            </button>
          )}
        </div>
      )}
    </div>
  );
}
