'use client';

import { useState, useEffect } from 'react';
import { getAuthToken } from '@/lib/utils/auth.utils';
import { COMPONENT_STATUS_CONFIG } from '@/lib/constants/status.constants';

interface Component {
  _id: string;
  name: string;
  status: string;
  description?: string;
}

interface Group {
  _id: string;
  name: string;
  description: string;
  components: Component[];
}

interface UpdateGroupModalProps {
  isOpen: boolean;
  group: Group | null;
  onClose: () => void;
  onSuccess: () => void;
}

export default function UpdateGroupModal({ isOpen, group, onClose, onSuccess }: UpdateGroupModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [allComponents, setAllComponents] = useState<Component[]>([]);
  const [selectedComponentIds, setSelectedComponentIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [loadingComponents, setLoadingComponents] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && group) {
      setName(group.name);
      setDescription(group.description);
      loadComponents();
    } else {
      setName('');
      setDescription('');
      setSelectedComponentIds(new Set());
      setError(null);
    }
  }, [isOpen, group]);

  const loadComponents = async () => {
    if (!group) return;

    try {
      setLoadingComponents(true);
      const token = getAuthToken();
      
      if (!token) {
        setError('Not authenticated');
        return;
      }

      const response = await fetch('/api/admin/components', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch components');
      }

      const components = await response.json();
      
      // Pre-select components that are already in this group
      const currentComponentIds = new Set<string>(
        group.components.map(c => c._id)
      );
      
      setAllComponents(components);
      setSelectedComponentIds(currentComponentIds);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load components');
    } finally {
      setLoadingComponents(false);
    }
  };

  const handleComponentToggle = (componentId: string) => {
    setSelectedComponentIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(componentId)) {
        newSet.delete(componentId);
      } else {
        newSet.add(componentId);
      }
      return newSet;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!group) return;
    
    if (!name.trim()) {
      setError('Please enter a group name');
      return;
    }
    
    if (!description.trim()) {
      setError('Please enter a description');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const token = getAuthToken();
      
      if (!token) {
        setError('Not authenticated');
        return;
      }

      const response = await fetch(`/api/admin/groups/${group._id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim(),
          components: Array.from(selectedComponentIds),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update group');
      }

      onSuccess();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update group');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !group) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div 
        className="bg-white dark:bg-zinc-900 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] flex flex-col"
      >
        {/* Header */}
        <div className="px-6 py-4 bg-green-50 dark:bg-green-900/30 rounded-t-lg border-b border-zinc-200 dark:border-zinc-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 text-green-600 dark:text-green-400">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-bold text-green-600 dark:text-green-400">
                  Edit Group
                </h2>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  Manage components for &quot;{group.name}&quot;
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              disabled={loading}
              className="text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200 disabled:opacity-50"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-4">
            {/* Error Message */}
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
                </div>
              </div>
            )}

            {/* Group Details Section */}
            <div className="bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-4">
                <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                </svg>
                <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                  Group Details
                </h3>
              </div>

              {/* Group Name */}
              <div className="mb-3">
                <label htmlFor="name" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  Group Name *
                </label>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., Core Services, External APIs, Infrastructure"
                  disabled={loading}
                  className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-md bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-green-600 dark:focus:ring-green-400 disabled:opacity-50"
                  required
                />
              </div>

              {/* Group Description */}
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  Description *
                </label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Brief description of what this group contains"
                  rows={2}
                  disabled={loading}
                  className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-md bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-green-600 dark:focus:ring-green-400 disabled:opacity-50"
                  required
                />
              </div>
            </div>

            {/* Component Selection */}
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                Select Components
              </label>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 mb-2">
                Choose which components belong to this group
              </p>
              
              {loadingComponents ? (
                <div className="flex items-center justify-center py-8 border border-zinc-300 dark:border-zinc-700 rounded-md">
                  <div className="text-zinc-500 dark:text-zinc-400">Loading components...</div>
                </div>
              ) : allComponents.length === 0 ? (
                <div className="py-8 border border-zinc-300 dark:border-zinc-700 rounded-md bg-orange-50 dark:bg-orange-900/20">
                  <div className="flex items-center justify-center gap-2 text-orange-600 dark:text-orange-400">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <p className="text-sm">No components available. Create components first.</p>
                  </div>
                </div>
              ) : (
                <div className="border border-zinc-300 dark:border-zinc-700 rounded-md max-h-80 overflow-y-auto">
                  {allComponents.map(component => {
                    const isSelected = selectedComponentIds.has(component._id);
                    const statusConfig = COMPONENT_STATUS_CONFIG[component.status as keyof typeof COMPONENT_STATUS_CONFIG] || {
                      color: 'bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-300',
                      icon: '?',
                      label: component.status
                    };
                    
                    return (
                      <div
                        key={component._id}
                        className="p-3 border-b border-zinc-200 dark:border-zinc-800 last:border-b-0 hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
                      >
                        <div className="flex items-start gap-3">
                          <input
                            type="checkbox"
                            id={`component-${component._id}`}
                            checked={isSelected}
                            onChange={() => handleComponentToggle(component._id)}
                            disabled={loading}
                            className="mt-1 w-4 h-4 rounded border-zinc-300 dark:border-zinc-700 text-green-600 focus:ring-2 focus:ring-green-600 dark:focus:ring-green-400 disabled:opacity-50"
                          />
                          <div className="flex-1">
                            <label
                              htmlFor={`component-${component._id}`}
                              className="block font-medium text-zinc-900 dark:text-zinc-100 cursor-pointer"
                            >
                              {component.name}
                            </label>
                            {component.description && (
                              <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-0.5">
                                {component.description}
                              </p>
                            )}
                            <div className="flex items-center gap-1 mt-1">
                              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${statusConfig.color}`}>
                                {statusConfig.icon} {statusConfig.label}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 bg-zinc-50 dark:bg-zinc-800 rounded-b-lg border-t border-zinc-200 dark:border-zinc-700">
            <div className="flex justify-between items-center">
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                {selectedComponentIds.size} component{selectedComponentIds.size !== 1 ? 's' : ''} selected
              </p>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={loading}
                  className="px-4 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-md hover:bg-zinc-50 dark:hover:bg-zinc-800 disabled:opacity-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 text-sm font-medium text-white bg-green-600 dark:bg-green-500 rounded-md hover:bg-green-700 dark:hover:bg-green-600 disabled:opacity-50 transition-colors flex items-center gap-2"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Updating...
                    </>
                  ) : (
                    'Update Group'
                  )}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
