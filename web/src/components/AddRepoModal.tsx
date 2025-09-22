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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Add Repository</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
            disabled={createProject.isPending}
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="repo-url" className="block text-sm font-medium text-gray-700 mb-2">
              GitHub Repository URL
            </label>
            <input
              id="repo-url"
              type="url"
              value={repoUrl}
              onChange={(e) => setRepoUrl(e.target.value)}
              placeholder="https://github.com/owner/repo"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={createProject.isPending}
              required
            />
          </div>

          {createProject.error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md flex items-start">
              <AlertCircle className="text-red-500 mr-2 mt-0.5" size={16} />
              <div className="text-sm text-red-700">
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
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
              disabled={createProject.isPending}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createProject.isPending || !repoUrl.trim()}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
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