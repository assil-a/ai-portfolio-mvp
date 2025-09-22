import { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { ProjectsTable } from './components/ProjectsTable';
import { ProjectDetail } from './components/ProjectDetail';
import { AddRepoModal } from './components/AddRepoModal';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

type ViewType = 'dashboard' | 'projects' | 'analytics';

function App() {
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [currentView, setCurrentView] = useState<ViewType>('dashboard');

  const renderContent = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard onAddRepo={() => setIsAddModalOpen(true)} />;
      case 'projects':
        return (
          <ProjectsTable
            onViewProject={setSelectedProjectId}
            onAddRepo={() => setIsAddModalOpen(true)}
          />
        );
      case 'analytics':
        return (
          <div className="text-white text-center py-20">
            <h2 className="text-2xl font-bold mb-4">Analytics</h2>
            <p className="text-gray-300">Advanced analytics coming soon...</p>
          </div>
        );
      default:
        return <Dashboard onAddRepo={() => setIsAddModalOpen(true)} />;
    }
  };

  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-950 to-slate-950 relative overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl animate-pulse delay-500"></div>
        </div>

        <div className="relative z-10 flex min-h-screen">
          <Sidebar currentView={currentView} onViewChange={setCurrentView} />
          
          <main className="flex-1 transition-all duration-300 ease-in-out" style={{ marginLeft: '280px' }}>
            <div className="p-8 max-w-7xl mx-auto">
              <div className="animate-fadeIn">
                {renderContent()}
              </div>
            </div>
          </main>

          <ProjectDetail
            projectId={selectedProjectId}
            onClose={() => setSelectedProjectId(null)}
          />

          <AddRepoModal
            isOpen={isAddModalOpen}
            onClose={() => setIsAddModalOpen(false)}
          />
        </div>
      </div>
    </QueryClientProvider>
  );
}

export default App;
