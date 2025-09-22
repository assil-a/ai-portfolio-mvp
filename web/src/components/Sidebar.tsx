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
    <div className="fixed left-0 top-0 h-full w-64 bg-slate-900/50 backdrop-blur-xl border-r border-slate-700/50">
      {/* Logo */}
      <div className="p-6 border-b border-slate-700/50">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <Github className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-white font-bold text-lg">AI Portfolio</h1>
            <p className="text-slate-400 text-xs">Console</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="p-4 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                isActive
                  ? 'bg-gradient-to-r from-blue-500/20 to-purple-600/20 text-white border border-blue-500/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Account Section */}
      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-700/50">
        <div className="space-y-2">
          <button className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/50 transition-all duration-200">
            <Settings className="w-5 h-5" />
            <span className="font-medium">Settings</span>
          </button>
          
          <div className="flex items-center space-x-3 px-4 py-3">
            <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-medium truncate">Developer</p>
              <p className="text-slate-400 text-xs truncate">Portfolio Manager</p>
            </div>
            <button className="text-slate-400 hover:text-white transition-colors">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}