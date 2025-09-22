import { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
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

function App() {
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-gray-100">
        <div className="container mx-auto px-4 py-8">
          <ProjectsTable
            onViewProject={setSelectedProjectId}
            onAddRepo={() => setIsAddModalOpen(true)}
          />
        </div>

        <ProjectDetail
          projectId={selectedProjectId}
          onClose={() => setSelectedProjectId(null)}
        />

        <AddRepoModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
        />
      </div>
    </QueryClientProvider>
  );
}

export default App;
