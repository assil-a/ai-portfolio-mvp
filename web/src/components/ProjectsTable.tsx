import React, { useState, useMemo } from 'react';
import { ExternalLink, Eye, RefreshCw, Search, Plus } from 'lucide-react';
import { useProjects, useRefreshProject } from '../hooks/useProjects';
import { formatRelativeTime, formatDateTime, getVisibilityBadgeColor } from '../utils/formatters';

interface ProjectsTableProps {
  onViewProject: (projectId: string) => void;
  onAddRepo: () => void;
}

export const ProjectsTable: React.FC<ProjectsTableProps> = ({ onViewProject, onAddRepo }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  
  const { data, isLoading, error } = useProjects({
    order: `last_activity_at_${sortOrder}`,
    limit: 50,
    offset: 0,
  });
  
  const refreshProject = useRefreshProject();

  const filteredProjects = useMemo(() => {
    if (!data?.projects) return [];
    
    return data.projects.filter(project => 
      project.owner.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [data?.projects, searchTerm]);

  const handleRefresh = async (projectId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await refreshProject.mutateAsync(projectId);
    } catch (error) {
      console.error('Failed to refresh project:', error);
    }
  };

  const toggleSort = () => {
    setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">Failed to load projects</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">AI Portfolio Console</h1>
        <button
          onClick={onAddRepo}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus size={16} className="mr-2" />
          Add Repository
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Search repositories..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Repository
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={toggleSort}
              >
                Last Activity {sortOrder === 'desc' ? '↓' : '↑'}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Contributors (90d)
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Default Branch
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Visibility
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredProjects.map((project) => (
              <tr key={project.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {project.owner}/{project.name}
                      </div>
                      <a
                        href={project.html_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
                      >
                        <ExternalLink size={12} className="mr-1" />
                        GitHub
                      </a>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {project.last_commit_at ? (
                      <span title={formatDateTime(project.last_commit_at)}>
                        {formatRelativeTime(project.last_commit_at)}
                      </span>
                    ) : (
                      'No activity'
                    )}
                  </div>
                  {project.last_actor && (
                    <div className="text-sm text-gray-500">by {project.last_actor}</div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm text-gray-900">{project.active_contributors_90d}</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm text-gray-900">{project.default_branch || 'N/A'}</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getVisibilityBadgeColor(project.visibility || '')}`}>
                    {project.visibility}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => onViewProject(project.id)}
                      className="text-blue-600 hover:text-blue-900"
                      title="View details"
                    >
                      <Eye size={16} />
                    </button>
                    <button
                      onClick={(e) => handleRefresh(project.id, e)}
                      disabled={refreshProject.isPending}
                      className="text-gray-600 hover:text-gray-900 disabled:opacity-50"
                      title="Refresh"
                    >
                      <RefreshCw size={16} className={refreshProject.isPending ? 'animate-spin' : ''} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredProjects.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">
              {searchTerm ? 'No repositories match your search.' : 'No repositories added yet.'}
            </p>
            {!searchTerm && (
              <button
                onClick={onAddRepo}
                className="mt-4 text-blue-600 hover:text-blue-800"
              >
                Add your first repository
              </button>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      {data && (
        <div className="text-sm text-gray-500 text-center">
          Showing {filteredProjects.length} of {data.total} repositories
        </div>
      )}
    </div>
  );
};