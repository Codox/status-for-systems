'use client';

import { useState, useEffect } from 'react';
import { getAuthToken } from '@/lib/utils/auth.utils';

interface Component {
  _id: string;
  name: string;
  status: string;
  description?: string;
}

interface CreateIncidentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const STATUS_OPTIONS = ['investigating', 'identified', 'monitoring', 'resolved'];
const IMPACT_OPTIONS = ['none', 'minor', 'major', 'critical'];
const COMPONENT_STATUS_OPTIONS = ['operational', 'under_maintenance', 'degraded', 'partial', 'major'];

const COMPONENT_STATUS_COLORS: Record<string, string> = {
  operational: 'bg-green-500',
  under_maintenance: 'bg-blue-500',
  degraded: 'bg-yellow-500',
  partial: 'bg-orange-500',
  major: 'bg-red-500',
};

export default function CreateIncidentModal({ isOpen, onClose, onSuccess }: CreateIncidentModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('investigating');
  const [impact, setImpact] = useState('minor');
  const [components, setComponents] = useState<Component[]>([]);
  const [selectedComponents, setSelectedComponents] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [loadingComponents, setLoadingComponents] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchComponents();
    } else {
      // Reset form when modal closes
      setTitle('');
      setDescription('');
      setStatus('investigating');
      setImpact('minor');
      setSelectedComponents({});
      setError(null);
    }
  }, [isOpen]);

  const fetchComponents = async () => {
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

      const data = await response.json();
      setComponents(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load components');
    } finally {
      setLoadingComponents(false);
    }
  };

  const handleComponentToggle = (componentId: string) => {
    setSelectedComponents(prev => {
      const newSelected = { ...prev };
      if (newSelected[componentId]) {
        delete newSelected[componentId];
      } else {
        newSelected[componentId] = 'degraded';
      }
      return newSelected;
    });
  };

  const handleComponentStatusChange = (componentId: string, newStatus: string) => {
    setSelectedComponents(prev => ({
      ...prev,
      [componentId]: newStatus,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      setError('Please enter an incident title');
      return;
    }
    
    if (!description.trim()) {
      setError('Please enter a description');
      return;
    }

    if (Object.keys(selectedComponents).length === 0) {
      setError('Please select at least one affected component');
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

      const affectedComponents = Object.entries(selectedComponents).map(([id, componentStatus]) => ({
        id,
        status: componentStatus,
      }));

      const response = await fetch('/api/admin/incidents', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          title,
          description,
          status,
          impact,
          affectedComponents,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create incident');
      }

      onSuccess();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create incident');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div 
        className="bg-white dark:bg-zinc-900 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 bg-zinc-50 dark:bg-zinc-800 rounded-t-lg border-b border-zinc-200 dark:border-zinc-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 text-red-600 dark:text-red-400">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
                Create New Incident
              </h2>
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

            {/* Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                Incident Title *
              </label>
              <input
                id="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Brief description of the incident"
                disabled={loading}
                className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-md bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 disabled:opacity-50"
                required
              />
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                Description *
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Detailed description of the incident"
                rows={3}
                disabled={loading}
                className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-md bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 disabled:opacity-50"
                required
              />
            </div>

            {/* Status and Impact */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="status" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  Status *
                </label>
                <select
                  id="status"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  disabled={loading}
                  className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-md bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 disabled:opacity-50"
                >
                  {STATUS_OPTIONS.map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="impact" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  Impact *
                </label>
                <select
                  id="impact"
                  value={impact}
                  onChange={(e) => setImpact(e.target.value)}
                  disabled={loading}
                  className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-md bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 disabled:opacity-50"
                >
                  {IMPACT_OPTIONS.map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Affected Components */}
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                Affected Components *
              </label>
              
              {loadingComponents ? (
                <div className="flex items-center justify-center py-8 border border-zinc-300 dark:border-zinc-700 rounded-md">
                  <div className="text-zinc-500 dark:text-zinc-400">Loading components...</div>
                </div>
              ) : components.length === 0 ? (
                <div className="py-8 border border-zinc-300 dark:border-zinc-700 rounded-md text-center">
                  <p className="text-zinc-500 dark:text-zinc-400">No components available</p>
                </div>
              ) : (
                <div className="border border-zinc-300 dark:border-zinc-700 rounded-md max-h-80 overflow-y-auto">
                  {components.map(component => {
                    const isSelected = selectedComponents[component._id] !== undefined;
                    const componentStatus = selectedComponents[component._id] || 'degraded';
                    
                    return (
                      <div
                        key={component._id}
                        className="p-4 border-b border-zinc-200 dark:border-zinc-800 last:border-b-0"
                      >
                        <div className="flex items-start gap-3">
                          <input
                            type="checkbox"
                            id={`component-${component._id}`}
                            checked={isSelected}
                            onChange={() => handleComponentToggle(component._id)}
                            disabled={loading}
                            className="mt-1 w-4 h-4 rounded border-zinc-300 dark:border-zinc-700 text-zinc-900 focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 disabled:opacity-50"
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
                            
                            {isSelected && (
                              <div className="mt-2">
                                <select
                                  value={componentStatus}
                                  onChange={(e) => handleComponentStatusChange(component._id, e.target.value)}
                                  disabled={loading}
                                  className="w-full px-3 py-1.5 text-sm border border-zinc-300 dark:border-zinc-700 rounded-md bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 disabled:opacity-50"
                                >
                                  {COMPONENT_STATUS_OPTIONS.map(opt => (
                                    <option key={opt} value={opt}>
                                      {opt.replace(/_/g, ' ')}
                                    </option>
                                  ))}
                                </select>
                              </div>
                            )}
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
            <div className="flex justify-end gap-3">
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
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 dark:bg-red-500 rounded-md hover:bg-red-700 dark:hover:bg-red-600 disabled:opacity-50 transition-colors flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Creating...
                  </>
                ) : (
                  'Create Incident'
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
