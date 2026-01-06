export type UserRole = 'ADMIN' | 'PROJECT_MANAGER' | 'OPERATIONAL_MANAGER' | 'BIDDER' | 'WEB_DEVELOPER' | 'APP_DEVELOPER' | 'DESIGNER' | 'QC';
export type UserType = 'INHOUSE' | 'FREELANCER';
export type ClientType = 'UPWORK' | 'DIRECT' | 'FREELANCER';
export type ProjectStatus = 'PLANNING' | 'IN_PROGRESS' | 'ON_HOLD' | 'COMPLETED' | 'CANCELLED';
export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'IN_REVIEW' | 'COMPLETED' | 'BLOCKED';
export type ReviewStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'NEEDS_CHANGES';
export type MilestoneStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  userType: UserType;
  avatar?: string;
  phone?: string;
  monthlySalary?: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Client {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  company?: string;
  clientType: ClientType;
  upworkProfile?: string;
  website?: string;
  address?: string;
  notes?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  _count?: {
    projects: number;
  };
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  clientId: string;
  status: ProjectStatus;
  startDate?: string;
  endDate?: string;
  budget?: number;
  currency: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  client?: Client;
  members?: ProjectMember[];
  _count?: {
    tasks: number;
    members: number;
  };
}

export interface ProjectMember {
  id: string;
  projectId: string;
  userId: string;
  role: string;
  joinedAt: string;
  user?: Pick<User, 'id' | 'firstName' | 'lastName' | 'email' | 'avatar'>;
}

export interface Milestone {
  id: string;
  projectId: string;
  title: string;
  description?: string;
  amount?: number;
  currency: string;
  status: MilestoneStatus;
  dueDate?: string;
  releasedAt?: string;
  createdAt: string;
  updatedAt: string;
  project?: Pick<Project, 'id' | 'name'>;
  tasks?: Task[];
  progress?: number;
  completedTasks?: number;
  totalTasks?: number;
  totalTimeSeconds?: number;
  _count?: {
    tasks: number;
  };
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  projectId: string;
  milestoneId?: string;
  assigneeId?: string;
  createdById: string;
  status: TaskStatus;
  priority: TaskPriority;
  estimatedHours?: number;
  dueDate?: string;
  completedAt?: string;
  order: number;
  createdAt: string;
  updatedAt: string;
  // QC Review fields
  reviewStatus?: ReviewStatus;
  reviewComment?: string;
  reviewedById?: string;
  reviewedAt?: string;
  hasBugs?: boolean;
  project?: Pick<Project, 'id' | 'name' | 'client'>;
  milestone?: Pick<Milestone, 'id' | 'title' | 'status'>;
  assignee?: Pick<User, 'id' | 'firstName' | 'lastName' | 'avatar'>;
  createdBy?: Pick<User, 'id' | 'firstName' | 'lastName'>;
  reviewedBy?: Pick<User, 'id' | 'firstName' | 'lastName'>;
  totalTimeSeconds?: number;
  _count?: {
    timeEntries: number;
    comments: number;
  };
}

export interface TimeEntry {
  id: string;
  taskId: string;
  userId: string;
  startTime: string;
  endTime?: string;
  duration?: number;
  notes?: string;
  isBillable: boolean;
  createdAt: string;
  updatedAt: string;
  task?: Pick<Task, 'id' | 'title' | 'project'>;
  user?: Pick<User, 'id' | 'firstName' | 'lastName'>;
}

export interface ActiveTimer {
  timeEntryId: string;
  taskId: string;
  taskTitle: string;
  projectName: string;
  startTime: string;
  elapsedSeconds: number;
}

export interface DashboardStats {
  totalProjects: number;
  totalTasks: number;
  totalClients: number;
  totalDevelopers: number;
  totalTrackedHours: number;
  projectsByStatus: Record<string, number>;
  tasksByStatus: Record<string, number>;
  recentActivities: ActivitySummary[];
}

export interface DeveloperStats {
  assignedTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  totalTrackedHours: number;
  weeklyHours: number;
  monthlyHours: number;
  activeTimer: ActiveTimer | null;
}

export interface ActivitySummary {
  id: string;
  action: string;
  entityType: string;
  userName: string;
  createdAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  data?: Record<string, unknown>;
  createdAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: Record<string, string[]>;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}
