import { 
  LayoutDashboard, 
  FolderGit2, 
  BarChart3, 
  Settings, 
  User,
  LogOut,
  Github
} from 'lucide-react';

interface SidebarProps {
  currentView: 'dashboard' | 'projects' | 'analytics';
  onViewChange: (view: 'dashboard' | 'projects' | 'analytics') => void;
}

export function Sidebar({ currentView, onViewChange }: SidebarProps) {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'projects', label: 'Projects', icon: FolderGit2 },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  ] as const;

  return (
    <div className="fixed left-0 top-0 h-full w-72 bg-slate-900/80 backdrop-blur-2xl border-r border-slate-700/30 shadow-2xl">
      {/* Logo */}
      <div className="p-8 border-b border-slate-700/30">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg">
              <Github className="w-6 h-6 text-white" />
            </div>
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-slate-900 animate-pulse"></div>
          </div>
          <div>
            <h1 className="text-white font-bold text-xl bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              AI Portfolio
            </h1>
            <p className="text-slate-400 text-sm font-medium">Console Dashboard</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="p-6 space-y-3">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              className={`group w-full flex items-center space-x-4 px-6 py-4 rounded-2xl transition-all duration-300 transform hover:scale-105 ${
                isActive
                  ? 'bg-gradient-to-r from-blue-500/30 to-purple-600/30 text-white border border-blue-400/50 shadow-lg shadow-blue-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60 hover:shadow-lg'
              }`}
            >
              <div className={`p-2 rounded-xl transition-all duration-300 ${
                isActive 
                  ? 'bg-gradient-to-r from-blue-500 to-purple-600 shadow-lg' 
                  : 'bg-slate-700/50 group-hover:bg-slate-600/50'
              }`}>
                <Icon className="w-5 h-5" />
              </div>
              <span className="font-semibold text-base">{item.label}</span>
              {isActive && (
                <div className="ml-auto w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
              )}
            </button>
          );
        })}
      </nav>

      {/* Account Section */}
      <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-slate-700/30">
        <div className="space-y-4">
          <button className="group w-full flex items-center space-x-4 px-6 py-3 rounded-2xl text-slate-400 hover:text-white hover:bg-slate-800/60 transition-all duration-300 transform hover:scale-105">
            <div className="p-2 rounded-xl bg-slate-700/50 group-hover:bg-slate-600/50 transition-all duration-300">
              <Settings className="w-4 h-4" />
            </div>
            <span className="font-semibold">Settings</span>
          </button>
          
          <div className="flex items-center space-x-4 px-4 py-4 bg-slate-800/40 rounded-2xl border border-slate-700/30">
            <div className="relative">
              <div className="w-10 h-10 bg-gradient-to-br from-green-400 via-blue-500 to-purple-500 rounded-2xl flex items-center justify-center shadow-lg">
                <User className="w-5 h-5 text-white" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-slate-900"></div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-bold truncate">Developer</p>
              <p className="text-slate-400 text-xs truncate">Portfolio Manager</p>
            </div>
            <button className="text-slate-400 hover:text-white transition-all duration-300 hover:scale-110">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}