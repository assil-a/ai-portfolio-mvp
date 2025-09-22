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