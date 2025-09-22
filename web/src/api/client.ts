import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:43619';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface Project {
  id: string;
  owner: string;
  name: string;
  html_url: string;
  default_branch?: string;
  visibility?: string;
  last_commit_at?: string;
  last_actor?: string;
  active_contributors_90d: number;
  install_status: string;
  created_at: string;
  updated_at: string;
}

export interface ProjectDetail extends Project {
  contributors_90d: ContributorDetail[];
  last_open_pr?: LastOpenPR;
  default_branch_ref?: string;
}

export interface ContributorDetail {
  login: string;
  commits: number;
  last_commit_at?: string;
}

export interface LastOpenPR {
  number: number;
  updated_at: string;
  author: string;
}

export interface ProjectsResponse {
  projects: Project[];
  total: number;
  limit: number;
  offset: number;
}

export interface CreateProjectRequest {
  repo_url: string;
}

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