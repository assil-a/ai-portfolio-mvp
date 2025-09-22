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
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="flex">
          <Sidebar currentView={currentView} onViewChange={setCurrentView} />
          
          <main className="flex-1 ml-64 p-8">
            <div className="max-w-7xl mx-auto">
              {renderContent()}
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
