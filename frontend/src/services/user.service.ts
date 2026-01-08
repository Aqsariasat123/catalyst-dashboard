import api from './api';
import { ApiResponse, PaginatedResponse, User, UserRole, UserType } from '@/types';

export interface CreateUserData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  userType: UserType;
  phone?: string;
  monthlySalary?: number;
}

export interface UpdateUserData {
  firstName?: string;
  lastName?: string;
  role?: UserRole;
  userType?: UserType;
  phone?: string;
  monthlySalary?: number;
  isActive?: boolean;
}

export interface UserFilters {
  page?: number;
  limit?: number;
  role?: UserRole;
  userType?: UserType;
  search?: string;
}

export const userService = {
  async getAll(filters: UserFilters = {}): Promise<PaginatedResponse<User>> {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        params.append(key, String(value));
      }
    });

    const response = await api.get<ApiResponse<PaginatedResponse<User>>>(
      `/users?${params}`
    );
    return response.data.data!;
  },

  async getById(id: string): Promise<User> {
    const response = await api.get<ApiResponse<User>>(`/users/${id}`);
    return response.data.data!;
  },

  async getDevelopers(): Promise<Pick<User, 'id' | 'firstName' | 'lastName' | 'email' | 'userType'>[]> {
    const response = await api.get<ApiResponse<any[]>>('/users/developers');
    return response.data.data!;
  },

  async create(data: CreateUserData): Promise<User> {
    const response = await api.post<ApiResponse<User>>('/users', data);
    return response.data.data!;
  },

  async update(id: string, data: UpdateUserData): Promise<User> {
    const response = await api.patch<ApiResponse<User>>(`/users/${id}`, data);
    return response.data.data!;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/users/${id}`);
  },

  async deactivate(id: string): Promise<User> {
    const response = await api.post<ApiResponse<User>>(`/users/${id}/deactivate`);
    return response.data.data!;
  },

  async updatePermissions(id: string, permissions: string[]): Promise<User> {
    const response = await api.patch<ApiResponse<User>>(`/users/${id}/permissions`, { permissions });
    return response.data.data!;
  },
};
