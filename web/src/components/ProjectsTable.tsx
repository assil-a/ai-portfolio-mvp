import React, { useState, useMemo } from 'react';
import { ExternalLink, Eye, RefreshCw, Search, Plus } from 'lucide-react';
import { useProjects, useRefreshProject } from '../hooks/useProjects';
import { formatRelativeTime, formatDateTime } from '../utils/formatters';

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
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-400">Failed to load projects</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Projects</h1>
          <p className="text-slate-400">Manage and track your GitHub repositories</p>
        </div>
        <button
          onClick={onAddRepo}
          className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl"
        >
          <Plus size={16} />
          <span className="font-medium">Add Repository</span>
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={20} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Search repositories..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-12 pr-4 py-3 bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Table */}
      <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 overflow-hidden">
        <table className="min-w-full divide-y divide-slate-700/50">
          <thead className="bg-slate-700/30">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                Repository
              </th>
              <th 
                className="px-6 py-4 text-left text-xs font-medium text-slate-300 uppercase tracking-wider cursor-pointer hover:bg-slate-700/50 transition-colors"
                onClick={toggleSort}
              >
                Last Activity {sortOrder === 'desc' ? '↓' : '↑'}
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                Contributors (90d)
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                Default Branch
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                Visibility
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700/30">
            {filteredProjects.map((project) => (
              <tr key={project.id} className="hover:bg-slate-700/30 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div>
                      <div className="text-sm font-medium text-white">
                        {project.owner}/{project.name}
                      </div>
                      <a
                        href={project.html_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-400 hover:text-blue-300 flex items-center transition-colors"
                      >
                        <ExternalLink size={12} className="mr-1" />
                        GitHub
                      </a>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-white">
                    {project.last_commit_at ? (
                      <span title={formatDateTime(project.last_commit_at)}>
                        {formatRelativeTime(project.last_commit_at)}
                      </span>
                    ) : (
                      'No activity'
                    )}
                  </div>
                  {project.last_actor && (
                    <div className="text-sm text-slate-400">by {project.last_actor}</div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm text-white">{project.active_contributors_90d}</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm text-white">{project.default_branch || 'N/A'}</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    project.visibility === 'public' 
                      ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                      : 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                  }`}>
                    {project.visibility}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => onViewProject(project.id)}
                      className="text-blue-400 hover:text-blue-300 transition-colors"
                      title="View details"
                    >
                      <Eye size={16} />
                    </button>
                    <button
                      onClick={(e) => handleRefresh(project.id, e)}
                      disabled={refreshProject.isPending}
                      className="text-slate-400 hover:text-white disabled:opacity-50 transition-colors"
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
            <p className="text-slate-400">
              {searchTerm ? 'No repositories match your search.' : 'No repositories added yet.'}
            </p>
            {!searchTerm && (
              <button
                onClick={onAddRepo}
                className="mt-4 text-blue-400 hover:text-blue-300 transition-colors"
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