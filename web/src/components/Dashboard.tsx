import { useQuery } from '@tanstack/react-query';
import { 
  Plus, 
  GitBranch, 
  Users, 
  Activity, 
  TrendingUp,
  Calendar,
  Star,
  Eye,
  ArrowRight
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
    <div className="space-y-10">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div className="space-y-3">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-white via-blue-100 to-purple-200 bg-clip-text text-transparent">
            Dashboard
          </h1>
          <p className="text-slate-300 text-xl font-medium">Welcome back! Here's your portfolio overview.</p>
          <div className="flex items-center space-x-2 text-slate-400">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-sm">Live data • Updated just now</span>
          </div>
        </div>
        <button
          onClick={onAddRepo}
          className="group flex items-center space-x-3 px-8 py-4 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white rounded-2xl hover:shadow-2xl hover:shadow-blue-500/25 transition-all duration-300 transform hover:scale-105 hover:-translate-y-1"
        >
          <div className="p-1 bg-white/20 rounded-lg group-hover:bg-white/30 transition-all duration-300">
            <Plus className="w-5 h-5" />
          </div>
          <span className="font-semibold text-lg">Add Repository</span>
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
          <div className="bg-slate-800/40 backdrop-blur-2xl rounded-3xl border border-slate-700/30 p-8 hover:bg-slate-800/50 transition-all duration-300">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center">
                  <GitBranch className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-white to-slate-200 bg-clip-text text-transparent">Recent Projects</h2>
              </div>
              <button className="group flex items-center space-x-2 px-4 py-2 bg-blue-500/20 text-blue-400 rounded-xl hover:bg-blue-500/30 hover:text-blue-300 transition-all duration-300 border border-blue-500/30">
                <span className="text-sm font-semibold">View All</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
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
              <div className="space-y-5">
                {projects.slice(0, 5).map((project, index) => (
                  <div
                    key={project.id}
                    className="group relative flex items-center justify-between p-6 bg-slate-700/20 backdrop-blur-xl rounded-2xl border border-slate-600/20 hover:bg-slate-700/40 hover:border-slate-500/30 transition-all duration-300 transform hover:scale-[1.02] hover:-translate-y-1"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    {/* Gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 rounded-2xl transition-all duration-300"></div>
                    
                    <div className="relative z-10 flex items-center space-x-5">
                      <div className="relative">
                        <div className="w-14 h-14 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300">
                          <GitBranch className="w-6 h-6 text-white" />
                        </div>
                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-slate-800 animate-pulse"></div>
                      </div>
                      <div className="space-y-1">
                        <h3 className="text-white font-bold text-lg group-hover:text-blue-200 transition-colors duration-300">
                          {project.owner}/{project.name}
                        </h3>
                        <p className="text-slate-400 text-sm font-medium">
                          {project.last_commit_at 
                            ? `Updated ${new Date(project.last_commit_at).toLocaleDateString()}`
                            : 'No recent activity'
                          }
                        </p>
                      </div>
                    </div>
                    
                    <div className="relative z-10 flex items-center space-x-6">
                      <div className="flex items-center space-x-2 text-slate-300">
                        <div className="p-2 bg-slate-600/30 rounded-lg">
                          <Users className="w-4 h-4" />
                        </div>
                        <span className="font-semibold">{project.active_contributors_90d || 0}</span>
                      </div>
                      <div className={`px-4 py-2 rounded-xl text-sm font-semibold border ${
                        project.visibility === 'public' 
                          ? 'bg-green-500/20 text-green-400 border-green-500/30' 
                          : 'bg-orange-500/20 text-orange-400 border-orange-500/30'
                      }`}>
                        {project.visibility}
                      </div>
                      <button className="p-2 text-slate-400 hover:text-white hover:bg-slate-600/50 rounded-lg transition-all duration-300">
                        <ArrowRight className="w-4 h-4" />
                      </button>
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
    <div className="group relative bg-slate-800/40 backdrop-blur-2xl rounded-3xl border border-slate-700/30 p-8 hover:bg-slate-800/60 hover:border-slate-600/50 transition-all duration-500 transform hover:scale-105 hover:-translate-y-2 hover:shadow-2xl hover:shadow-blue-500/10">
      {/* Gradient overlay */}
      <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-10 rounded-3xl transition-all duration-500`}></div>
      
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-6">
          <div className={`relative w-16 h-16 bg-gradient-to-br ${gradient} rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300`}>
            <Icon className="w-8 h-8 text-white" />
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-slate-800 animate-pulse"></div>
          </div>
          <div className="text-right">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-green-500/20 text-green-400 border border-green-500/30">
              <TrendingUp className="w-3 h-3 mr-1" />
              {change}
            </span>
          </div>
        </div>
        
        <div className="space-y-2">
          <h3 className="text-4xl font-bold bg-gradient-to-r from-white to-slate-200 bg-clip-text text-transparent">
            {value}
          </h3>
          <p className="text-slate-400 text-base font-medium">{title}</p>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute bottom-4 right-4 opacity-20 group-hover:opacity-40 transition-all duration-300">
          <div className={`w-8 h-8 bg-gradient-to-br ${gradient} rounded-lg rotate-12`}></div>
        </div>
      </div>
    </div>
  );
}