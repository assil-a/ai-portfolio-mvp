import axios from 'axios';
import type { 
  Project, 
  ProjectDetail, 
  ProjectsResponse, 
  CreateProjectRequest 
} from '../types/project';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:43620';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const projectsApi = {
  getProjects: async (params?: {
    order?: string;
    limit?: number;
    offset?: number;
  }): Promise<ProjectsResponse> => {
    const response = await apiClient.get('/projects', { params });
    return response.data;
  },

  getProject: async (id: string): Promise<ProjectDetail> => {
    const response = await apiClient.get(`/projects/${id}`);
    return response.data;
  },

  createProject: async (data: CreateProjectRequest): Promise<Project> => {
    const response = await apiClient.post('/projects', data);
    return response.data;
  },

  refreshProject: async (id: string): Promise<Project> => {
    const response = await apiClient.post(`/projects/${id}/refresh`);
    return response.data;
  },
};

export const healthApi = {
  check: async (): Promise<{ status: string }> => {
    const response = await apiClient.get('/healthz');
    return response.data;
  },
};