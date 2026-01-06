import api from './api';
import { ApiResponse, PaginatedResponse, Client, ClientType } from '@/types';

export interface CreateClientData {
  name: string;
  email?: string;
  phone?: string;
  company?: string;
  clientType: ClientType;
  upworkProfile?: string;
  website?: string;
  address?: string;
  notes?: string;
}

export interface UpdateClientData extends Partial<CreateClientData> {
  isActive?: boolean;
}

export interface ClientFilters {
  page?: number;
  limit?: number;
  clientType?: ClientType;
  search?: string;
  isActive?: boolean;
}

export const clientService = {
  async getAll(filters: ClientFilters = {}): Promise<PaginatedResponse<Client>> {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        params.append(key, String(value));
      }
    });

    const response = await api.get<ApiResponse<PaginatedResponse<Client>>>(
      `/clients?${params}`
    );
    return response.data.data!;
  },

  async getById(id: string): Promise<Client> {
    const response = await api.get<ApiResponse<Client>>(`/clients/${id}`);
    return response.data.data!;
  },

  async getAllSimple(): Promise<Pick<Client, 'id' | 'name' | 'company' | 'clientType'>[]> {
    const response = await api.get<ApiResponse<any[]>>('/clients/all');
    return response.data.data!;
  },

  async create(data: CreateClientData): Promise<Client> {
    const response = await api.post<ApiResponse<Client>>('/clients', data);
    return response.data.data!;
  },

  async update(id: string, data: UpdateClientData): Promise<Client> {
    const response = await api.patch<ApiResponse<Client>>(`/clients/${id}`, data);
    return response.data.data!;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/clients/${id}`);
  },
};
