import { useCallback, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import {
  CloudArrowUpIcon,
  XMarkIcon,
  PhotoIcon,
  VideoCameraIcon,
  DocumentIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { qaAttachmentService, AttachmentContext } from '@/services/qaAttachment.service';
import { QAAttachment } from '@/types/qa.types';
import { cn } from '@/utils/helpers';

interface AttachmentUploaderProps {
  context: AttachmentContext;
  onUploadComplete?: (attachments: QAAttachment[]) => void;
  maxFiles?: number;
  maxFileSize?: number; // in MB
  acceptedTypes?: string[];
  className?: string;
}

const DEFAULT_MAX_FILE_SIZE = 10; // MB
const DEFAULT_ACCEPTED_TYPES = ['image/*', 'video/*', 'application/pdf', '.doc', '.docx', '.xls', '.xlsx'];

export default function AttachmentUploader({
  context,
  onUploadComplete,
  maxFiles = 10,
  maxFileSize = DEFAULT_MAX_FILE_SIZE,
  acceptedTypes = DEFAULT_ACCEPTED_TYPES,
  className,
}: AttachmentUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);

  const uploadMutation = useMutation({
    mutationFn: (files: File[]) => qaAttachmentService.uploadMultiple(files, context),
    onSuccess: (attachments) => {
      toast.success(`${attachments.length} file(s) uploaded successfully`);
      setPendingFiles([]);
      onUploadComplete?.(attachments);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to upload files');
    },
  });

  const validateFile = useCallback(
    (file: File): string | null => {
      // Check file size
      if (file.size > maxFileSize * 1024 * 1024) {
        return `File "${file.name}" exceeds ${maxFileSize}MB limit`;
      }

      // Check file type
      const isAccepted = acceptedTypes.some((type) => {
        if (type.endsWith('/*')) {
          const category = type.slice(0, -2);
          return file.type.startsWith(category);
        }
        if (type.startsWith('.')) {
          return file.name.toLowerCase().endsWith(type);
        }
        return file.type === type;
      });

      if (!isAccepted) {
        return `File type not accepted: ${file.name}`;
      }

      return null;
    },
    [maxFileSize, acceptedTypes]
  );

  const handleFiles = useCallback(
    (files: FileList | File[]) => {
      const fileArray = Array.from(files);
      const validFiles: File[] = [];
      const errors: string[] = [];

      for (const file of fileArray) {
        const error = validateFile(file);
        if (error) {
          errors.push(error);
        } else {
          validFiles.push(file);
        }
      }

      if (errors.length > 0) {
        errors.forEach((err) => toast.error(err));
      }

      if (validFiles.length > 0) {
        const newFiles = [...pendingFiles, ...validFiles].slice(0, maxFiles);
        setPendingFiles(newFiles);
      }
    },
    [validateFile, pendingFiles, maxFiles]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      handleFiles(e.dataTransfer.files);
    },
    [handleFiles]
  );

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files) {
        handleFiles(e.target.files);
      }
    },
    [handleFiles]
  );

  const removeFile = useCallback((index: number) => {
    setPendingFiles((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const handleUpload = useCallback(() => {
    if (pendingFiles.length > 0) {
      uploadMutation.mutate(pendingFiles);
    }
  }, [pendingFiles, uploadMutation]);

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) {
      return <PhotoIcon className="w-5 h-5 text-blue-500" />;
    }
    if (file.type.startsWith('video/')) {
      return <VideoCameraIcon className="w-5 h-5 text-purple-500" />;
    }
    return <DocumentIcon className="w-5 h-5 text-gray-500" />;
  };

  return (
    <div className={cn('space-y-4', className)}>
      {/* Drop Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          'border-2 border-dashed rounded-xl p-8 text-center transition-colors cursor-pointer',
          isDragging
            ? 'border-redstone-500 bg-redstone-50 dark:bg-redstone-500/10'
            : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
        )}
      >
        <input
          type="file"
          multiple
          accept={acceptedTypes.join(',')}
          onChange={handleInputChange}
          className="hidden"
          id="attachment-upload"
        />
        <label htmlFor="attachment-upload" className="cursor-pointer">
          <CloudArrowUpIcon
            className={cn(
              'w-12 h-12 mx-auto mb-4',
              isDragging ? 'text-redstone-500' : 'text-gray-400 dark:text-gray-500'
            )}
          />
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
            <span className="font-medium text-redstone-500">Click to upload</span> or drag and drop
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-500">
            Max {maxFileSize}MB per file. Max {maxFiles} files.
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
            Images, videos, and documents accepted
          </p>
        </label>
      </div>

      {/* Pending Files List */}
      {pendingFiles.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Files to upload ({pendingFiles.length})
          </p>
          <div className="space-y-2">
            {pendingFiles.map((file, index) => (
              <div
                key={`${file.name}-${index}`}
                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg"
              >
                <div className="flex items-center gap-3 overflow-hidden">
                  {getFileIcon(file)}
                  <div className="overflow-hidden">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {file.name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {qaAttachmentService.formatFileSize(file.size)}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => removeFile(index)}
                  className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                >
                  <XMarkIcon className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={handleUpload}
            disabled={uploadMutation.isPending}
            className="w-full py-2 px-4 bg-redstone-500 text-white rounded-lg hover:bg-redstone-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
          >
            {uploadMutation.isPending ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                Uploading...
              </>
            ) : (
              <>
                <CloudArrowUpIcon className="w-5 h-5" />
                Upload {pendingFiles.length} file(s)
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
