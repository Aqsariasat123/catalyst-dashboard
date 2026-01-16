import { useAuthStore } from '@/stores/authStore';

export interface QAPermissions {
  // Dashboard
  canViewDashboard: boolean;

  // Test Cases
  canViewTestCases: boolean;
  canCreateTestCase: boolean;
  canEditTestCase: (createdById: string) => boolean;
  canDeleteTestCase: boolean;

  // Test Executions
  canExecuteTests: boolean;
  canViewExecutions: boolean;

  // Bugs
  canViewBugs: boolean;
  canCreateBug: boolean;
  canEditBug: (reportedById: string) => boolean;
  canUpdateBugStatus: (assignedToId?: string) => boolean;
  canDeleteBug: boolean;
  canAssignBug: boolean;

  // Reports
  canViewReports: boolean;
  canExportReports: boolean;

  // Attachments
  canUploadAttachments: boolean;
  canDeleteAttachments: (uploadedById: string) => boolean;

  // Settings
  canManageQASettings: boolean;

  // Helper
  isQCOrHigher: boolean;
  isAdmin: boolean;
}

export const useQAPermissions = (): QAPermissions => {
  const { user } = useAuthStore();
  const role = user?.role;
  const userId = user?.id;

  // Role checks
  const isAdmin = role === 'ADMIN';
  const isProjectManager = role === 'PROJECT_MANAGER';
  const isQC = role === 'QC';
  const isDeveloper = role === 'DEVELOPER' || role === 'DESIGNER';

  // Combined role checks
  const isAdminOrPM = isAdmin || isProjectManager;
  const isQCOrHigher = isAdmin || isProjectManager || isQC;

  return {
    // Dashboard - everyone can view
    canViewDashboard: true,

    // Test Cases
    canViewTestCases: true,
    canCreateTestCase: isQCOrHigher,
    canEditTestCase: (createdById: string) => {
      if (isAdminOrPM) return true;
      // QC can only edit their own test cases
      return isQC && userId === createdById;
    },
    canDeleteTestCase: isAdminOrPM,

    // Test Executions
    canExecuteTests: isQCOrHigher,
    canViewExecutions: true,

    // Bugs
    canViewBugs: true,
    canCreateBug: isQCOrHigher,
    canEditBug: (reportedById: string) => {
      if (isAdminOrPM) return true;
      // QC can edit bugs they reported
      return isQC && userId === reportedById;
    },
    canUpdateBugStatus: (assignedToId?: string) => {
      if (isAdminOrPM || isQC) return true;
      // Developers can only update bugs assigned to them
      return isDeveloper && userId === assignedToId;
    },
    canDeleteBug: isAdminOrPM,
    canAssignBug: isQCOrHigher,

    // Reports - everyone can view and export
    canViewReports: true,
    canExportReports: true,

    // Attachments
    canUploadAttachments: isQCOrHigher,
    canDeleteAttachments: (uploadedById: string) => {
      if (isAdminOrPM) return true;
      return userId === uploadedById;
    },

    // Settings
    canManageQASettings: isAdminOrPM,

    // Helpers
    isQCOrHigher,
    isAdmin,
  };
};

export default useQAPermissions;
