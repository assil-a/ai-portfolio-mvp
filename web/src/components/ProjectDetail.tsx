import React from 'react';
import { X, RefreshCw, ExternalLink, GitBranch, Users, Calendar, User } from 'lucide-react';
import { useProject, useRefreshProject } from '../hooks/useProjects';
import { formatRelativeTime, formatDateTime, getVisibilityBadgeColor, getInstallStatusColor } from '../utils/formatters';

interface ProjectDetailProps {
  projectId: string | null;
  onClose: () => void;
}

export const ProjectDetail: React.FC<ProjectDetailProps> = ({ projectId, onClose }) => {
  const { data: project, isLoading, error } = useProject(projectId || '');
  const refreshProject = useRefreshProject();

  const handleRefresh = async () => {
    if (projectId) {
      try {
        await refreshProject.mutateAsync(projectId);
      } catch (error) {
        console.error('Failed to refresh project:', error);
      }
    }
  };

  if (!projectId) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-end z-50">
      <div className="bg-white h-full w-full max-w-2xl overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold">Project Details</h2>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleRefresh}
              disabled={refreshProject.isPending}
              className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50"
              title="Refresh project data"
            >
              <RefreshCw size={20} className={refreshProject.isPending ? 'animate-spin' : ''} />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        <div className="p-6">
          {isLoading && (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          )}

          {error && (
            <div className="text-center py-12">
              <p className="text-red-600">Failed to load project details</p>
            </div>
          )}

          {project && (
            <div className="space-y-6">
              {/* Header */}
              <div>
                <div className="flex items-center space-x-3 mb-2">
                  <h3 className="text-2xl font-bold">{project.owner}/{project.name}</h3>
                  <a
                    href={project.html_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <ExternalLink size={20} />
                  </a>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getVisibilityBadgeColor(project.visibility || '')}`}>
                    {project.visibility}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getInstallStatusColor(project.install_status)}`}>
                    {project.install_status}
                  </span>
                </div>
              </div>

              {/* Metadata */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center mb-2">
                    <GitBranch size={16} className="text-gray-500 mr-2" />
                    <span className="font-medium">Default Branch</span>
                  </div>
                  <p className="text-gray-700">{project.default_branch || 'N/A'}</p>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center mb-2">
                    <Users size={16} className="text-gray-500 mr-2" />
                    <span className="font-medium">Active Contributors (90d)</span>
                  </div>
                  <p className="text-gray-700">{project.active_contributors_90d}</p>
                </div>
              </div>

              {/* Last Activity */}
              {project.last_commit_at && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center mb-2">
                    <Calendar size={16} className="text-gray-500 mr-2" />
                    <span className="font-medium">Last Activity</span>
                  </div>
                  <p className="text-gray-700">
                    {formatRelativeTime(project.last_commit_at)}
                    <span className="text-gray-500 ml-2">
                      ({formatDateTime(project.last_commit_at)})
                    </span>
                  </p>
                  {project.last_actor && (
                    <div className="flex items-center mt-2">
                      <User size={14} className="text-gray-400 mr-1" />
                      <span className="text-sm text-gray-600">by {project.last_actor}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Contributors */}
              {project.contributors_90d && project.contributors_90d.length > 0 && (
                <div>
                  <h4 className="text-lg font-semibold mb-3">Contributors (Last 90 Days)</h4>
                  <div className="space-y-2">
                    {project.contributors_90d.map((contributor) => (
                      <div key={contributor.login} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center">
                          <User size={16} className="text-gray-500 mr-2" />
                          <span className="font-medium">{contributor.login}</span>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium">{contributor.commits} commits</div>
                          {contributor.last_commit_at && (
                            <div className="text-xs text-gray-500">
                              Last: {formatRelativeTime(contributor.last_commit_at)}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Latest Open PR */}
              {project.last_open_pr && (
                <div>
                  <h4 className="text-lg font-semibold mb-3">Latest Open Pull Request</h4>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="font-medium">#{project.last_open_pr.number}</span>
                        <span className="text-gray-500 ml-2">by {project.last_open_pr.author}</span>
                      </div>
                      <div className="text-sm text-gray-500">
                        Updated {formatRelativeTime(project.last_open_pr.updated_at)}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Timestamps */}
              <div className="text-xs text-gray-500 pt-4 border-t border-gray-200">
                <div>Created: {formatDateTime(project.created_at)}</div>
                <div>Updated: {formatDateTime(project.updated_at)}</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};