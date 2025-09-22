import { useQuery } from '@tanstack/react-query';
import { 
  Plus, 
  GitBranch, 
  Users, 
  Activity, 
  TrendingUp,
  Calendar,
  Star,
  Eye
} from 'lucide-react';
import { projectsApi } from '../api/client';

interface DashboardProps {
  onAddRepo: () => void;
}

export function Dashboard({ onAddRepo }: DashboardProps) {
  const { data, isLoading } = useQuery({
    queryKey: ['projects'],
    queryFn: () => projectsApi.getProjects(),
  });

  const projects = data?.projects || [];

  // Calculate metrics
  const totalRepos = projects.length;
  const totalContributors = projects.reduce((sum: number, project) => sum + (project.active_contributors_90d || 0), 0);
  const recentActivity = projects.filter(project => {
    if (!project.last_commit_at) return false;
    const lastCommit = new Date(project.last_commit_at);
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    return lastCommit > sevenDaysAgo;
  }).length;

  const publicRepos = projects.filter(p => p.visibility === 'public').length;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
          <p className="text-slate-400">Welcome back! Here's your portfolio overview.</p>
        </div>
        <button
          onClick={onAddRepo}
          className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl"
        >
          <Plus className="w-5 h-5" />
          <span className="font-medium">Add Repository</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Repositories"
          value={totalRepos.toString()}
          change="+12%"
          icon={GitBranch}
          gradient="from-blue-500 to-cyan-500"
        />
        <StatCard
          title="Active Contributors"
          value={totalContributors.toString()}
          change="+8%"
          icon={Users}
          gradient="from-green-500 to-emerald-500"
        />
        <StatCard
          title="Recent Activity"
          value={recentActivity.toString()}
          change="+23%"
          icon={Activity}
          gradient="from-purple-500 to-pink-500"
        />
        <StatCard
          title="Public Repos"
          value={publicRepos.toString()}
          change="+5%"
          icon={Eye}
          gradient="from-orange-500 to-red-500"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Projects */}
        <div className="lg:col-span-2">
          <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Recent Projects</h2>
              <button className="text-blue-400 hover:text-blue-300 text-sm font-medium">
                View All
              </button>
            </div>
            
            {isLoading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-16 bg-slate-700/50 rounded-xl"></div>
                  </div>
                ))}
              </div>
            ) : projects.length === 0 ? (
              <div className="text-center py-12">
                <GitBranch className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-slate-400 mb-2">No repositories yet</h3>
                <p className="text-slate-500 mb-4">Start by adding your first repository to track.</p>
                <button
                  onClick={onAddRepo}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Add Repository
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {projects.slice(0, 5).map((project) => (
                  <div
                    key={project.id}
                    className="flex items-center justify-between p-4 bg-slate-700/30 rounded-xl hover:bg-slate-700/50 transition-colors"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                        <GitBranch className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="text-white font-medium">{project.owner}/{project.name}</h3>
                        <p className="text-slate-400 text-sm">
                          {project.last_commit_at 
                            ? `Updated ${new Date(project.last_commit_at).toLocaleDateString()}`
                            : 'No recent activity'
                          }
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-slate-400">
                      <div className="flex items-center space-x-1">
                        <Users className="w-4 h-4" />
                        <span>{project.active_contributors_90d || 0}</span>
                      </div>
                      <div className={`px-2 py-1 rounded-full text-xs ${
                        project.visibility === 'public' 
                          ? 'bg-green-500/20 text-green-400' 
                          : 'bg-orange-500/20 text-orange-400'
                      }`}>
                        {project.visibility}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Activity Overview */}
        <div className="space-y-6">
          {/* Activity Chart Placeholder */}
          <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6">
            <h3 className="text-lg font-bold text-white mb-4">Activity Overview</h3>
            <div className="h-48 bg-gradient-to-br from-blue-500/10 to-purple-600/10 rounded-xl flex items-center justify-center">
              <div className="text-center">
                <TrendingUp className="w-12 h-12 text-blue-400 mx-auto mb-2" />
                <p className="text-slate-400 text-sm">Activity chart coming soon</p>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6">
            <h3 className="text-lg font-bold text-white mb-4">Quick Stats</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4 text-blue-400" />
                  <span className="text-slate-300 text-sm">This Week</span>
                </div>
                <span className="text-white font-medium">{recentActivity} active</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Star className="w-4 h-4 text-yellow-400" />
                  <span className="text-slate-300 text-sm">Top Language</span>
                </div>
                <span className="text-white font-medium">TypeScript</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Activity className="w-4 h-4 text-green-400" />
                  <span className="text-slate-300 text-sm">Avg Contributors</span>
                </div>
                <span className="text-white font-medium">
                  {totalRepos > 0 ? Math.round(totalContributors / totalRepos) : 0}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

interface StatCardProps {
  title: string;
  value: string;
  change: string;
  icon: React.ComponentType<{ className?: string }>;
  gradient: string;
}

function StatCard({ title, value, change, icon: Icon, gradient }: StatCardProps) {
  return (
    <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6 hover:bg-slate-800/70 transition-all duration-200">
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 bg-gradient-to-r ${gradient} rounded-xl flex items-center justify-center`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        <span className="text-green-400 text-sm font-medium">{change}</span>
      </div>
      <div>
        <h3 className="text-2xl font-bold text-white mb-1">{value}</h3>
        <p className="text-slate-400 text-sm">{title}</p>
      </div>
    </div>
  );
}