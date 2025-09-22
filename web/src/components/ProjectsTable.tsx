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
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-3">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-white via-blue-100 to-purple-200 bg-clip-text text-transparent">
            Projects
          </h1>
          <p className="text-slate-300 text-xl font-medium">Manage and track your GitHub repositories</p>
          <div className="flex items-center space-x-2 text-slate-400">
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
            <span className="text-sm">Real-time repository tracking</span>
          </div>
        </div>
        <button
          onClick={onAddRepo}
          className="group flex items-center space-x-3 px-8 py-4 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white rounded-2xl hover:shadow-2xl hover:shadow-blue-500/25 transition-all duration-300 transform hover:scale-105 hover:-translate-y-1"
        >
          <div className="p-1 bg-white/20 rounded-lg group-hover:bg-white/30 transition-all duration-300">
            <Plus size={20} />
          </div>
          <span className="font-semibold text-lg">Add Repository</span>
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={24} className="absolute left-6 top-1/2 transform -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Search repositories..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-16 pr-6 py-5 bg-slate-800/40 backdrop-blur-2xl border border-slate-700/30 rounded-2xl text-white text-lg placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 focus:bg-slate-800/60 transition-all duration-300"
        />
      </div>

      {/* Projects Grid */}
      <div className="space-y-6">
        {/* Sort Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={toggleSort}
              className="flex items-center space-x-2 px-4 py-2 bg-slate-800/40 backdrop-blur-xl border border-slate-700/30 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800/60 transition-all duration-300"
            >
              <span className="text-sm font-medium">Last Activity</span>
              <span className="text-blue-400">{sortOrder === 'desc' ? '↓' : '↑'}</span>
            </button>
          </div>
          <div className="text-slate-400 text-sm">
            {filteredProjects.length} repositories
          </div>
        </div>

        {/* Projects Cards */}
        {filteredProjects.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-24 h-24 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <ExternalLink className="w-12 h-12 text-slate-400" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-3">
              {searchTerm ? 'No repositories match your search' : 'No repositories yet'}
            </h3>
            <p className="text-slate-400 text-lg mb-8">
              {searchTerm ? 'Try adjusting your search terms.' : 'Start by adding your first repository to track.'}
            </p>
            {!searchTerm && (
              <button
                onClick={onAddRepo}
                className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl hover:shadow-xl hover:shadow-blue-500/25 transition-all duration-300 transform hover:scale-105"
              >
                Add Repository
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredProjects.map((project, index) => (
              <div
                key={project.id}
                className="group relative bg-slate-800/40 backdrop-blur-2xl rounded-3xl border border-slate-700/30 p-8 hover:bg-slate-800/60 hover:border-slate-600/50 transition-all duration-500 transform hover:scale-105 hover:-translate-y-2 hover:shadow-2xl hover:shadow-blue-500/10"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 rounded-3xl transition-all duration-500"></div>
                
                <div className="relative z-10">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex items-center space-x-4">
                      <div className="relative">
                        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300">
                          <ExternalLink className="w-8 h-8 text-white" />
                        </div>
                        <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-400 rounded-full border-2 border-slate-800 animate-pulse"></div>
                      </div>
                      <div className="space-y-1">
                        <h3 className="text-xl font-bold text-white group-hover:text-blue-200 transition-colors duration-300">
                          {project.name}
                        </h3>
                        <p className="text-slate-400 text-sm font-medium">{project.owner}</p>
                      </div>
                    </div>
                    
                    <div className={`px-3 py-1 rounded-xl text-xs font-semibold border ${
                      project.visibility === 'public' 
                        ? 'bg-green-500/20 text-green-400 border-green-500/30' 
                        : 'bg-orange-500/20 text-orange-400 border-orange-500/30'
                    }`}>
                      {project.visibility}
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-slate-700/30 rounded-2xl p-4">
                      <div className="flex items-center space-x-2 mb-2">
                        <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
                          <Eye className="w-4 h-4 text-blue-400" />
                        </div>
                        <span className="text-slate-400 text-sm">Contributors</span>
                      </div>
                      <p className="text-2xl font-bold text-white">{project.active_contributors_90d}</p>
                    </div>
                    
                    <div className="bg-slate-700/30 rounded-2xl p-4">
                      <div className="flex items-center space-x-2 mb-2">
                        <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center">
                          <ExternalLink className="w-4 h-4 text-purple-400" />
                        </div>
                        <span className="text-slate-400 text-sm">Branch</span>
                      </div>
                      <p className="text-lg font-semibold text-white truncate">{project.default_branch || 'N/A'}</p>
                    </div>
                  </div>

                  {/* Last Activity */}
                  <div className="mb-6">
                    <div className="flex items-center space-x-2 mb-2">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                      <span className="text-slate-400 text-sm">Last Activity</span>
                    </div>
                    <p className="text-white font-medium">
                      {project.last_commit_at ? (
                        <span title={formatDateTime(project.last_commit_at)}>
                          {formatRelativeTime(project.last_commit_at)}
                        </span>
                      ) : (
                        'No activity'
                      )}
                    </p>
                    {project.last_actor && (
                      <p className="text-slate-400 text-sm">by {project.last_actor}</p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between">
                    <a
                      href={project.html_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-2 px-4 py-2 bg-blue-500/20 text-blue-400 rounded-xl hover:bg-blue-500/30 hover:text-blue-300 transition-all duration-300 border border-blue-500/30"
                    >
                      <ExternalLink className="w-4 h-4" />
                      <span className="text-sm font-semibold">GitHub</span>
                    </a>
                    
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => onViewProject(project.id)}
                        className="p-3 text-slate-400 hover:text-white hover:bg-slate-600/50 rounded-xl transition-all duration-300"
                        title="View details"
                      >
                        <Eye className="w-5 h-5" />
                      </button>
                      <button
                        onClick={(e) => handleRefresh(project.id, e)}
                        disabled={refreshProject.isPending}
                        className="p-3 text-slate-400 hover:text-white hover:bg-slate-600/50 disabled:opacity-50 rounded-xl transition-all duration-300"
                        title="Refresh"
                      >
                        <RefreshCw className={`w-5 h-5 ${refreshProject.isPending ? 'animate-spin' : ''}`} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
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