import { useEffect, useCallback } from 'react';
import {
  XMarkIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ArrowDownTrayIcon,
  MagnifyingGlassPlusIcon,
  MagnifyingGlassMinusIcon,
} from '@heroicons/react/24/outline';
import { QAAttachment } from '@/types/qa.types';
import { qaAttachmentService } from '@/services/qaAttachment.service';
import { useState } from 'react';

interface AttachmentViewerProps {
  attachment: QAAttachment;
  onClose: () => void;
  onPrev?: () => void;
  onNext?: () => void;
  currentIndex?: number;
  totalCount?: number;
}

export default function AttachmentViewer({
  attachment,
  onClose,
  onPrev,
  onNext,
  currentIndex,
  totalCount,
}: AttachmentViewerProps) {
  const [zoom, setZoom] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  const isImage = qaAttachmentService.isImage(attachment);
  const isVideo = qaAttachmentService.isVideo(attachment);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      switch (e.key) {
        case 'Escape':
          onClose();
          break;
        case 'ArrowLeft':
          onPrev?.();
          break;
        case 'ArrowRight':
          onNext?.();
          break;
        case '+':
        case '=':
          setZoom((z) => Math.min(z + 0.25, 3));
          break;
        case '-':
          setZoom((z) => Math.max(z - 0.25, 0.5));
          break;
      }
    },
    [onClose, onPrev, onNext]
  );

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [handleKeyDown]);

  // Reset zoom when attachment changes
  useEffect(() => {
    setZoom(1);
    setIsLoading(true);
  }, [attachment.id]);

  const zoomIn = () => setZoom((z) => Math.min(z + 0.25, 3));
  const zoomOut = () => setZoom((z) => Math.max(z - 0.25, 0.5));
  const resetZoom = () => setZoom(1);

  return (
    <div className="fixed inset-0 z-[80] bg-black/95 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-black/50">
        <div className="flex items-center gap-4">
          <h3 className="text-white font-medium truncate max-w-md">{attachment.originalName}</h3>
          {currentIndex && totalCount && (
            <span className="text-gray-400 text-sm">
              {currentIndex} / {totalCount}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {isImage && (
            <>
              <button
                type="button"
                onClick={zoomOut}
                disabled={zoom <= 0.5}
                className="p-2 text-white hover:bg-white/10 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                title="Zoom out"
              >
                <MagnifyingGlassMinusIcon className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={resetZoom}
                className="px-2 py-1 text-sm text-white hover:bg-white/10 rounded-lg transition-colors min-w-[60px]"
                title="Reset zoom"
              >
                {Math.round(zoom * 100)}%
              </button>
              <button
                type="button"
                onClick={zoomIn}
                disabled={zoom >= 3}
                className="p-2 text-white hover:bg-white/10 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                title="Zoom in"
              >
                <MagnifyingGlassPlusIcon className="w-5 h-5" />
              </button>
              <div className="w-px h-6 bg-gray-700 mx-2" />
            </>
          )}
          <a
            href={qaAttachmentService.getDownloadUrl(attachment)}
            download={attachment.originalName}
            className="p-2 text-white hover:bg-white/10 rounded-lg transition-colors"
            title="Download"
          >
            <ArrowDownTrayIcon className="w-5 h-5" />
          </a>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-white hover:bg-white/10 rounded-lg transition-colors"
            title="Close (Esc)"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center p-4 overflow-auto">
        {/* Navigation buttons */}
        {onPrev && (
          <button
            type="button"
            onClick={onPrev}
            className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-black/50 hover:bg-black/70 rounded-full text-white transition-colors z-10"
            title="Previous (Left Arrow)"
          >
            <ChevronLeftIcon className="w-6 h-6" />
          </button>
        )}
        {onNext && (
          <button
            type="button"
            onClick={onNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-black/50 hover:bg-black/70 rounded-full text-white transition-colors z-10"
            title="Next (Right Arrow)"
          >
            <ChevronRightIcon className="w-6 h-6" />
          </button>
        )}

        {/* Media content */}
        <div className="relative max-w-full max-h-full overflow-auto">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white" />
            </div>
          )}

          {isImage && (
            <img
              src={qaAttachmentService.getServeUrl(attachment)}
              alt={attachment.originalName}
              className="max-w-none transition-transform duration-200"
              style={{ transform: `scale(${zoom})`, transformOrigin: 'center' }}
              onLoad={() => setIsLoading(false)}
              onError={() => setIsLoading(false)}
              draggable={false}
            />
          )}

          {isVideo && (
            <video
              src={qaAttachmentService.getServeUrl(attachment)}
              controls
              autoPlay
              className="max-w-full max-h-[80vh]"
              onLoadedData={() => setIsLoading(false)}
            >
              Your browser does not support the video tag.
            </video>
          )}
        </div>
      </div>

      {/* Footer with file info */}
      <div className="px-4 py-2 bg-black/50 text-center">
        <p className="text-gray-400 text-sm">
          {qaAttachmentService.formatFileSize(attachment.size)} • {attachment.mimeType}
        </p>
      </div>
    </div>
  );
}
