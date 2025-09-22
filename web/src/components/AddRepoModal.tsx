import React, { useState } from 'react';
import { X, Plus, AlertCircle } from 'lucide-react';
import { useCreateProject } from '../hooks/useProjects';

interface AddRepoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AddRepoModal: React.FC<AddRepoModalProps> = ({ isOpen, onClose }) => {
  const [repoUrl, setRepoUrl] = useState('');
  const createProject = useCreateProject();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!repoUrl.trim()) return;

    try {
      await createProject.mutateAsync({ repo_url: repoUrl.trim() });
      setRepoUrl('');
      onClose();
    } catch (error) {
      console.error('Failed to add repository:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-slate-800/90 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6 w-full max-w-md mx-4 shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">Add Repository</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors"
            disabled={createProject.isPending}
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label htmlFor="repo-url" className="block text-sm font-medium text-slate-300 mb-3">
              GitHub Repository URL
            </label>
            <input
              id="repo-url"
              type="url"
              value={repoUrl}
              onChange={(e) => setRepoUrl(e.target.value)}
              placeholder="https://github.com/owner/repo"
              className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              disabled={createProject.isPending}
              required
            />
          </div>

          {createProject.error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex items-start">
              <AlertCircle className="text-red-400 mr-3 mt-0.5 flex-shrink-0" size={16} />
              <div className="text-sm text-red-300">
                {createProject.error instanceof Error 
                  ? createProject.error.message 
                  : 'Failed to add repository. Please try again.'}
              </div>
            </div>
          )}

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 text-sm font-medium text-slate-300 bg-slate-700/50 hover:bg-slate-700 rounded-xl transition-colors"
              disabled={createProject.isPending}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createProject.isPending || !repoUrl.trim()}
              className="px-6 py-3 text-sm font-medium text-white bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center transition-all shadow-lg hover:shadow-xl"
            >
              {createProject.isPending ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Adding...
                </>
              ) : (
                <>
                  <Plus size={16} className="mr-2" />
                  Add Repository
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};