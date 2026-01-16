import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeftIcon, BeakerIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { testCaseService } from '@/services/testCase.service';
import { CreateTestCaseData, UpdateTestCaseData } from '@/types/qa.types';
import TestCaseForm from '@/components/qa/TestCaseForm';
import Button from '@/components/ui/Button';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';

export default function TestCaseFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isEditing = !!id;

  // Fetch existing test case when editing
  const { data: testCase, isLoading } = useQuery({
    queryKey: ['testCase', id],
    queryFn: () => testCaseService.getById(id!),
    enabled: isEditing,
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: (data: CreateTestCaseData) => testCaseService.create(data),
    onSuccess: (newTestCase) => {
      queryClient.invalidateQueries({ queryKey: ['testCases'] });
      toast.success('Test case created successfully!');
      navigate(`/qa/test-cases/${newTestCase.id}`);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create test case');
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: (data: UpdateTestCaseData) => testCaseService.update(id!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['testCases'] });
      queryClient.invalidateQueries({ queryKey: ['testCase', id] });
      toast.success('Test case updated successfully!');
      navigate(`/qa/test-cases/${id}`);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update test case');
    },
  });

  const handleSubmit = (data: CreateTestCaseData | UpdateTestCaseData) => {
    if (isEditing) {
      updateMutation.mutate(data as UpdateTestCaseData);
    } else {
      createMutation.mutate(data as CreateTestCaseData);
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
            <BeakerIcon className="w-7 h-7 text-redstone-500" />
            {isEditing ? 'Edit Test Case' : 'Create Test Case'}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            {isEditing ? 'Update the test case details' : 'Create a new test case for quality assurance'}
          </p>
        </div>
      </div>

      {/* Form Card */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Test Case Details
          </h2>
        </CardHeader>
        <CardContent>
          <TestCaseForm
            testCase={testCase}
            onSubmit={handleSubmit}
            onCancel={() => navigate(-1)}
            isSubmitting={createMutation.isPending || updateMutation.isPending}
          />
        </CardContent>
      </Card>
    </div>
  );
}
