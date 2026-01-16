import { useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeftIcon, BugAntIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { bugService } from '@/services/bug.service';
import { qaAttachmentService } from '@/services/qaAttachment.service';
import { CreateBugData, UpdateBugData, Bug } from '@/types/qa.types';
import BugForm from '@/components/qa/BugForm';
import Button from '@/components/ui/Button';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';

export default function BugFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();
  const isEditing = !!id;

  // Get pre-filled values from URL params (when creating from failed test)
  const testCaseId = searchParams.get('testCaseId') || undefined;
  const taskId = searchParams.get('taskId') || undefined;
  const projectId = searchParams.get('projectId') || undefined;

  // Fetch existing bug when editing
  const { data: bug, isLoading } = useQuery({
    queryKey: ['bug', id],
    queryFn: () => bugService.getById(id!),
    enabled: isEditing,
  });

  const [isUploadingAttachments, setIsUploadingAttachments] = useState(false);

  // Create mutation with attachment handling
  const createMutation = useMutation({
    mutationFn: async ({ data, pendingFiles }: { data: CreateBugData; pendingFiles?: File[] }) => {
      // First create the bug
      const createdBug = await bugService.create(data);

      // If there are pending files, upload them
      if (pendingFiles && pendingFiles.length > 0 && createdBug.id) {
        setIsUploadingAttachments(true);
        try {
          await qaAttachmentService.uploadMultiple(pendingFiles, { bugId: createdBug.id });
        } catch (uploadError) {
          console.error('Failed to upload some attachments:', uploadError);
          toast.error('Bug created but some attachments failed to upload');
        }
        setIsUploadingAttachments(false);
      }

      return createdBug;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bugs'] });
      toast.success('Bug reported successfully!');
      navigate('/qa/bugs');
    },
    onError: (error: any) => {
      setIsUploadingAttachments(false);
      toast.error(error.response?.data?.message || 'Failed to report bug');
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: (data: UpdateBugData) => bugService.update(id!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bugs'] });
      queryClient.invalidateQueries({ queryKey: ['bug', id] });
      toast.success('Bug updated successfully!');
      navigate('/qa/bugs');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update bug');
    },
  });

  const handleSubmit = (data: CreateBugData | UpdateBugData, pendingFiles?: File[]) => {
    if (isEditing) {
      updateMutation.mutate(data as UpdateBugData);
    } else {
      createMutation.mutate({ data: data as CreateBugData, pendingFiles });
    }
  };

  if (isEditing && isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-redstone-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => navigate(-1)}>
          <ArrowLeftIcon className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <BugAntIcon className="w-7 h-7 text-redstone-500" />
            {isEditing ? 'Edit Bug' : 'Report Bug'}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            {isEditing ? 'Update the bug details' : 'Report a new bug or defect'}
          </p>
        </div>
      </div>

      {/* Form Card */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Bug Details
          </h2>
        </CardHeader>
        <CardContent>
          <BugForm
            bug={bug}
            testCaseId={testCaseId}
            taskId={taskId}
            projectId={projectId}
            onSubmit={handleSubmit}
            onCancel={() => navigate(-1)}
            isSubmitting={createMutation.isPending || updateMutation.isPending || isUploadingAttachments}
          />
        </CardContent>
      </Card>
    </div>
  );
}
